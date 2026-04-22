/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_SLUG } from "@/lib/admin/constants";
import { policySchema } from "@/lib/admin/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PoliciesPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", PROPERTY_SLUG).single();
  const { data: policies } = await supabase.from("policies").select("*").order("sort_order");

  if (!property) return notFound();

  async function savePolicy(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id");
    const parsed = policySchema.safeParse({
      propertyId: formData.get("propertyId"),
      policyKey: formData.get("policyKey"),
      title: formData.get("title"),
      content: formData.get("content"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
    if (!parsed.success) return;

    const payload = {
      property_id: parsed.data.propertyId,
      policy_key: parsed.data.policyKey,
      title: parsed.data.title,
      content: parsed.data.content,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    };

    if (typeof id === "string" && id) await supabase.from("policies").update(payload).eq("id", id);
    else await supabase.from("policies").insert(payload);

    revalidatePath("/admin/policies");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Policies</h1>
      <Card><CardHeader><CardTitle>Add policy</CardTitle></CardHeader><CardContent>
        <form action={savePolicy} className="grid gap-2 md:grid-cols-3">
          <input type="hidden" name="propertyId" value={property.id} />
          <input name="policyKey" placeholder="Key" className="h-10 rounded-md border px-3" />
          <input name="title" placeholder="Title" className="h-10 rounded-md border px-3" />
          <input name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-md border px-3" />
          <textarea name="content" placeholder="Content" rows={3} className="rounded-md border p-2 md:col-span-3" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
          <Button type="submit" variant="secondary">Save</Button>
        </form>
      </CardContent></Card>

      <div className="grid gap-3">
        {policies?.map((policy: any) => (
          <Card key={policy.id}><CardContent className="pt-6">
            <form action={savePolicy} className="grid gap-2 md:grid-cols-3">
              <input type="hidden" name="id" value={policy.id} />
              <input type="hidden" name="propertyId" value={policy.property_id} />
              <input name="policyKey" defaultValue={policy.policy_key} className="h-10 rounded-md border px-3" />
              <input name="title" defaultValue={policy.title} className="h-10 rounded-md border px-3" />
              <input name="sortOrder" type="number" defaultValue={policy.sort_order} className="h-10 rounded-md border px-3" />
              <textarea name="content" defaultValue={policy.content} rows={3} className="rounded-md border p-2 md:col-span-3" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={policy.is_active} /> Active</label>
              <Button type="submit" variant="secondary">Update</Button>
            </form>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
