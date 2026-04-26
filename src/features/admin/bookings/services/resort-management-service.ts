import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CottageAvailabilityMeta = {
  id: string;
  code: string;
  is_combined_unit: boolean;
  component_codes: string[];
};

async function getCottageConflictIds(cottageId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: cottages, error } = await supabase
    .from("cottages")
    .select("id,code,is_combined_unit,component_codes")
    .eq("status", "active")
    .eq("is_bookable", true);

  if (error) throw new Error(`Failed to load cottages for availability: ${error.message}`);

  const rows = (cottages ?? []) as CottageAvailabilityMeta[];
  const selected = rows.find((row) => String(row.id) === cottageId);
  if (!selected) {
    return [cottageId];
  }

  const selectedCode = String(selected.code ?? "").trim();
  const selectedComponents = Array.isArray(selected.component_codes) ? selected.component_codes.map((code) => String(code)) : [];

  const selectedOrRelatedCodes = new Set<string>([
    selectedCode,
    ...selectedComponents,
  ].filter(Boolean));

  for (const row of rows) {
    const componentCodes = Array.isArray(row.component_codes) ? row.component_codes.map((code) => String(code)) : [];
    if (!componentCodes.length) continue;
    if (selectedCode && componentCodes.includes(selectedCode)) {
      selectedOrRelatedCodes.add(String(row.code ?? ""));
    }
  }

  const conflictIds = rows
    .filter((row) => {
      const code = String(row.code ?? "");
      const componentCodes = Array.isArray(row.component_codes) ? row.component_codes.map((item) => String(item)) : [];

      if (selectedOrRelatedCodes.has(code)) return true;
      return componentCodes.some((componentCode) => selectedOrRelatedCodes.has(componentCode));
    })
    .map((row) => String(row.id));

  return conflictIds.length ? conflictIds : [cottageId];
}

export async function getResortDashboardMetrics() {
  const supabase = await getSupabaseServerClient();

  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;

  const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStart = format(monthStartDate, "yyyy-MM-dd");
  const monthStartIso = `${monthStart}T00:00:00`;

  const trendStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const trendStart = format(trendStartDate, "yyyy-MM-dd");
  const trendStartIso = `${trendStart}T00:00:00`;

  const [
    todayCheckins,
    todayCheckouts,
    newRequests,
    upcomingConfirmed,
    inHouse,
    pendingBills,
    arrivalsWithDue,
    todayCollection,
    monthCollection,
    monthBookings,
    trendBookings,
    trendPayments,
    activeCottages,
    blockedCottages,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("check_in_date", today)
      .in("status", ["confirmed", "advance_paid"]),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("check_out_date", today)
      .in("status", ["checked_in", "confirmed", "advance_paid"]),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["new_request", "pending"]),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("check_in_date", today)
      .in("status", ["confirmed", "advance_paid"]),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "checked_in"),

    supabase
      .from("bookings")
      .select("id,amount_pending", { count: "exact" })
      .gt("amount_pending", 0)
      .in("status", ["checked_in", "checked_out", "confirmed", "advance_paid"]),

    supabase
      .from("bookings")
      .select("id,amount_pending", { count: "exact" })
      .eq("check_in_date", today)
      .gt("amount_pending", 0)
      .in("status", ["confirmed", "advance_paid"]),

    supabase
      .from("booking_payments")
      .select("amount,payment_type,created_at")
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd)
      .limit(1000),

    supabase
      .from("booking_payments")
      .select("amount,payment_type,created_at")
      .gte("created_at", monthStartIso)
      .limit(5000),

    supabase
      .from("bookings")
      .select("id,status,source,final_total,amount_pending,created_at")
      .gte("created_at", monthStartIso)
      .limit(5000),

    supabase
      .from("bookings")
      .select("id,status,source,final_total,amount_pending,created_at")
      .gte("created_at", trendStartIso)
      .limit(10000),

    supabase
      .from("booking_payments")
      .select("amount,payment_type,created_at")
      .gte("created_at", trendStartIso)
      .limit(10000),

    supabase
      .from("cottages")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("is_bookable", true),

    supabase
      .from("cottage_blocks")
      .select("id", { count: "exact", head: true })
      .lte("start_date", today)
      .gte("end_date", today),
  ]);

  const safePaymentAmount = (row: Record<string, unknown>) => {
    const amount = Number(row.amount ?? 0);
    const paymentType = String(row.payment_type ?? "");

    if (!Number.isFinite(amount)) return 0;

    return paymentType === "refund" ? -amount : amount;
  };

  const todayCollectionTotal = (todayCollection.data ?? []).reduce(
    (sum, row) => sum + safePaymentAmount(row as Record<string, unknown>),
    0,
  );

  const monthCollectionTotal = (monthCollection.data ?? []).reduce(
    (sum, row) => sum + safePaymentAmount(row as Record<string, unknown>),
    0,
  );

  const monthBookingRows = (monthBookings.data ?? []) as Record<
    string,
    unknown
  >[];

  const monthRevenue = monthBookingRows.reduce((sum, row) => {
    const amount = Number(row.final_total ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const monthOutstanding = monthBookingRows.reduce((sum, row) => {
    const amount = Number(row.amount_pending ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const pendingAmount = ((pendingBills.data ?? []) as Record<string, unknown>[]).reduce(
    (sum, row) => {
      const amount = Number(row.amount_pending ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    },
    0,
  );

  const monthBookingsCount = monthBookingRows.length;

  const avgBookingValue =
    monthBookingsCount > 0 ? monthRevenue / monthBookingsCount : 0;

  const collectionRate =
    monthRevenue > 0 ? Math.round((monthCollectionTotal / monthRevenue) * 100) : 0;

  const activeCottageCount = activeCottages.count ?? 0;
  const inHouseCount = inHouse.count ?? 0;

  const occupancy =
    activeCottageCount > 0
      ? Math.round((inHouseCount / activeCottageCount) * 100)
      : 0;

  const sourceMap = new Map<
    string,
    { source: string; bookings: number; revenue: number; outstanding: number }
  >();

  for (const row of monthBookingRows) {
    const source = String(row.source ?? "other");
    const existing =
      sourceMap.get(source) ?? {
        source,
        bookings: 0,
        revenue: 0,
        outstanding: 0,
      };

    existing.bookings += 1;
    existing.revenue += Number(row.final_total ?? 0) || 0;
    existing.outstanding += Number(row.amount_pending ?? 0) || 0;

    sourceMap.set(source, existing);
  }

  const sourceBreakdown = Array.from(sourceMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const statusMap = new Map<string, number>();

  for (const row of monthBookingRows) {
    const status = String(row.status ?? "unknown");
    statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
  }

  const statusBreakdown = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const trendMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: format(date, "yyyy-MM"),
      label: format(date, "MMM"),
      revenue: 0,
      collection: 0,
      bookings: 0,
    };
  });

  const trendMap = new Map(trendMonths.map((row) => [row.key, row]));

  for (const row of (trendBookings.data ?? []) as Record<string, unknown>[]) {
    const createdAt = String(row.created_at ?? "");
    const key = createdAt.slice(0, 7);
    const target = trendMap.get(key);

    if (!target) continue;

    target.bookings += 1;
    target.revenue += Number(row.final_total ?? 0) || 0;
  }

  for (const row of (trendPayments.data ?? []) as Record<string, unknown>[]) {
    const createdAt = String(row.created_at ?? "");
    const key = createdAt.slice(0, 7);
    const target = trendMap.get(key);

    if (!target) continue;

    target.collection += safePaymentAmount(row);
  }

  return {
    todayCheckins: todayCheckins.count ?? 0,
    todayCheckouts: todayCheckouts.count ?? 0,
    newRequests: newRequests.count ?? 0,
    upcomingConfirmed: upcomingConfirmed.count ?? 0,
    inHouse: inHouseCount,
    pendingBills: pendingBills.count ?? 0,
    pendingAmount,
    arrivalsWithDue: arrivalsWithDue.count ?? 0,
    todayCollection: todayCollectionTotal,
    monthRevenue,
    monthCollection: monthCollectionTotal,
    monthOutstanding,
    monthBookings: monthBookingsCount,
    avgBookingValue,
    collectionRate,
    occupancy,
    blockedCottages: blockedCottages.count ?? 0,
    sourceBreakdown,
    statusBreakdown,
    trend: trendMonths,
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
      .select("id,booking_code,status,payment_status,check_in_date,check_out_date,final_total,amount_paid,amount_pending,cottages(name)")
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
    supabase
      .from("cottages")
      .select("id,name,code,slug,max_adults,max_children,max_infants,max_total_guests,weekday_price,weekend_price,child_price,status,is_bookable")
      .eq("status", "active")
      .eq("is_bookable", true)
      .order("name"),
    supabase.from("booking_guests").select("id,full_name,phone,source").order("created_at", { ascending: false }).limit(50),
  ]);

  return {
    cottages: cottages ?? [],
    customers: customers ?? [],
  };
}

export async function assertCottageAvailability(cottageId: string, checkInDate: string, checkOutDate: string, ignoreBookingId?: string) {
  const supabase = await getSupabaseServerClient();
  const conflictIds = await getCottageConflictIds(cottageId);

  let bookingConflict = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .in("cottage_id", conflictIds)
    .in("status", ["confirmed", "advance_paid", "checked_in"])
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate);

  if (ignoreBookingId) {
    bookingConflict = bookingConflict.neq("id", ignoreBookingId);
  }

  const blockConflict = supabase
    .from("cottage_blocks")
    .select("id", { count: "exact", head: true })
    .in("cottage_id", conflictIds)
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
    supabase
      .from("bookings")
      .select(
        "id,booking_code,status,payment_status,source,check_in_date,check_out_date,adults,children,infants,nights,total_amount,discount_amount,extra_charges_total,final_total,amount_paid,amount_pending,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone,whatsapp_number,email),cottages(name,weekday_price,weekend_price)",
      )
      .eq("id", bookingId)
      .maybeSingle(),
    supabase.from("booking_charges").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false }),
    supabase.from("booking_payments").select("*").eq("booking_id", bookingId).order("created_at", { ascending: false }),
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

  const latestNonRefund = [...(payments ?? [])].find((row) => String((row as { payment_type?: string }).payment_type ?? "") !== "refund");
  const latestType = String((latestNonRefund as { payment_type?: string } | undefined)?.payment_type ?? "");
  const paymentStatus = amountPending <= 0 ? "paid" : totalPaid > 0 ? (latestType === "advance" ? "advance_paid" : "partially_paid") : "unpaid";

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
