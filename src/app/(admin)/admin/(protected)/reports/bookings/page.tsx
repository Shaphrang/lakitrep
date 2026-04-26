import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getRevenueReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { formatDateOnly } from "@/features/admin/reports/reports.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CONFIRMED_STATUSES = [
  "confirmed",
  "advance_paid",
  "checked_in",
  "checked_out",
  "completed",
];

const PENDING_STATUSES = ["pending", "new_request", "contacted"];

export default async function BookingsReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const { preset, from, to } = await resolveReportDateRange(
    Promise.resolve(params),
  );

  const status = typeof params.status === "string" ? params.status : "all";
  const source = typeof params.source === "string" ? params.source : "all";
  const cottageId =
    typeof params.cottageId === "string" ? params.cottageId : "all";
  const paymentStatus =
    typeof params.paymentStatus === "string" ? params.paymentStatus : "all";
  const search = typeof params.q === "string" ? params.q : "";

  const dataset = await getRevenueReportDataset({
    from,
    to,
    q: search,
    cottageId,
    paymentStatus,
  });

  const filtered = dataset.revenueRows.filter((booking) => {
    if (status !== "all" && booking.bookingStatus !== status) return false;
    if (source !== "all" && booking.source !== source) return false;
    return true;
  });

  const statuses = Array.from(
    new Set(dataset.revenueRows.map((booking) => booking.bookingStatus)),
  )
    .filter(Boolean)
    .sort();

  const sources = Array.from(
    new Set(dataset.revenueRows.map((booking) => booking.source)),
  )
    .filter(Boolean)
    .sort();

  const totalBill = filtered.reduce(
    (sum, booking) => sum + booking.finalBill,
    0,
  );

  const totalCollection = filtered.reduce(
    (sum, booking) => sum + booking.paidAmount,
    0,
  );

  const outstanding = filtered.reduce(
    (sum, booking) => sum + booking.outstanding,
    0,
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Bookings Report"
        description="Simple booking report using created date, with status, source, cottage, payment, collection and pending amount visibility."
      />

      <ReportsNav />

      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search booking code, guest, phone, cottage"
        clearHref="/admin/reports/bookings"
        filters={[
          {
            name: "status",
            label: "Booking status",
            value: status,
            options: [
              { value: "all", label: "All statuses" },
              ...statuses.map((value) => ({
                value,
                label: value.replaceAll("_", " "),
              })),
            ],
          },
          {
            name: "source",
            label: "Source",
            value: source,
            options: [
              { value: "all", label: "All sources" },
              ...sources.map((value) => ({
                value,
                label: value.replaceAll("_", " "),
              })),
            ],
          },
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
          Booking Overview
        </h2>
        <p className="mt-1 text-sm text-[#65756a]">
          This report is filtered by booking created date from{" "}
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
            label: "Total Bookings",
            value: filtered.length,
            helper: "Bookings created in selected date range",
          },
          {
            label: "Confirmed Bookings",
            value: filtered.filter((booking) =>
              CONFIRMED_STATUSES.includes(booking.bookingStatus),
            ).length,
            helper: "Confirmed, checked-in, checked-out or completed",
          },
          {
            label: "Pending Bookings",
            value: filtered.filter((booking) =>
              PENDING_STATUSES.includes(booking.bookingStatus),
            ).length,
            helper: "Pending, new request or contacted",
          },
          {
            label: "Total Bill",
            value: totalBill,
            kind: "currency",
            helper: "Final bill amount",
          },
          {
            label: "Total Collection",
            value: totalCollection,
            kind: "currency",
            helper: "Amount collected",
          },
          {
            label: "Outstanding",
            value: outstanding,
            kind: "currency",
            helper: "Amount still pending",
          },
          {
            label: "Paid Bookings",
            value: filtered.filter(
              (booking) => booking.outstanding <= 0 && booking.finalBill > 0,
            ).length,
            helper: "Fully paid bookings",
          },
          {
            label: "Pending Payment",
            value: filtered.filter((booking) => booking.outstanding > 0).length,
            helper: "Bookings with pending amount",
          },
        ]}
      />

      <ReportTableClient
        title="Bookings"
        fileName="bookings-report.csv"
        rows={filtered}
        searchKeys={[
          "bookingCode",
          "guestName",
          "phone",
          "cottageName",
          "source",
        ]}
        columns={[
          {
            key: "createdDate",
            label: "Created Date",
            sortable: true,
            format: "date",
          },
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          {
            key: "checkIn",
            label: "Check-in",
            sortable: true,
            format: "date",
          },
          {
            key: "checkOut",
            label: "Check-out",
            sortable: true,
            format: "date",
          },
          { key: "guests", label: "Guests", sortable: true },
          { key: "bookingStatus", label: "Status", sortable: true },
          { key: "source", label: "Source", sortable: true },
          {
            key: "finalBill",
            label: "Total Bill",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "paidAmount",
            label: "Paid",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "outstanding",
            label: "Outstanding",
            sortable: true,
            format: "currency_inr",
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            sortable: true,
          },
          {
            key: "action",
            label: "Action",
            format: "billing_action",
          },
        ]}
        emptyText="No bookings found for the selected filters."
      />
    </div>
  );
}