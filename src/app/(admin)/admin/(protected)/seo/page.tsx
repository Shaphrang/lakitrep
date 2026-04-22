import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllSeoEntries } from "@/features/admin/seo/services/seo-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function SeoPage() {
  await requireAdmin();
  const rows = await getAllSeoEntries();
  return <div><AdminPageHeader title="SEO" description="Manage metadata." actions={<Link href="/admin/seo/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New SEO Row</Link>} /><DataTable rows={rows} columns={[
    { key: "page_key", header: "Page", render: (row) => <Link href={`/admin/seo/${row.id}`} className="underline">{String(row.page_key)}</Link> },
    { key: "meta_title", header: "Meta Title" },
    { key: "property_name", header: "Property" },
    { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
  ]} /></div>;
}