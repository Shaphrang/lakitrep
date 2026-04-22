import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PolicyForm } from "@/features/admin/policies/components/PolicyForm";
import { getPolicyById } from "@/features/admin/policies/services/policies-service";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [policy, propertyOptions] = await Promise.all([getPolicyById(id), getPropertyOptions()]);
  if (!policy) notFound();
  return <div><AdminPageHeader title={`Edit Policy: ${policy.title}`} description="Update policy details." /><PolicyForm policy={policy} propertyOptions={propertyOptions} /></div>;
}
