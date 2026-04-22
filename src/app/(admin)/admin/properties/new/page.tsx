import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PropertyForm } from "@/features/admin/properties/components/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div>
      <AdminPageHeader title="New Property" description="Create a property entry (mock)." />
      <PropertyForm />
    </div>
  );
}
