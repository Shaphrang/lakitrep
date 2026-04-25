import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Booking, BookingStatus } from "../types";

type BookingFilters = {
  page?: number;
  pageSize?: number;
  status?: string;
  source?: string;
  query?: string;
  cottageId?: string;
  from?: string;
  to?: string;
};

export async function getAllBookings(filters: BookingFilters = {}) {
  const supabase = await getSupabaseServerClient();
  const page = Math.max(1, Number(filters.page ?? 1));
  const pageSize = Math.min(100, Math.max(10, Number(filters.pageSize ?? 20)));
  const fromIdx = (page - 1) * pageSize;
  const toIdx = fromIdx + pageSize - 1;

  let query = supabase
    .from("bookings")
    .select(
      "id,booking_code,status,payment_status,source,check_in_date,check_out_date,adults,children,infants,nights,total_amount,final_total,amount_paid,amount_pending,properties(name),cottages(name),guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(fromIdx, toIdx);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.cottageId) query = query.eq("cottage_id", filters.cottageId);
  if (filters.from) query = query.gte("check_in_date", filters.from);
  if (filters.to) query = query.lte("check_out_date", filters.to);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

  let mapped = mapBookings(data ?? []);

  const normalizedQuery = filters.query?.trim().toLowerCase();
  if (normalizedQuery) {
    mapped = mapped.filter(
      (row) =>
        row.booking_code.toLowerCase().includes(normalizedQuery) ||
        row.guest_name.toLowerCase().includes(normalizedQuery) ||
        row.guest_phone.toLowerCase().includes(normalizedQuery),
    );
  }

  return {
    rows: mapped,
    page,
    pageSize,
    total: count ?? mapped.length,
    totalPages: Math.max(1, Math.ceil((count ?? mapped.length) / pageSize)),
  };
}

function mapBookings(data: Record<string, unknown>[]): Booking[] {
  return data.map((row) => ({
    id: String(row.id),
    booking_code: String(row.booking_code ?? "-"),
    status: String(row.status ?? "pending") as BookingStatus,
    payment_status: String(row.payment_status ?? "unpaid"),
    source: String(row.source ?? "website"),
    check_in_date: String(row.check_in_date ?? "-"),
    check_out_date: String(row.check_out_date ?? "-"),
    adults: Number(row.adults ?? 0),
    children: Number(row.children ?? 0),
    infants: Number(row.infants ?? 0),
    nights: Number(row.nights ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    final_total: Number(row.final_total ?? row.total_amount ?? 0),
    amount_paid: Number(row.amount_paid ?? 0),
    amount_pending: Number(row.amount_pending ?? row.total_amount ?? 0),
    property_name: ((row.properties as { name?: string } | null)?.name ?? "-") as string,
    cottage_name: ((row.cottages as { name?: string } | null)?.name ?? "-") as string,
    guest_name: ((row.guest as { full_name?: string } | null)?.full_name ?? "-") as string,
    guest_phone: ((row.guest as { phone?: string } | null)?.phone ?? "-") as string,
  }));
}

export async function getBookingById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*,properties(name),cottages(name,code,max_total_guests),guest:booking_guests!bookings_booking_guest_id_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch booking: ${error.message}`);
  return data;
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw new Error(`Failed to update booking status: ${error.message}`);
}

export async function deleteBooking(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete booking: ${error.message}`);
}
