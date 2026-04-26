import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getCheckInCheckoutReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { formatDateOnly } from "@/features/admin/reports/reports.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckInCheckoutReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const { preset, from, to } = await resolveReportDateRange(
    Promise.resolve(params),
  );

  const cottageId =
    typeof params.cottageId === "string" ? params.cottageId : "all";
  const paymentStatus =
    typeof params.paymentStatus === "string" ? params.paymentStatus : "all";
  const search = typeof params.q === "string" ? params.q : "";

  const dataset = await getCheckInCheckoutReportDataset({
    from,
    to,
    q: search,
    cottageId,
    paymentStatus,
  });

  const unpaidArrivals = dataset.arrivals.filter(
    (row) => row.balance > 0,
  ).length;

  const unpaidDepartures = dataset.departures.filter(
    (row) => row.balance > 0,
  ).length;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Check-in / Check-out Report"
        description="Daily operational report for arrivals, departures, guest details, payment status and pending balance."
      />

      <ReportsNav />

      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search booking code, guest, phone, cottage"
        clearHref="/admin/reports/checkin-checkout"
        filters={[
          {
            name: "cottageId",
            label: "Cottage",
            value: cottageId,
            options: [
              { value: "all", label: "All cottages" },
              ...dataset.cottages.map((row) => ({
                value: row.id,
                label: row.name,
              })),
            ],
          },
          {
            name: "paymentStatus",
            label: "Payment status",
            value: paymentStatus,
            options: [
              { value: "all", label: "All payment status" },
              { value: "paid", label: "Paid" },
              { value: "partially_paid", label: "Partially Paid" },
              { value: "partial", label: "Partial" },
              { value: "unpaid", label: "Unpaid" },
              { value: "pending", label: "Pending" },
            ],
          },
        ]}
      />

      <section className="rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(120deg,#fbf8f2_0%,#f2ede3_100%)] p-4">
        <h2 className="text-lg font-semibold text-[#21392c]">
          Arrival & Departure Overview
        </h2>
        <p className="mt-1 text-sm text-[#65756a]">
          This report uses actual check-in and check-out dates from{" "}
          <span className="font-medium text-[#21392c]">
            {formatDateOnly(from)}
          </span>{" "}
          to{" "}
          <span className="font-medium text-[#21392c]">
            {formatDateOnly(to)}
          </span>
          .
        </p>
      </section>

      <ReportSummaryCards
        cards={[
          {
            label: "Check-ins",
            value: dataset.arrivals.length,
            helper: "Arrivals in selected date range",
          },
          {
            label: "Check-outs",
            value: dataset.departures.length,
            helper: "Departures in selected date range",
          },
          {
            label: "Arrivals With Due",
            value: unpaidArrivals,
            helper: "Arriving guests with pending balance",
          },
          {
            label: "Departures With Due",
            value: unpaidDepartures,
            helper: "Departing guests with pending balance",
          },
          {
            label: "Arrival Pending Amount",
            value: dataset.arrivals.reduce((sum, row) => sum + row.balance, 0),
            kind: "currency",
            helper: "Pending from arrival bookings",
          },
          {
            label: "Departure Pending Amount",
            value: dataset.departures.reduce(
              (sum, row) => sum + row.balance,
              0,
            ),
            kind: "currency",
            helper: "Pending from departure bookings",
          },
          {
            label: "Total Guests Arriving",
            value: dataset.arrivals.reduce((sum, row) => sum + row.guests, 0),
            helper: "Guests expected to arrive",
          },
          {
            label: "Total Guests Leaving",
            value: dataset.departures.reduce((sum, row) => sum + row.guests, 0),
            helper: "Guests expected to leave",
          },
        ]}
      />

      <ReportTableClient
        title="Check-ins"
        fileName="checkins-report.csv"
        rows={dataset.arrivals}
        searchKeys={["bookingCode", "guestName", "phone", "cottageName"]}
        columns={[
          { key: "checkIn", label: "Check-in Date", sortable: true, format: "date" },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "guests", label: "Guests", sortable: true },
          { key: "bookingStatus", label: "Booking Status", sortable: true },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
          { key: "finalBill", label: "Final Bill", sortable: true, format: "currency_inr" },
          { key: "paidAmount", label: "Paid", sortable: true, format: "currency_inr" },
          { key: "balance", label: "Balance", sortable: true, format: "currency_inr" },
          { key: "action", label: "Action", format: "billing_action" },
        ]}
        emptyText="No check-ins found for the selected filters."
      />

      <ReportTableClient
        title="Check-outs"
        fileName="checkouts-report.csv"
        rows={dataset.departures}
        searchKeys={["bookingCode", "guestName", "phone", "cottageName"]}
        columns={[
          { key: "checkOut", label: "Check-out Date", sortable: true, format: "date" },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "guests", label: "Guests", sortable: true },
          { key: "bookingStatus", label: "Booking Status", sortable: true },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
          { key: "finalBill", label: "Final Bill", sortable: true, format: "currency_inr" },
          { key: "paidAmount", label: "Paid", sortable: true, format: "currency_inr" },
          { key: "balance", label: "Balance", sortable: true, format: "currency_inr" },
          { key: "action", label: "Action", format: "billing_action" },
        ]}
        emptyText="No check-outs found for the selected filters."
      />
    </div>
  );
}