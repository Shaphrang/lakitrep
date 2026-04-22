import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllSeoEntries } from "@/features/admin/seo/services/seo-service";

export default async function SeoPage() {
  const rows = await getAllSeoEntries();

  return (
    <div>
      <AdminPageHeader
        title="SEO"
        description="Manage page metadata and canonical URLs."
        actions={<Link href="/admin/seo/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New SEO Row</Link>}
      />
      <DataTable
        rows={rows}
        columns={[
          { key: "pageKey", header: "Page Key" },
          { key: "title", header: "Title" },
          { key: "canonicalUrl", header: "Canonical URL" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
    </div>
  );
}
