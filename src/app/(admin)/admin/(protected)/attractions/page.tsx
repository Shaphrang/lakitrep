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
        description="Curate nearby experiences guests can explore during their stay."
        actions={
          <Link
            href="/admin/attractions/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            New Attraction
          </Link>
        }
      />
      <DataTable
        rows={attractions}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <Link href={`/admin/attractions/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
                {String(row.name)}
              </Link>
            ),
          },
          { key: "property_name", header: "Property" },
          { key: "distance_text", header: "Distance" },
          { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
