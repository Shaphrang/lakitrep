import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

type BookingTableRow = {
  id: string;
  booking_code: string;
  guest_name: string;
  guest_phone: string;
  cottage_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
};

export function BookingTable({ bookings }: { bookings: BookingTableRow[] }) {
  return (
    <DataTable
      rows={bookings}
      columns={[
        { key: "booking_code", header: "Code", render: (row) => <Link href={`/admin/bookings/${row.id}`} className="underline">{row.booking_code}</Link> },
        { key: "guest_name", header: "Guest" },
        { key: "guest_phone", header: "Phone" },
        { key: "cottage_name", header: "Cottage" },
        { key: "check_in_date", header: "Check-in" },
        { key: "check_out_date", header: "Check-out" },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
