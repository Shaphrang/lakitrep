import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getAllBookings() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("id,booking_code,status,check_in_date,check_out_date,adults,children,infants,nights,total_amount,properties(name),cottages(name),booking_guests(full_name,phone)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    booking_code: row.booking_code,
    status: row.status,
    check_in_date: row.check_in_date,
    check_out_date: row.check_out_date,
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    nights: row.nights ?? 0,
    total_amount: Number(row.total_amount ?? 0),
    property_name: (row.properties as { name?: string } | null)?.name ?? "-",
    cottage_name: (row.cottages as { name?: string } | null)?.name ?? "-",
    guest_name: (row.booking_guests as { full_name?: string } | null)?.full_name ?? "-",
    guest_phone: (row.booking_guests as { phone?: string } | null)?.phone ?? "-",
  }));
}

export async function getBookingById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*,properties(name),cottages(name,code),booking_guests(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to fetch booking: ${error.message}`);
  return data;
}

export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected") {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw new Error(`Failed to update booking status: ${error.message}`);
}

export async function deleteBooking(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete booking: ${error.message}`);
}
