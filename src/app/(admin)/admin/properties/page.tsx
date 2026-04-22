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
        description="Manage resort property records."
        actions={<Link href="/admin/properties/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Property</Link>}
      />
      <DataTable
        rows={properties}
        columns={[
          { key: "name", header: "Name" },
          { key: "location", header: "Location" },
          { key: "slug", header: "Slug" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
    </div>
  );
}
