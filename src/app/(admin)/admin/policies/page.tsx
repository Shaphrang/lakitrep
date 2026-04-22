import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllPolicies } from "@/features/admin/policies/services/policies-service";

export default async function PoliciesPage() {
  const policies = await getAllPolicies();

  return (
    <div>
      <AdminPageHeader
        title="Policies"
        description="Manage policy content for guests."
        actions={<Link href="/admin/policies/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">New Policy</Link>}
      />
      <DataTable
        rows={policies}
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
    </div>
  );
}
