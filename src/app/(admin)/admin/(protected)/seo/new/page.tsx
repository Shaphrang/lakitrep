import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SeoForm } from "@/features/admin/seo/components/SeoForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";

export default async function NewSeoPage() {  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New SEO Row" description="Create metadata record." /><SeoForm propertyOptions={propertyOptions} /></div>;
}