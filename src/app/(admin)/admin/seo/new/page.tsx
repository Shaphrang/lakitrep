import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SeoForm } from "@/features/admin/seo/components/SeoForm";
import { getPropertyOptions } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewSeoPage() {
  await requireAdmin();
  const propertyOptions = await getPropertyOptions();
  return <div><AdminPageHeader title="New SEO Row" description="Create metadata record." /><SeoForm propertyOptions={propertyOptions} /></div>;
}