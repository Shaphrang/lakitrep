import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PropertyForm } from "@/features/admin/properties/components/PropertyForm";
import { getPropertyById } from "@/features/admin/properties/services/properties-service";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();
  return <div><AdminPageHeader title={`Edit Property: ${property.name}`} description="Update property details." /><PropertyForm property={property} /></div>;
}
