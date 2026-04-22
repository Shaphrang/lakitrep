/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EVENT_INQUIRY_STATUSES } from "@/lib/admin/constants";
import { eventInquiryUpdateSchema } from "@/lib/admin/validators";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function EventInquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("event_inquiries").select("*").order("created_at", { ascending: false }).limit(100);

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const parsed = eventInquiryUpdateSchema.safeParse({
      status: formData.get("status"),
      adminNotes: formData.get("adminNotes"),
    });
    if (!parsed.success || typeof id !== "string") return;
    const supabase = await createClient();
    await supabase.from("event_inquiries").update({ status: parsed.data.status, admin_notes: parsed.data.adminNotes || null }).eq("id", id);
    revalidatePath("/admin/event-inquiries");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Event Inquiries</h1>
      <div className="grid gap-3">
        {inquiries?.map((inq: any) => (
          <Card key={inq.id}><CardContent className="space-y-2 pt-6 text-sm">
            <p className="font-semibold">{inq.full_name} · {inq.phone}</p>
            <p>{inq.email || "-"} · {inq.event_type || "Event"} · {inq.event_date || "No date"}</p>
            <p>Guests: {inq.guest_count || "-"} · Stay required: {inq.stay_required ? "Yes" : "No"} · Full property: {inq.full_property_required ? "Yes" : "No"}</p>
            <p className="rounded bg-zinc-50 p-2">{inq.message || "No message"}</p>
            <form action={updateStatus} className="space-y-2">
              <input type="hidden" name="id" value={inq.id} />
              <div className="flex items-center gap-2">
                <select name="status" defaultValue={inq.status} className="h-9 rounded-md border px-2">
                  {EVENT_INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button type="submit" className="h-9" variant="secondary">Update</Button>
              </div>
              <textarea name="adminNotes" defaultValue={inq.admin_notes || ""} rows={3} className="w-full rounded-md border p-2" />
            </form>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
