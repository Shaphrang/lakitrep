import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function BillingSelectionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "";
  const paymentStatus = typeof params.payment_status === "string" ? params.payment_status : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  const bookings = await getAllBookings({ pageSize: 100, query, status, paymentStatus, from, to });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Billing"
        description="Search and select a booking to open the dedicated billing workspace."
      />

      <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="query"
          className={inputClass}
          placeholder="Booking code, guest name, phone, or cottage"
          defaultValue={query}
        />
        <select name="status" className={inputClass} defaultValue={status}>
          <option value="">All booking statuses</option>
          <option value="new_request">New Request</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="advance_paid">Advance Paid</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select name="payment_status" className={inputClass} defaultValue={paymentStatus}>
          <option value="">All payment statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="advance_paid">Advance Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Search</button>
        <label className="text-xs text-[#516053]">Check-in from
          <input type="date" name="from" className={`${inputClass} mt-1 w-full`} defaultValue={from} />
        </label>
        <label className="text-xs text-[#516053]">Check-out to
          <input type="date" name="to" className={`${inputClass} mt-1 w-full`} defaultValue={to} />
        </label>
      </form>

      <DataTable
        rows={bookings.rows}
        emptyMessage="Please select a booking to manage billing."
        columns={[
          { key: "booking_code", header: "Booking" },
          { key: "guest_name", header: "Guest" },
          { key: "guest_phone", header: "Phone" },
          { key: "cottage_name", header: "Cottage" },
          { key: "stay", header: "Stay", render: (row) => `${row.check_in_date} → ${row.check_out_date}` },
          { key: "status", header: "Booking Status", render: (row) => <StatusBadge status={row.status} /> },
          { key: "payment_status", header: "Payment Status", render: (row) => <StatusBadge status={row.payment_status} /> },
          { key: "final_total", header: "Final Total", render: (row) => `₹${row.final_total.toLocaleString("en-IN")}` },
          { key: "amount_pending", header: "Pending", render: (row) => `₹${row.amount_pending.toLocaleString("en-IN")}` },
          {
            key: "actions",
            header: "Action",
            render: (row) => (
              <Link href={`/admin/billing/${row.id}`} className="rounded-lg border border-[#2e5a3d] px-2.5 py-1.5 text-xs font-semibold text-[#2e5a3d]">
                Open Billing
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
