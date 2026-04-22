import { notFound } from "next/navigation";
import { CottageForm } from "@/components/admin/cottage-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewCottagePage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", "la-ki-trep-resort").maybeSingle();
  const { data: amenities } = await supabase.from("amenities").select("id,name").eq("is_active", true).order("name");

  if (!property) return notFound();

  return <CottageForm mode="create" propertyId={property.id} amenities={amenities ?? []} selectedAmenities={[]} images={[]} />;
}
