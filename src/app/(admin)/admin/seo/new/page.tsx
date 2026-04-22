import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SeoForm } from "@/features/admin/seo/components/SeoForm";

export default function NewSeoPage() {
  return (
    <div>
      <AdminPageHeader title="New SEO Row" description="Create SEO metadata entry (mock)." />
      <SeoForm />
    </div>
  );
}
