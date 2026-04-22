import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

type CottageTableRow = {
  id: string;
  name: string;
  code: string;
  property_name?: string;
  category: string;
  weekday_price: number;
  status: string;
};

export function CottageTable({ cottages }: { cottages: CottageTableRow[] }) {
  return (
    <DataTable
      rows={cottages}
      columns={[
        { key: "name", header: "Name", render: (row) => <Link href={`/admin/cottages/${row.id}`} className="underline">{row.name}</Link> },
        { key: "code", header: "Code" },
        { key: "property_name", header: "Property" },
        { key: "category", header: "Category" },
        { key: "weekday_price", header: "Weekday", render: (row) => `₹${row.weekday_price}` },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
