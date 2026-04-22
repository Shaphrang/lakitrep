import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

export function BookingTable({ bookings }: { bookings: Array<Record<string, unknown>> }) {
  return (
    <DataTable
      rows={bookings as Array<{ id: string }>}
      columns={[
        { key: "booking_code", header: "Code", render: (row: any) => <Link href={`/admin/bookings/${String(row.id)}`} className="underline">{String(row.booking_code)}</Link> },
        { key: "guest_name", header: "Guest" },
        { key: "guest_phone", header: "Phone" },
        { key: "cottage_name", header: "Cottage" },
        { key: "check_in_date", header: "Check-in" },
        { key: "check_out_date", header: "Check-out" },
        { key: "status", header: "Status", render: (row: any) => <StatusBadge status={String(row.status)} /> },
      ]}
    />
  );
}
