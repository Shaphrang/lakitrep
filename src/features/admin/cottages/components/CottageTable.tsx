import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { Cottage } from "@/features/admin/cottages/types";

type CottageListItem = Cottage & { property_name?: string | null };

export function CottageTable({ cottages }: { cottages: CottageListItem[] }) {
  return (
    <DataTable
      rows={cottages}
      columns={[
        {
          key: "name",
          header: "Name",
          render: (row) => (
            <Link href={`/admin/cottages/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
              {row.name}
            </Link>
          ),
        },
        { key: "code", header: "Code" },
        { key: "property_name", header: "Property" },
        { key: "category", header: "Category" },
        { key: "weekday_price", header: "Weekday", render: (row) => `₹${row.weekday_price}` },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
