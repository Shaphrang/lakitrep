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
        description="Keep booking terms and stay policies clear and up to date."
        actions={
          <Link
            href="/admin/policies/new"
            className="inline-flex items-center rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            New Policy
          </Link>
        }
      />
      <DataTable
        rows={policies}
        columns={[
          {
            key: "title",
            header: "Title",
            render: (row) => (
              <Link href={`/admin/policies/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
                {String(row.title)}
              </Link>
            ),
          },
          { key: "policy_key", header: "Key" },
          { key: "property_name", header: "Property" },
          { key: "is_active", header: "Status", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
        ]}
      />
    </div>
  );
}
