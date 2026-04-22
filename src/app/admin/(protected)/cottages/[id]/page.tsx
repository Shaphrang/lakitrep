/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { CottageForm } from "@/components/admin/cottage-form";
import { createClient } from "@/lib/supabase/server";

export default async function EditCottagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cottage } = await supabase
    .from("cottages")
    .select("*, cottage_prices(*), cottage_amenities(amenity_id)")
    .eq("id", id)
    .maybeSingle();

  const { data: amenities } = await supabase.from("amenities").select("id,name").eq("is_active", true).order("name");
  const { data: images } = await supabase.from("cottage_images").select("*").eq("cottage_id", id).order("sort_order");

  if (!cottage) return notFound();

  return (
    <CottageForm
      mode="edit"
      propertyId={cottage.property_id}
      cottage={cottage}
      amenities={amenities ?? []}
      selectedAmenities={(cottage.cottage_amenities ?? []).map((item: any) => item.amenity_id)}
      images={images ?? []}
    />
  );
}
