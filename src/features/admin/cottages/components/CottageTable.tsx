import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function CottageTable({ cottages }: { cottages: Array<Record<string, unknown>> }) {
  return (
    <DataTable
      rows={cottages as Array<{ id: string }>}
      columns={[
        { key: "name", header: "Name", render: (row: any) => <Link href={`/admin/cottages/${String(row.id)}`} className="underline">{String(row.name)}</Link> },
        { key: "code", header: "Code" },
        { key: "property_name", header: "Property" },
        { key: "category", header: "Category" },
        { key: "weekday_price", header: "Weekday", render: (row: any) => `₹${row.weekday_price}` },
        { key: "status", header: "Status", render: (row: any) => <StatusBadge status={String(row.status)} /> },
      ]}
    />
  );
}
