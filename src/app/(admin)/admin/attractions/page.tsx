import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllAttractions } from "@/features/admin/attractions/services/attractions-service";

export default async function AttractionsPage() {
  const attractions = await getAllAttractions();

  return (
    <div>
      <AdminPageHeader
        title="Attractions"
        description="Manage guest activities and attractions."
        actions={<Link href="/admin/attractions/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Attraction</Link>}
      />
      <DataTable
        rows={attractions}
        columns={[
          { key: "name", header: "Name" },
          { key: "duration", header: "Duration" },
          { key: "slug", header: "Slug" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
    </div>
  );
}
