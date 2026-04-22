import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PolicyForm } from "@/features/admin/policies/components/PolicyForm";
import { getPolicyById } from "@/features/admin/policies/services/policies-service";

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const policy = await getPolicyById(id);
  if (!policy) notFound();

  return (
    <div>
      <AdminPageHeader title={`Edit Policy: ${policy.title}`} description="Update policy details (mock form)." />
      <PolicyForm policy={policy} />
    </div>
  );
}
