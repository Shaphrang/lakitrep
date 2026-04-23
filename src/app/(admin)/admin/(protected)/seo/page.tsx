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
        description="Control metadata and discoverability for resort pages."
        actions={
          <Link
            href="/admin/seo/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            New SEO Row
          </Link>
        }
      />
      <DataTable
        rows={rows}
        columns={[
          {
            key: "page_key",
            header: "Page",
            render: (row) => (
              <Link href={`/admin/seo/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
                {String(row.page_key)}
              </Link>
            ),
          },
          { key: "meta_title", header: "Meta Title" },
          { key: "property_name", header: "Property" },
          { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
