import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { PolicyForm } from "@/features/admin/policies/components/PolicyForm";

export default function NewPolicyPage() {
  return (
    <div>
      <AdminPageHeader title="New Policy" description="Create a policy document (mock)." />
      <PolicyForm />
    </div>
  );
}
