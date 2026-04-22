import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllAttractions } from "@/features/admin/attractions/services/attractions-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AttractionsPage() {
  await requireAdmin();
  const attractions = await getAllAttractions();

  return <div><AdminPageHeader title="Attractions" description="Manage attractions." actions={<Link href="/admin/attractions/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Attraction</Link>} /><DataTable rows={attractions} columns={[
    { key: "name", header: "Name", render: (row) => <Link href={`/admin/attractions/${row.id}`} className="underline">{String(row.name)}</Link> },
    { key: "property_name", header: "Property" },
    { key: "distance_text", header: "Distance" },
    { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
  ]} /></div>;
}