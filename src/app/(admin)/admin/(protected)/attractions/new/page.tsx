import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AttractionForm } from "@/features/admin/attractions/components/AttractionForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewAttractionPage() {
  await requireAdmin();
  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New Attraction" description="Create attraction." /><AttractionForm propertyOptions={propertyOptions} /></div>;
}