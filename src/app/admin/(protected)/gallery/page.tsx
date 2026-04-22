import { createClient } from "@/lib/supabase/server";
import { GalleryManager } from "@/components/admin/gallery-manager";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", "la-ki-trep-resort").single();
  const { data: images } = await supabase.from("gallery_images").select("*").order("sort_order").limit(200);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Gallery</h1>
      <GalleryManager propertyId={property.id} images={images ?? []} />
    </div>
  );
}
