import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AttractionForm } from "@/features/admin/attractions/components/AttractionForm";
import { getAttractionById } from "@/features/admin/attractions/services/attractions-service";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AttractionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [attraction, propertyOptions] = await Promise.all([getAttractionById(id), getPropertyOptions()]);
  if (!attraction) notFound();
  return <div><AdminPageHeader title={`Edit Attraction: ${attraction.name}`} description="Update attraction details." /><AttractionForm attraction={attraction} propertyOptions={propertyOptions} /></div>;
}
