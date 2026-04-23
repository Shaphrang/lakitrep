import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageForm } from "@/features/admin/cottages/components/CottageForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";

export default async function NewCottagePage() {  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New Cottage" description="Create a real cottage record." /><CottageForm propertyOptions={propertyOptions} /></div>;
}