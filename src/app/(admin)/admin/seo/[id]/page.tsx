import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SeoForm } from "@/features/admin/seo/components/SeoForm";
import { getSeoById } from "@/features/admin/seo/services/seo-service";

export default async function SeoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getSeoById(id);
  if (!row) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit SEO: ${row.pageKey}`} description="Update SEO details (mock form)." />
      <SeoForm seo={row} />
    </div>
  );
}
