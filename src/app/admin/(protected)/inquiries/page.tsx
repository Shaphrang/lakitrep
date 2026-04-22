/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INQUIRY_STATUSES } from "@/lib/admin/constants";
import { inquiryUpdateSchema } from "@/lib/admin/validators";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: inquiries } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(100);

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const parsed = inquiryUpdateSchema.safeParse({ status: formData.get("status") });
    if (!parsed.success || typeof id !== "string") return;
    const supabase = await createClient();
    await supabase.from("inquiries").update({ status: parsed.data.status }).eq("id", id);
    revalidatePath("/admin/inquiries");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">General Inquiries</h1>
      <div className="grid gap-3">
        {inquiries?.map((inq: any) => (
          <Card key={inq.id}>
            <CardContent className="space-y-2 pt-6 text-sm">
              <p className="font-semibold">{inq.full_name} · {inq.phone || "-"}</p>
              <p>{inq.email || "No email"} · Preferred: {inq.preferred_contact_method || "-"}</p>
              <p className="rounded bg-zinc-50 p-2">{inq.message}</p>
              <form action={updateStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={inq.id} />
                <select name="status" defaultValue={inq.status} className="h-9 rounded-md border px-2">
                  {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button type="submit" className="h-9" variant="secondary">Update</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
