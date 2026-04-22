import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageForm } from "@/features/admin/cottages/components/CottageForm";
import { getCottageById } from "@/features/admin/cottages/services/cottages-service";

export default async function CottageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cottage = await getCottageById(id);
  if (!cottage) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit Cottage: ${cottage.name}`} description="Update cottage details (mock form)." />
      <CottageForm cottage={cottage} />
    </div>
  );
}
