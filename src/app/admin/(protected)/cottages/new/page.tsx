import { notFound } from "next/navigation";
import { CottageForm } from "@/components/admin/cottage-form";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_SLUG } from "@/lib/admin/constants";

export default async function NewCottagePage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", PROPERTY_SLUG).maybeSingle();
  const { data: amenities } = await supabase.from("amenities").select("id,name").eq("is_active", true).order("name");

  if (!property) return notFound();

  return <CottageForm mode="create" propertyId={property.id} amenities={amenities ?? []} selectedAmenities={[]} />;
}
