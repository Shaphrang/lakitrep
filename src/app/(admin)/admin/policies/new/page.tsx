import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PolicyForm } from "@/features/admin/policies/components/PolicyForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewPolicyPage() {
  await requireAdmin();
  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New Policy" description="Create policy." /><PolicyForm propertyOptions={propertyOptions} /></div>;
}