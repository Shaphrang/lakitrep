import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getResortDashboardMetrics() {
  const supabase = await getSupabaseServerClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd");

  const [
    todayCheckins,
    todayCheckouts,
    newRequests,
    upcomingConfirmed,
    inHouse,
    pendingBills,
    todayCollection,
    monthCollection,
    activeCottages,
    blockedCottages,
  ] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("check_in_date", today).in("status", ["confirmed", "advance_paid"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("check_out_date", today).in("status", ["checked_in", "confirmed", "advance_paid"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["new_request", "pending"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).gte("check_in_date", today).in("status", ["confirmed", "advance_paid"]),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).gt("amount_pending", 0).in("status", ["checked_in", "checked_out", "confirmed", "advance_paid"]),
    supabase.from("booking_payments").select("amount"),
    supabase.from("booking_payments").select("amount,payment_date").gte("payment_date", monthStart),
    supabase.from("cottages").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("cottage_blocks").select("id", { count: "exact", head: true }).lte("start_date", today).gte("end_date", today),
  ]);

  const todayCollectionTotal = (todayCollection.data ?? []).reduce((sum, row) => {
    const paymentDate = String((row as { payment_date?: string }).payment_date ?? "").slice(0, 10);
    return paymentDate === today ? sum + Number((row as { amount?: number }).amount ?? 0) : sum;
  }, 0);

  const monthRevenue = (monthCollection.data ?? []).reduce((sum, row) => sum + Number((row as { amount?: number }).amount ?? 0), 0);
  const occupancy = (activeCottages.count ?? 0) > 0 ? Math.round(((inHouse.count ?? 0) / (activeCottages.count ?? 1)) * 100) : 0;

  return {
    todayCheckins: todayCheckins.count ?? 0,
    todayCheckouts: todayCheckouts.count ?? 0,
    newRequests: newRequests.count ?? 0,
    upcomingConfirmed: upcomingConfirmed.count ?? 0,
    inHouse: inHouse.count ?? 0,
    pendingBills: pendingBills.count ?? 0,
    todayCollection: todayCollectionTotal,
    monthRevenue,
    occupancy,
    blockedCottages: blockedCottages.count ?? 0,
  };
}

export async function getCustomers(params: { query?: string; source?: string; customerType?: string } = {}) {
  const supabase = await getSupabaseServerClient();
  let query = supabase
    .from("booking_guests")
    .select("id,full_name,phone,whatsapp_number,email,city,state,country,source,customer_type,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (params.source) query = query.eq("source", params.source);
  if (params.customerType) query = query.eq("customer_type", params.customerType);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load customers: ${error.message}`);

  let rows = (data ?? []) as Record<string, unknown>[];
  if (params.query?.trim()) {
    const q = params.query.toLowerCase();
    rows = rows.filter((row) =>
      [row.full_name, row.phone, row.whatsapp_number]
        .map((item) => String(item ?? "").toLowerCase())
        .some((value) => value.includes(q)),
    );
  }

  return rows;
}

export async function getCustomerById(customerId: string) {
  const supabase = await getSupabaseServerClient();
  const [{ data: customer, error: customerError }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabase.from("booking_guests").select("*").eq("id", customerId).maybeSingle(),
    supabase
      .from("bookings")
      .select("id,booking_code,status,check_in_date,check_out_date,final_total,amount_paid,amount_pending,cottages(name)")
      .eq("booking_guest_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  if (customerError) throw new Error(customerError.message);
  if (bookingsError) throw new Error(bookingsError.message);

  return { customer, bookings: bookings ?? [] };
}

export async function getManualBookingMeta() {
  const supabase = await getSupabaseServerClient();
  const [{ data: cottages }, { data: customers }] = await Promise.all([
    supabase.from("cottages").select("id,name,code,max_total_guests,weekday_price,weekend_price,status,is_bookable").eq("is_bookable", true).order("name"),
    supabase.from("booking_guests").select("id,full_name,phone").order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    cottages: cottages ?? [],
    customers: customers ?? [],
  };
}

export async function assertCottageAvailability(cottageId: string, checkInDate: string, checkOutDate: string, ignoreBookingId?: string) {
  const supabase = await getSupabaseServerClient();

  let bookingConflict = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("cottage_id", cottageId)
    .in("status", ["confirmed", "advance_paid", "checked_in"])
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate);

  if (ignoreBookingId) {
    bookingConflict = bookingConflict.neq("id", ignoreBookingId);
  }

  const blockConflict = supabase
    .from("cottage_blocks")
    .select("id", { count: "exact", head: true })
    .eq("cottage_id", cottageId)
    .lt("start_date", checkOutDate)
    .gt("end_date", checkInDate);

  const [bookings, blocks] = await Promise.all([bookingConflict, blockConflict]);

  return {
    hasConflict: (bookings.count ?? 0) > 0 || (blocks.count ?? 0) > 0,
  };
}

export async function getBillingContext(bookingId: string) {
  const supabase = await getSupabaseServerClient();
  const [{ data: booking }, { data: charges }, { data: payments }, { data: invoices }] = await Promise.all([
    supabase.from("bookings").select("id,booking_code,status,payment_status,check_in_date,check_out_date,total_amount,discount_amount,extra_charges_total,final_total,amount_paid,amount_pending,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone),cottages(name)").eq("id", bookingId).maybeSingle(),
    supabase.from("booking_charges").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false }),
    supabase.from("booking_payments").select("*").eq("booking_id", bookingId).order("payment_date", { ascending: false }),
    supabase.from("invoices").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false }),
  ]);

  return {
    booking,
    charges: charges ?? [],
    payments: payments ?? [],
    invoices: invoices ?? [],
  };
}

export async function recalculateBookingTotals(bookingId: string) {
  const supabase = await getSupabaseServerClient();
  const [{ data: booking }, { data: charges }, { data: payments }] = await Promise.all([
    supabase.from("bookings").select("id,total_amount,discount_amount").eq("id", bookingId).maybeSingle(),
    supabase.from("booking_charges").select("amount").eq("booking_id", bookingId),
    supabase.from("booking_payments").select("amount,payment_type").eq("booking_id", bookingId),
  ]);

  if (!booking) return;

  const extraChargesTotal = (charges ?? []).reduce((sum, row) => sum + Number((row as { amount?: number }).amount ?? 0), 0);
  const totalPaid = (payments ?? []).reduce((sum, row) => {
    const amount = Number((row as { amount?: number }).amount ?? 0);
    const type = String((row as { payment_type?: string }).payment_type ?? "");
    return type === "refund" ? sum - amount : sum + amount;
  }, 0);

  const bookingTotal = Number((booking as { total_amount?: number }).total_amount ?? 0);
  const discountAmount = Number((booking as { discount_amount?: number }).discount_amount ?? 0);
  const finalTotal = Math.max(0, bookingTotal + extraChargesTotal - discountAmount);
  const amountPending = Math.max(0, finalTotal - totalPaid);

  const paymentStatus = amountPending <= 0 ? "paid" : totalPaid > 0 ? "partially_paid" : "unpaid";

  await supabase
    .from("bookings")
    .update({
      extra_charges_total: extraChargesTotal,
      final_total: finalTotal,
      amount_paid: totalPaid,
      amount_pending: amountPending,
      payment_status: paymentStatus,
    })
    .eq("id", bookingId);
}

export function calculateNights(checkInDate: string, checkOutDate: string) {
  return differenceInCalendarDays(parseISO(checkOutDate), parseISO(checkInDate));
}

export function simpleRoomEstimate(weekdayPrice: number, weekendPrice: number, checkInDate: string, nights: number) {
  let total = 0;
  for (let i = 0; i < nights; i += 1) {
    const day = addDays(parseISO(checkInDate), i);
    const dow = day.getDay();
    total += dow === 0 || dow === 6 ? weekendPrice : weekdayPrice;
  }
  return total;
}
