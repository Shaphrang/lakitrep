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
            <Link href={`/admin/bookings/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
              {row.booking_code}
            </Link>
          ),
        },
        { key: "guest_name", header: "Guest" },
        { key: "guest_phone", header: "Phone" },
        { key: "cottage_name", header: "Cottage" },
        { key: "check_in_date", header: "Check-in" },
        { key: "check_out_date", header: "Check-out" },
        {
          key: "guests",
          header: "Guests",
          render: (row) => row.adults + row.children + row.infants,
        },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        { key: "payment_status", header: "Payment", render: (row) => <StatusBadge status={row.payment_status} /> },
        { key: "final_total", header: "Total", render: (row) => `₹${Number(row.final_total).toLocaleString("en-IN")}` },
        { key: "amount_paid", header: "Paid", render: (row) => `₹${Number(row.amount_paid).toLocaleString("en-IN")}` },
        { key: "amount_pending", header: "Pending", render: (row) => `₹${Number(row.amount_pending).toLocaleString("en-IN")}` },
        { key: "source", header: "Source" },
      ]}
    />
  );
}
