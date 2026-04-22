/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/admin/constants";
import { bookingContactLogSchema, bookingUpdateSchema } from "@/lib/admin/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: booking }, { data: cottages }, { data: history }, { data: logs }] = await Promise.all([
    supabase.from("bookings").select("*, guests(*), booking_cottages(*)").eq("id", id).maybeSingle(),
    supabase.from("booking_cottages").select("*").eq("booking_id", id),
    supabase.from("booking_status_history").select("*").eq("booking_id", id).order("created_at", { ascending: false }),
    supabase.from("booking_contact_logs").select("*").eq("booking_id", id).order("created_at", { ascending: false }),
  ]);

  if (!booking) return notFound();

  async function updateBooking(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const parsed = bookingUpdateSchema.safeParse({
      status: formData.get("status"),
      paymentStatus: formData.get("paymentStatus"),
      adminNotes: formData.get("adminNotes"),
    });

    if (!parsed.success) return;

    const { error } = await supabase.from("bookings").update({
      status: parsed.data.status,
      payment_status: parsed.data.paymentStatus,
      admin_notes: parsed.data.adminNotes || null,
    }).eq("id", id);

    if (error) {
      if (error.message.toLowerCase().includes("overlapping dates") || error.message.toLowerCase().includes("already booked")) {
        throw new Error("This booking cannot be confirmed because selected cottage dates overlap another confirmed booking.");
      }
      throw error;
    }

    revalidatePath(`/admin/bookings/${id}`);
    revalidatePath("/admin/bookings");
  }

  async function addContactLog(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const parsed = bookingContactLogSchema.safeParse({
      contactMethod: formData.get("contactMethod"),
      contactSummary: formData.get("contactSummary"),
    });
    if (!parsed.success) return;

    await supabase.from("booking_contact_logs").insert({
      booking_id: id,
      contact_method: parsed.data.contactMethod,
      contact_summary: parsed.data.contactSummary || null,
      contacted_by: auth.user?.id ?? null,
    });

    revalidatePath(`/admin/bookings/${id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Booking {booking.booking_code}</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Booking Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Guest: {booking.guests?.full_name} ({booking.guests?.phone})</p>
            <p>Stay: {booking.check_in_date} → {booking.check_out_date}</p>
            <p>Guests: {booking.adults} adults, {booking.children} children, {booking.infants} infants</p>
            <p>Special request: {booking.special_requests || "-"}</p>
            <p>Admin notes: {booking.admin_notes || "-"}</p>
            <p>Cottage(s): {(cottages ?? []).map((c: any) => c.cottage_name_snapshot).join(", ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
          <CardContent>
            <form action={updateBooking} className="space-y-2 text-sm">
              <select name="status" defaultValue={booking.status} className="h-10 w-full rounded-md border px-3">
                {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select name="paymentStatus" defaultValue={booking.payment_status} className="h-10 w-full rounded-md border px-3">
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea name="adminNotes" defaultValue={booking.admin_notes ?? ""} rows={4} className="w-full rounded-md border p-2" />
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {history?.length ? history.map((h: any) => (
              <div key={h.id} className="rounded border p-2">{h.old_status ?? "new"} → {h.new_status} · {new Date(h.created_at).toLocaleString()}</div>
            )) : <p className="text-zinc-500">No status history.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Logs</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form action={addContactLog} className="space-y-2">
              <input name="contactMethod" placeholder="Contact method (call/whatsapp/email)" className="h-10 w-full rounded-md border px-3" />
              <textarea name="contactSummary" placeholder="Summary" rows={3} className="w-full rounded-md border p-2" />
              <Button type="submit" variant="secondary">Add log</Button>
            </form>
            {logs?.map((log: any) => (
              <div key={log.id} className="rounded border p-2">
                <p className="font-medium">{log.contact_method}</p>
                <p>{log.contact_summary || "-"}</p>
                <p className="text-xs text-zinc-500">{new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
