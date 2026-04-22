/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/admin/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; payment?: string }> }) {
  const { q, status, payment } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("booking_list_view").select("*").order("created_at", { ascending: false }).limit(120);
  if (status) query = query.eq("status", status);
  if (payment) query = query.eq("payment_status", payment);
  if (q) query = query.or(`booking_code.ilike.%${q}%,guest_name.ilike.%${q}%,guest_phone.ilike.%${q}%`);

  const { data } = await query;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <Card><CardContent className="pt-6">
        <form className="grid gap-2 md:grid-cols-4">
          <input name="q" defaultValue={q} placeholder="Search booking / guest" className="h-10 rounded-md border px-3 text-sm" />
          <select name="status" defaultValue={status ?? ""} className="h-10 rounded-md border px-3 text-sm">
            <option value="">All status</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select name="payment" defaultValue={payment ?? ""} className="h-10 rounded-md border px-3 text-sm">
            <option value="">All payment</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button type="submit" variant="secondary">Apply</Button>
        </form>
      </CardContent></Card>

      <div className="grid gap-3">
        {data?.map((booking: any) => (
          <Card key={`${booking.id}-${booking.cottage_id}`}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
              <div>
                <p className="font-semibold">{booking.booking_code} · {booking.guest_name}</p>
                <p className="text-zinc-500">{booking.cottage_name} · {booking.check_in_date} → {booking.check_out_date}</p>
                <p className="text-zinc-500">{booking.status} · {booking.payment_status}</p>
              </div>
              <Link href={`/admin/bookings/${booking.id}`} className="inline-flex h-9 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white">Open</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
