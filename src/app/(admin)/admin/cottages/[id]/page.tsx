import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageForm } from "@/features/admin/cottages/components/CottageForm";
import { getCottageById } from "@/features/admin/cottages/services/cottages-service";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function CottageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [cottage, propertyOptions] = await Promise.all([getCottageById(id), getPropertyOptions()]);
  if (!cottage) notFound();
  return <div><AdminPageHeader title={`Edit Cottage: ${cottage.name}`} description="Update cottage details." /><CottageForm cottage={cottage} propertyOptions={propertyOptions} /></div>;
}
