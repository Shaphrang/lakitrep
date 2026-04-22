import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AttractionForm } from "@/features/admin/attractions/components/AttractionForm";

export default function NewAttractionPage() {
  return (
    <div>
      <AdminPageHeader title="New Attraction" description="Create an attraction record (mock)." />
      <AttractionForm />
    </div>
  );
}
