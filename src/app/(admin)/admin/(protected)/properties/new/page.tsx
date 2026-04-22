import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PropertyForm } from "@/features/admin/properties/components/PropertyForm";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewPropertyPage() {
  await requireAdmin();
  return <div><AdminPageHeader title="New Property" description="Create a real property record." /><PropertyForm /></div>;
}
