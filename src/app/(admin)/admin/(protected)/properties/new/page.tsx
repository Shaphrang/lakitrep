import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PropertyForm } from "@/features/admin/properties/components/PropertyForm";

export default async function NewPropertyPage() {  return <div><AdminPageHeader title="New Property" description="Create a real property record." /><PropertyForm /></div>;
}
