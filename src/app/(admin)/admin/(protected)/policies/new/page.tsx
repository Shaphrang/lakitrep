import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PolicyForm } from "@/features/admin/policies/components/PolicyForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";

export default async function NewPolicyPage() {  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New Policy" description="Create policy." /><PolicyForm propertyOptions={propertyOptions} /></div>;
}