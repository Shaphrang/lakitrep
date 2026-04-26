import { enumerateDates } from "../reports.utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ReportDataset } from "../reports.types";

export async function getReportDataset(from?: string, to?: string): Promise<ReportDataset> {
  const supabase = await getSupabaseServerClient();
  let bookingsQuery = supabase
    .from("bookings")
    .select("id,booking_code,source,status,payment_status,check_in_date,check_out_date,created_at,nights,adults,children,infants,total_amount,discount_amount,extra_charges_total,final_total,amount_paid,amount_pending,actual_check_out_at,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone,email),cottages(id,name),invoices(invoice_number,invoice_date,status,tax_amount)")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (from) bookingsQuery = bookingsQuery.gte("check_in_date", from);
  if (to) bookingsQuery = bookingsQuery.lte("check_out_date", to);

  const [bookingsRes, paymentsRes, chargesRes, cottagesRes, blocksRes] = await Promise.all([
    bookingsQuery,
    supabase.from("booking_payments").select("id,booking_id,payment_date,amount,payment_mode,payment_type,reference_number,notes,received_by,bookings(booking_code,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone))").order("payment_date", { ascending: false }).limit(5000),
    supabase.from("booking_charges").select("id,booking_id,charge_type,description,amount,created_at,bookings(booking_code,guest:booking_guests!bookings_booking_guest_id_fkey(full_name),cottages(name))").order("created_at", { ascending: false }).limit(5000),
    supabase.from("cottages").select("id,name,status,is_bookable").order("name"),
    supabase.from("cottage_blocks").select("cottage_id,start_date,end_date").limit(5000),
  ]);

  if (bookingsRes.error) throw new Error(`Failed to load report bookings: ${bookingsRes.error.message}`);
  if (paymentsRes.error) throw new Error(`Failed to load report payments: ${paymentsRes.error.message}`);
  if (chargesRes.error) throw new Error(`Failed to load report charges: ${chargesRes.error.message}`);

  const bookings = (bookingsRes.data ?? []).map((row) => {
    const invoice = Array.isArray(row.invoices) ? row.invoices[0] : null;
    return {
      id: String(row.id),
      bookingCode: String(row.booking_code ?? "-"),
      guestName: String((row.guest as { full_name?: string } | null)?.full_name ?? "-"),
      phone: String((row.guest as { phone?: string } | null)?.phone ?? "-"),
      email: String((row.guest as { email?: string } | null)?.email ?? "-"),
      cottageId: String((row.cottages as { id?: string } | null)?.id ?? ""),
      cottageName: String((row.cottages as { name?: string } | null)?.name ?? "-"),
      source: String(row.source ?? "other"),
      status: String(row.status ?? "pending"),
      paymentStatus: String(row.payment_status ?? "unpaid"),
      checkIn: String(row.check_in_date ?? "-"),
      checkOut: String(row.check_out_date ?? "-"),
      createdAt: String(row.created_at ?? ""),
      nights: Number(row.nights ?? 0),
      adults: Number(row.adults ?? 0),
      children: Number(row.children ?? 0),
      totalGuests: Number(row.adults ?? 0) + Number(row.children ?? 0) + Number(row.infants ?? 0),
      baseAmount: Number(row.total_amount ?? 0),
      extraCharges: Number(row.extra_charges_total ?? 0),
      discount: Number(row.discount_amount ?? 0),
      tax: Number((invoice as { tax_amount?: number } | null)?.tax_amount ?? 0),
      finalAmount: Number(row.final_total ?? row.total_amount ?? 0),
      paidAmount: Number(row.amount_paid ?? 0),
      outstandingAmount: Math.max(0, Number(row.final_total ?? 0) - Number(row.amount_paid ?? 0)),
      invoiceNumber: String((invoice as { invoice_number?: string } | null)?.invoice_number ?? "Not generated"),
      invoiceDate: String((invoice as { invoice_date?: string } | null)?.invoice_date ?? "—"),
      invoiceStatus: String((invoice as { status?: string } | null)?.status ?? "not_generated"),
      cancelledDate: row.status === "cancelled" ? String(row.actual_check_out_at ?? row.created_at ?? "") : "",
    };
  });

  const payments = (paymentsRes.data ?? []).map((row) => ({
    id: String(row.id),
    paymentDate: String(row.payment_date ?? "-"),
    bookingCode: String((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-"),
    guestName: String(((row.bookings as { guest?: { full_name?: string } } | null)?.guest?.full_name) ?? "-"),
    phone: String(((row.bookings as { guest?: { phone?: string } } | null)?.guest?.phone) ?? "-"),
    method: String(row.payment_mode ?? "other"),
    paymentType: String(row.payment_type ?? "part_payment"),
    amount: Number(row.amount ?? 0),
    collectedBy: row.received_by ? "Admin" : "—",
    transactionReference: String(row.reference_number ?? "—"),
    status: row.payment_type === "refund" ? "refunded" : "received",
    remarks: String(row.notes ?? "—"),
  }));

  const charges = (chargesRes.data ?? []).map((row) => ({
    id: String(row.id),
    bookingCode: String((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-"),
    guestName: String(((row.bookings as { guest?: { full_name?: string } } | null)?.guest?.full_name) ?? "-"),
    cottage: String(((row.bookings as { cottages?: { name?: string } } | null)?.cottages?.name) ?? "-"),
    chargeType: String(row.charge_type ?? "other"),
    description: String(row.description ?? "—"),
    amount: Number(row.amount ?? 0),
    dateAdded: String(row.created_at ?? "-"),
  }));

  const blockRangeStart = from ?? new Date().toISOString().slice(0, 10);
  const blockRangeEnd = to ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10);

  const blockedNights = (blocksRes.data ?? []).flatMap((block) => {
    const start = String(block.start_date ?? "");
    const end = String(block.end_date ?? "");
    if (!start || !end) return [];
    return enumerateDates(start, end).map((date) => ({ cottageId: String(block.cottage_id), date }));
  }).filter((row) => row.date >= blockRangeStart && row.date <= blockRangeEnd);

  const limitations: string[] = [];
  if (!charges.length) limitations.push("No extra charges are currently recorded for this range.");
  if (!bookings.some((row) => row.discount > 0)) limitations.push("Discount reason / approved by fields are not tracked in current schema.");
  if (!bookings.some((row) => row.status === "cancelled")) limitations.push("Cancellation reason and cancelled-by fields are not available in the current schema.");

  return {
    bookings,
    payments,
    charges,
    cottages: (cottagesRes.data ?? []).map((c) => ({ id: String(c.id), name: String(c.name ?? "-"), status: String(c.status ?? "inactive"), isBookable: Boolean(c.is_bookable) })),
    blockedNights,
    lastUpdated: new Date().toISOString(),
    limitations,
  };
}
