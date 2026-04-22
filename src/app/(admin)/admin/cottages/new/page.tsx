import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { CottageForm } from "@/features/admin/cottages/components/CottageForm";

export default function NewCottagePage() {
  return (
    <div>
      <AdminPageHeader title="New Cottage" description="Create a cottage record (mock)." />
      <CottageForm />
    </div>
  );
}
