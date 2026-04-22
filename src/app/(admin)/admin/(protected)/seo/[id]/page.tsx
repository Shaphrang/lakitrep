import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SeoForm } from "@/features/admin/seo/components/SeoForm";
import { getSeoById } from "@/features/admin/seo/services/seo-service";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function SeoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [row, propertyOptions] = await Promise.all([getSeoById(id), getPropertyOptions()]);
  if (!row) notFound();
  return <div><AdminPageHeader title={`Edit SEO: ${row.page_key}`} description="Update SEO details." /><SeoForm seo={row} propertyOptions={propertyOptions} /></div>;
}
