import { format } from "date-fns";
import { performCheckInOutAction } from "@/actions/admin/resort-management";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

export default async function CheckInCheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const success = typeof params.success === "string" ? decodeURIComponent(params.success) : "";
  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : "";
  const bookings = await getAllBookings({ pageSize: 100 });
  const rows = bookings.rows.filter((row) => ["confirmed", "advance_paid", "checked_in"].includes(row.status));
  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Check-in / Checkout" description="Strict same-day check-in/check-out with clear disable reasons." />
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
            render: (row) => {
              const checkInReason = ["confirmed", "advance_paid"].includes(row.status)
                ? today === row.check_in_date
                  ? ""
                  : today < row.check_in_date
                    ? "Check-in will be available on the booking check-in date."
                    : "The scheduled check-in date has passed. Please review this booking before checking in."
                : "Only confirmed or advance-paid bookings can be checked in.";

              const checkoutReason = row.status === "checked_in"
                ? today === row.check_out_date
                  ? row.amount_pending > 0
                    ? "Pending balance must be cleared before checkout."
                    : ""
                  : today < row.check_out_date
                    ? "Checkout will be available on the booking check-out date."
                    : "The scheduled checkout date has passed. Please review the booking."
                : "Only checked-in bookings can be checked out.";

              return (
                <div className="space-y-2">
                  <form action={performCheckInOutAction} className="space-y-1">
                    <input type="hidden" name="booking_id" value={row.id} />
                    <input type="hidden" name="action_type" value="check_in" />
                    <input type="hidden" name="return_path" value="/admin/checkin-checkout" />
                    <SubmitButton pendingText="Checking in..." disabled={Boolean(checkInReason)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#aac8b0] bg-[#eef8ef] px-2 py-1">Check-in</SubmitButton>
                    {checkInReason ? <p className="text-xs text-[#66766b]">{checkInReason}</p> : null}
                  </form>
                  <form action={performCheckInOutAction} className="space-y-1">
                    <input type="hidden" name="booking_id" value={row.id} />
                    <input type="hidden" name="action_type" value="check_out" />
                    <input type="hidden" name="return_path" value="/admin/checkin-checkout" />
                    <SubmitButton pendingText="Checking out..." disabled={Boolean(checkoutReason)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#b7c9dd] bg-[#eef5fc] px-2 py-1">Checkout</SubmitButton>
                    {checkoutReason ? <p className="text-xs text-[#66766b]">{checkoutReason}</p> : null}
                  </form>
                </div>
              );
            },
          },
        ]}
      />
      <ActionDialog success={success} error={error} />
    </div>
  );
}
