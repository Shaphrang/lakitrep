import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllProperties } from "@/features/admin/properties/services/properties-service";

export default async function PropertiesPage() {
  const properties = await getAllProperties();

  return (
    <div>
      <AdminPageHeader
        title="Properties"
        description="Manage core property identity, contact info, and homepage content blocks."
        actions={
          <Link
            href="/admin/properties/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            New Property
          </Link>
        }
      />
      <DataTable
        rows={properties}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <Link href={`/admin/properties/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
                {row.name}
              </Link>
            ),
          },
          { key: "slug", header: "Slug" },
          { key: "district", header: "District" },
          { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
