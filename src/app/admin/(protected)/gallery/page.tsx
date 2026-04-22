import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_SLUG } from "@/lib/admin/constants";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { Card, CardContent } from "@/components/ui/card";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", PROPERTY_SLUG).maybeSingle();

  if (!property) return notFound();
  const { data: images, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order")
    .limit(200);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Gallery</h1>
      {error ? (
        <Card><CardContent className="pt-6 text-sm text-red-600">Unable to load gallery images.</CardContent></Card>
      ) : null}
      <GalleryManager propertyId={property.id} images={images ?? []} />
    </div>
  );
}
