import Link from "next/link";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { Booking } from "@/features/admin/bookings/types";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  return (
    <DataTable
      rows={bookings}
      columns={[
        {
          key: "booking_code",
          header: "Code",
          render: (row) => (
            <Link href={`/admin/bookings/${row.id}`} className="underline">
              {row.booking_code}
            </Link>
          ),
        },
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
