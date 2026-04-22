import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllPolicies } from "@/features/admin/policies/services/policies-service";
import { requireAdmin } from "@/lib/auth/admin";

export default async function PoliciesPage() {
  await requireAdmin();
  const policies = await getAllPolicies();
  return <div><AdminPageHeader title="Policies" description="Manage guest policies." actions={<Link href="/admin/policies/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Policy</Link>} /><DataTable rows={policies} columns={[
    { key: "title", header: "Title", render: (row) => <Link href={`/admin/policies/${row.id}`} className="underline">{String(row.title)}</Link> },
    { key: "policy_key", header: "Key" },
    { key: "property_name", header: "Property" },
    { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
  ]} /></div>;
}