import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { Cottage } from "../types";

export function CottageTable({ cottages }: { cottages: Cottage[] }) {
  return (
    <DataTable
      rows={cottages}
      columns={[
        { key: "name", header: "Name" },
        { key: "code", header: "Code" },
        { key: "category", header: "Category" },
        { key: "basePrice", header: "Base Price", render: (row) => `$${row.basePrice}` },
        { key: "maxGuests", header: "Guests" },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
