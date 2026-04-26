import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";

const inputClass =
  "w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c] outline-none transition focus:border-[#2e5a3d] focus:ring-2 focus:ring-[#2e5a3d]/15";

function currency(value: unknown) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default async function BillingSelectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "";
  const paymentStatus =
    typeof params.payment_status === "string" ? params.payment_status : "";
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  const bookings = await getAllBookings({
    pageSize: 100,
    query,
    status,
    paymentStatus,
    from,
    to,
  });

  const rows = bookings.rows ?? [];

  const totalBookings = rows.length;
  const totalFinalAmount = rows.reduce(
    (sum, row) => sum + Number(row.final_total ?? 0),
    0,
  );
  const totalPendingAmount = rows.reduce(
    (sum, row) => sum + Number(row.amount_pending ?? 0),
    0,
  );
  const pendingBookings = rows.filter(
    (row) => Number(row.amount_pending ?? 0) > 0,
  ).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Billing"
        description="Search a booking and open its dedicated billing workspace to manage invoice, payments, charges and pending amount."
        actions={
          <Link
            href="/admin/billing"
            className="inline-flex items-center justify-center rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
          >
            Clear / Refresh
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6e7f72]">
            Bookings Found
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#21392c]">
            {totalBookings}
          </p>
          <p className="mt-1 text-xs text-[#7b877f]">
            Based on current filters
          </p>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6e7f72]">
            Total Final Amount
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#21392c]">
            {currency(totalFinalAmount)}
          </p>
          <p className="mt-1 text-xs text-[#7b877f]">
            Final bill value of listed bookings
          </p>
        </article>

        <article className="rounded-2xl border border-[#e6cda2] bg-[#fff9ed] p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8a6b42]">
            Pending Amount
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#7a4b12]">
            {currency(totalPendingAmount)}
          </p>
          <p className="mt-1 text-xs text-[#8a6b42]">
            Amount still to be received
          </p>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#6e7f72]">
            Pending Bookings
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#21392c]">
            {pendingBookings}
          </p>
          <p className="mt-1 text-xs text-[#7b877f]">
            Bookings with balance due
          </p>
        </article>
      </section>

      <form
        method="GET"
        className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm"
      >
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#21392c]">
            Search & Filter Billing
          </h3>
          <p className="mt-1 text-xs text-[#6f7d74]">
            Filter bookings before opening the billing workspace.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          <label className="text-sm text-[#344b3d] lg:col-span-4">
            Search
            <input
              name="query"
              className={`${inputClass} mt-1`}
              placeholder="Booking code, guest name, phone, or cottage"
              defaultValue={query}
            />
          </label>

          <label className="text-sm text-[#344b3d] lg:col-span-2">
            Booking status
            <select
              name="status"
              className={`${inputClass} mt-1`}
              defaultValue={status}
            >
              <option value="">All booking statuses</option>
              <option value="new_request">New Request</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="advance_paid">Advance Paid</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="text-sm text-[#344b3d] lg:col-span-2">
            Payment status
            <select
              name="payment_status"
              className={`${inputClass} mt-1`}
              defaultValue={paymentStatus}
            >
              <option value="">All payment statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="advance_paid">Advance Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </label>

          <label className="text-sm text-[#344b3d] lg:col-span-2">
            Check-in from
            <input
              type="date"
              name="from"
              className={`${inputClass} mt-1`}
              defaultValue={from}
            />
          </label>

          <label className="text-sm text-[#344b3d] lg:col-span-2">
            Check-out to
            <input
              type="date"
              name="to"
              className={`${inputClass} mt-1`}
              defaultValue={to}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-[#2e5a3d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
          >
            Apply Filters
          </button>

          <Link
            href="/admin/billing"
            className="inline-flex items-center justify-center rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-4 py-2.5 text-sm font-semibold text-[#2b4637] transition hover:bg-[#f4efe4]"
          >
            Clear All Filters
          </Link>
        </div>
      </form>

      {totalPendingAmount > 0 ? (
        <section className="rounded-2xl border border-[#e8cf9d] bg-[#fff8eb] p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-[#7a4b12]">
                Pending amount to be collected
              </h3>
              <p className="text-sm text-[#80613b]">
                Some listed bookings still have unpaid balance. Open billing to
                collect or update payment.
              </p>
            </div>

            <p className="text-2xl font-bold text-[#7a4b12]">
              {currency(totalPendingAmount)}
            </p>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-semibold text-[#21392c]">
              Billing Bookings
            </h3>
            <p className="text-xs text-[#6f7d74]">
              Open a booking to manage billing, payments, invoice and charges.
            </p>
          </div>

          <p className="text-xs text-[#6f7d74]">
            Showing {totalBookings} record{totalBookings === 1 ? "" : "s"}
          </p>
        </div>

        <DataTable
          rows={rows}
          emptyMessage="No bookings found. Try clearing filters or searching with another keyword."
          columns={[
            { key: "booking_code", header: "Booking" },
            { key: "guest_name", header: "Guest" },
            { key: "guest_phone", header: "Phone" },
            { key: "cottage_name", header: "Cottage" },
            {
              key: "stay",
              header: "Stay",
              render: (row) =>
                `${row.check_in_date ?? "—"} → ${row.check_out_date ?? "—"}`,
            },
            {
              key: "status",
              header: "Booking Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "payment_status",
              header: "Payment Status",
              render: (row) => <StatusBadge status={row.payment_status} />,
            },
            {
              key: "final_total",
              header: "Final Total",
              render: (row) => currency(row.final_total),
            },
            {
              key: "amount_pending",
              header: "Pending",
              render: (row) => (
                <span
                  className={
                    Number(row.amount_pending ?? 0) > 0
                      ? "font-semibold text-[#9a5f20]"
                      : "text-[#536458]"
                  }
                >
                  {currency(row.amount_pending)}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Action",
              render: (row) => (
                <Link
                  href={`/admin/billing/${row.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#2e5a3d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#244832]"
                >
                  Open Billing
                </Link>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
}