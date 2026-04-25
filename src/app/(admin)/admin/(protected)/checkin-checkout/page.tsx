import { performCheckInOutAction } from "@/actions/admin/resort-management";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";

export default async function CheckInCheckoutPage() {
  const bookings = await getAllBookings({ pageSize: 100 });
  const rows = bookings.rows.filter((row) => ["confirmed", "advance_paid", "checked_in"].includes(row.status));

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Check-in / Checkout" description="One-click check-in/check-out with pending-dues safeguards." />
      <DataTable
        rows={rows}
        columns={[
          { key: "booking_code", header: "Booking" },
          { key: "guest_name", header: "Guest" },
          { key: "check_in_date", header: "Check-in" },
          { key: "check_out_date", header: "Check-out" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "amount_pending", header: "Pending", render: (row) => `₹${row.amount_pending.toLocaleString("en-IN")}` },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <form action={performCheckInOutAction}>
                  <input type="hidden" name="booking_id" value={row.id} />
                  <input type="hidden" name="action_type" value="check_in" />
                  <button className="rounded-lg border border-[#aac8b0] bg-[#eef8ef] px-2 py-1">Check-in</button>
                </form>
                <form action={performCheckInOutAction}>
                  <input type="hidden" name="booking_id" value={row.id} />
                  <input type="hidden" name="action_type" value="check_out" />
                  <button className="rounded-lg border border-[#b7c9dd] bg-[#eef5fc] px-2 py-1">Checkout</button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
