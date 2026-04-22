import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_SLUG } from "@/lib/admin/constants";
import { AttractionsManager } from "@/components/admin/attractions-manager";
import { Card, CardContent } from "@/components/ui/card";

export default async function AttractionsPage() {
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id").eq("slug", PROPERTY_SLUG).maybeSingle();

  if (!property) return notFound();
  const { data: attractions, error: attractionsError } = await supabase
    .from("attractions")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Attractions</h1>
      {attractionsError ? (
        <Card><CardContent className="pt-6 text-sm text-red-600">Unable to load attractions.</CardContent></Card>
      ) : null}
      <AttractionsManager propertyId={property.id} attractions={attractions ?? []} />
    </div>
  );
}
