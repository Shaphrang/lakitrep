import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { Booking } from "../types";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <DataTable
      rows={bookings}
      columns={[
        { key: "reference", header: "Reference" },
        { key: "guestName", header: "Guest" },
        { key: "cottageName", header: "Cottage" },
        { key: "checkIn", header: "Check-in" },
        { key: "checkOut", header: "Check-out" },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
      ]}
    />
  );
}
