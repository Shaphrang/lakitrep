/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function countRows(table: string, filter?: [string, unknown]) {
  const supabase = await createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter[0], filter[1]);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    totalCottages,
    pendingBookings,
    confirmedBookings,
    generalInquiries,
    eventInquiries,
    upcomingArrivalsCount,
  ] = await Promise.all([
    countRows("cottages"),
    countRows("bookings", ["status", "pending"]),
    countRows("bookings", ["status", "confirmed"]),
    countRows("inquiries"),
    countRows("event_inquiries"),
    countRows("upcoming_arrivals_view"),
  ]);

  const { data: recentBookings } = await supabase
    .from("booking_list_view")
    .select("booking_code,guest_name,status,check_in_date,created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: upcomingArrivals } = await supabase
    .from("upcoming_arrivals_view")
    .select("booking_code,guest_name,cottage_name,check_in_date")
    .limit(6);

  const { data: latestInquiries } = await supabase
    .from("inquiries")
    .select("full_name,phone,status,created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  const stats = [
    ["Total Cottages", totalCottages],
    ["Pending Bookings", pendingBookings],
    ["Confirmed Bookings", confirmedBookings],
    ["Upcoming Arrivals", upcomingArrivalsCount],
    ["General Inquiries", generalInquiries],
    ["Event Inquiries", eventInquiries],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500">Daily booking and inquiry operations snapshot.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="text-2xl font-semibold">{String(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Recent Booking Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentBookings?.map((row: any) => (
              <div key={`${row.booking_code}-${row.created_at}`} className="rounded border p-2">
                <p className="font-medium">{row.booking_code} · {row.guest_name}</p>
                <p className="text-zinc-500">{row.status} · check-in {row.check_in_date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Arrivals</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {upcomingArrivals?.map((row: any) => (
              <div key={`${row.booking_code}-${row.check_in_date}`} className="rounded border p-2">
                <p className="font-medium">{row.guest_name}</p>
                <p className="text-zinc-500">{row.cottage_name} · {row.check_in_date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Latest Inquiries</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {latestInquiries?.map((row: any) => (
              <div key={`${row.full_name}-${row.created_at}`} className="rounded border p-2">
                <p className="font-medium">{row.full_name}</p>
                <p className="text-zinc-500">{row.status} · {format(new Date(row.created_at), "dd MMM yyyy")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
