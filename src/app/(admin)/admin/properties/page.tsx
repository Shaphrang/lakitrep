import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllProperties } from "@/features/admin/properties/services/properties-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function PropertiesPage() {
  await requireAdmin();
  const properties = await getAllProperties();

  return (
    <div>
      <AdminPageHeader title="Properties" description="Manage resort properties." actions={<Link href="/admin/properties/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Property</Link>} />
      <DataTable rows={properties} columns={[
        { key: "name", header: "Name", render: (row) => <Link href={`/admin/properties/${row.id}`} className="underline">{row.name}</Link> },
        { key: "slug", header: "Slug" },
        { key: "district", header: "District" },
        { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
      ]} />
    </div>
  );
}