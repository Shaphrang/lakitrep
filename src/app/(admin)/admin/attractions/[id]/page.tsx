import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AttractionForm } from "@/features/admin/attractions/components/AttractionForm";
import { getAttractionById } from "@/features/admin/attractions/services/attractions-service";

export default async function AttractionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attraction = await getAttractionById(id);
  if (!attraction) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit Attraction: ${attraction.name}`} description="Update attraction details (mock form)." />
      <AttractionForm attraction={attraction} />
    </div>
  );
}
