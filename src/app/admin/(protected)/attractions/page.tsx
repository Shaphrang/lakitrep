/* eslint-disable @typescript-eslint/no-explicit-any */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attractionSchema } from "@/lib/admin/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AttractionsPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", "la-ki-trep-resort").single();
  const { data: attractions } = await supabase.from("attractions").select("*").order("sort_order");

  async function saveAttraction(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const id = formData.get("id");
    const parsed = attractionSchema.safeParse({
      propertyId: formData.get("propertyId"),
      name: formData.get("name"),
      description: formData.get("description"),
      distanceText: formData.get("distanceText"),
      imageUrl: formData.get("imageUrl"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
    if (!parsed.success) return;

    const payload = {
      property_id: parsed.data.propertyId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      distance_text: parsed.data.distanceText || null,
      image_url: parsed.data.imageUrl || null,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    };

    if (typeof id === "string" && id) await supabase.from("attractions").update(payload).eq("id", id);
    else await supabase.from("attractions").insert(payload);

    revalidatePath("/admin/attractions");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Attractions</h1>
      <Card>
        <CardHeader><CardTitle>Add attraction</CardTitle></CardHeader>
        <CardContent>
          <form action={saveAttraction} className="grid gap-2 md:grid-cols-3">
            <input type="hidden" name="propertyId" value={property.id} />
            <input name="name" placeholder="Name" className="h-10 rounded-md border px-3" />
            <input name="distanceText" placeholder="Distance" className="h-10 rounded-md border px-3" />
            <input name="imageUrl" placeholder="Image URL" className="h-10 rounded-md border px-3" />
            <input name="description" placeholder="Description" className="h-10 rounded-md border px-3 md:col-span-2" />
            <input name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-md border px-3" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
            <Button type="submit" variant="secondary">Save</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {attractions?.map((item: any) => (
          <Card key={item.id}><CardContent className="pt-6">
            <form action={saveAttraction} className="grid gap-2 md:grid-cols-3">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="propertyId" value={item.property_id} />
              <input name="name" defaultValue={item.name} className="h-10 rounded-md border px-3" />
              <input name="distanceText" defaultValue={item.distance_text ?? ""} className="h-10 rounded-md border px-3" />
              <input name="imageUrl" defaultValue={item.image_url ?? ""} className="h-10 rounded-md border px-3" />
              <input name="description" defaultValue={item.description ?? ""} className="h-10 rounded-md border px-3 md:col-span-2" />
              <input name="sortOrder" type="number" defaultValue={item.sort_order} className="h-10 rounded-md border px-3" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={item.is_active} /> Active</label>
              <Button type="submit" variant="secondary">Update</Button>
            </form>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
