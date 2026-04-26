import Link from "next/link";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ExportCsvButton } from "@/features/admin/reports/components/ExportCsvButton";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getRevenueReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import {
  averageBookingValue,
  collectionRate,
  currency,
  formatDateOnly,
  occupancyRate,
} from "@/features/admin/reports/reports.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const confirmedStatuses = [
  "confirmed",
  "advance_paid",
  "checked_in",
  "checked_out",
  "completed",
];

const pendingStatuses = ["pending", "new_request", "contacted"];

function formatCurrencyCompact(value: number) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  return currency(value);
}

export default async function ReportsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const { preset, from, to } = await resolveReportDateRange(
    Promise.resolve(params),
  );

  const search = typeof params.q === "string" ? params.q : "";
  const source = typeof params.source === "string" ? params.source : "all";
  const cottageId =
    typeof params.cottageId === "string" ? params.cottageId : "all";
  const paymentStatus =
    typeof params.paymentStatus === "string" ? params.paymentStatus : "all";

  const dataset = await getRevenueReportDataset({
    from,
    to,
    q: search,
    cottageId,
    paymentStatus,
  });

  const bookings = dataset.revenueRows.filter((booking) => {
    if (source !== "all" && booking.source !== source) return false;
    return true;
  });

  const statuses = Array.from(
    new Set(bookings.map((booking) => booking.bookingStatus)),
  )
    .filter(Boolean)
    .sort();

  const sources = Array.from(
    new Set(dataset.revenueRows.map((booking) => booking.source)),
  )
    .filter(Boolean)
    .sort();

  const totalBookings = bookings.length;

  const confirmedBookings = bookings.filter((booking) =>
    confirmedStatuses.includes(booking.bookingStatus),
  ).length;

  const pendingBookings = bookings.filter((booking) =>
    pendingStatuses.includes(booking.bookingStatus),
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.bookingStatus === "cancelled",
  ).length;

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.finalBill,
    0,
  );

  const totalCollection = bookings.reduce(
    (sum, booking) => sum + booking.paidAmount,
    0,
  );

  const outstanding = bookings.reduce(
    (sum, booking) => sum + booking.outstanding,
    0,
  );

  const totalNights = bookings.reduce(
    (sum, booking) => sum + Number(booking.nights || 0),
    0,
  );

  const bookableCottages = Math.max(1, dataset.cottages.length);
  const totalAvailableNights = Math.max(1, bookableCottages * 30);

  const today = format(new Date(), "yyyy-MM-dd");

  const checkinsToday = bookings.filter((booking) => booking.checkIn === today);
  const checkoutsToday = bookings.filter(
    (booking) => booking.checkOut === today,
  );

  const outstandingRows = bookings
    .filter((booking) => booking.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 6);

  const cottagePerformance = Array.from(
    new Set(bookings.map((booking) => booking.cottageId).filter(Boolean)),
  )
    .map((cottageId) => {
      const rows = bookings.filter((booking) => booking.cottageId === cottageId);

      return {
        id: cottageId,
        cottageName: rows[0]?.cottageName ?? "—",
        bookings: rows.length,
        revenue: rows.reduce((sum, row) => sum + row.finalBill, 0),
        collection: rows.reduce((sum, row) => sum + row.paidAmount, 0),
        outstanding: rows.reduce((sum, row) => sum + row.outstanding, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const sourceSummary = Array.from(
    new Set(bookings.map((booking) => booking.source).filter(Boolean)),
  )
    .map((bookingSource) => {
      const rows = bookings.filter((booking) => booking.source === bookingSource);

      return {
        id: bookingSource,
        source: bookingSource,
        bookings: rows.length,
        revenue: rows.reduce((sum, row) => sum + row.finalBill, 0),
        collection: rows.reduce((sum, row) => sum + row.paidAmount, 0),
        outstanding: rows.reduce((sum, row) => sum + row.outstanding, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const paymentMethodSummary = dataset.paymentMethods
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const statusSummary = statuses.map((status) => ({
    id: status,
    status,
    count: bookings.filter((booking) => booking.bookingStatus === status).length,
  }));

  const trendRows = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - index));

    const monthKey = format(month, "yyyy-MM");

    const rows = bookings.filter((booking) =>
      String(booking.createdAt || booking.createdDate).startsWith(monthKey),
    );

    return {
      id: monthKey,
      label: format(month, "MMM"),
      revenue: rows.reduce((sum, booking) => sum + booking.finalBill, 0),
      collection: rows.reduce((sum, booking) => sum + booking.paidAmount, 0),
    };
  });

  const trendMax = Math.max(
    1,
    ...trendRows.map((row) => Math.max(row.revenue, row.collection)),
  );

  const dashboardExportRows = bookings.map((booking) => ({
    created_date: formatDateOnly(booking.createdDate),
    booking_code: booking.bookingCode,
    guest: booking.guestName,
    phone: booking.phone,
    cottage: booking.cottageName,
    status: booking.bookingStatus,
    source: booking.source,
    check_in: formatDateOnly(booking.checkIn),
    check_out: formatDateOnly(booking.checkOut),
    final_bill: booking.finalBill,
    paid_amount: booking.paidAmount,
    outstanding_amount: booking.outstanding,
    payment_status: booking.paymentStatus,
  }));

  const topCottage = cottagePerformance[0]?.cottageName ?? "—";
  const topSource = sourceSummary[0]?.source ?? "—";

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Reports Dashboard"
        description="A simple overview of bookings, revenue, collection, outstanding dues, cottages and daily operations."
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportCsvButton
              fileName="reports-dashboard-summary.csv"
              rows={dashboardExportRows}
            />

            <Link
              href="/admin/reports"
              className="rounded-xl border border-[#d8cfbf] bg-white px-3 py-2 text-sm font-semibold text-[#2b4637] transition hover:bg-[#f4efe4]"
            >
              Clear / Refresh
            </Link>
          </div>
        }
      />

      <ReportsNav />

      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search booking, guest, phone, cottage, source"
        clearHref="/admin/reports"
        filters={[
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

      <section className="rounded-3xl border border-[#ddd4c6] bg-[linear-gradient(135deg,#fbf8f2_0%,#f1eadc_100%)] p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f7f72]">
              Business Snapshot
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#214531] sm:text-3xl">
              Revenue, collection and pending amount at a glance
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#52665a]">
              This dashboard uses booking records created from{" "}
              <span className="font-semibold text-[#214531]">
                {formatDateOnly(from)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#214531]">
                {formatDateOnly(to)}
              </span>
              . Financial values are shared with the Revenue report to avoid
              mismatch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#d8cfbf] bg-white/80 p-4">
              <p className="text-xs text-[#6f7d74]">Collection Rate</p>
              <p className="mt-1 text-2xl font-bold text-[#214531]">
                {collectionRate(totalCollection, totalRevenue).toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl border border-[#d8cfbf] bg-white/80 p-4">
              <p className="text-xs text-[#6f7d74]">Top Cottage</p>
              <p className="mt-1 text-lg font-bold text-[#214531]">
                {topCottage}
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReportSummaryCards
        cards={[
          {
            label: "Total Bookings",
            value: totalBookings,
            helper: "Bookings created in selected period",
          },
          {
            label: "Confirmed Bookings",
            value: confirmedBookings,
            helper: "Confirmed, checked-in, checked-out or completed",
          },
          {
            label: "Pending Bookings",
            value: pendingBookings,
            helper: "Pending, new request or contacted",
          },
          {
            label: "Cancelled Bookings",
            value: cancelledBookings,
            helper: "Cancelled bookings",
          },
          {
            label: "Total Revenue",
            value: totalRevenue,
            kind: "currency",
            helper: "Final billed amount",
          },
          {
            label: "Total Collection",
            value: totalCollection,
            kind: "currency",
            helper: "Actual amount collected",
          },
          {
            label: "Outstanding Amount",
            value: outstanding,
            kind: "currency",
            helper: "Amount still to be received",
          },
          {
            label: "Occupancy Rate",
            value: occupancyRate(totalNights, totalAvailableNights),
            kind: "percent",
            helper: "Based on filtered booking nights",
          },
          {
            label: "Today Check-ins",
            value: checkinsToday.length,
            helper: "From selected records",
          },
          {
            label: "Today Check-outs",
            value: checkoutsToday.length,
            helper: "From selected records",
          },
          {
            label: "Avg Booking Value",
            value: averageBookingValue(totalRevenue, Math.max(1, totalBookings)),
            kind: "currency",
            helper: "Revenue divided by bookings",
          },
          {
            label: "Top Source",
            value: topSource,
            helper: "Highest revenue source",
          },
        ]}
      />

      {outstanding > 0 ? (
        <section className="rounded-2xl border border-[#e8cf9d] bg-[#fff8eb] p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-[#7a4b12]">
                Pending amount to be received
              </h3>
              <p className="mt-1 text-sm text-[#80613b]">
                These are bookings where final bill is more than the amount
                collected.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-2xl font-bold text-[#7a4b12]">
                {currency(outstanding)}
              </p>
              <Link
                href="/admin/reports/revenue"
                className="text-sm font-semibold text-[#2e5a3d]"
              >
                Open Revenue Report
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#21392c]">
                Revenue vs Collection
              </h3>
              <p className="text-xs text-[#6f7d74]">
                Month-wise view based on created date
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#2e5a3d]">
                <span className="h-2 w-2 rounded-full bg-[#2e5a3d]" />
                Revenue
              </span>
              <span className="flex items-center gap-1 text-[#9b6c21]">
                <span className="h-2 w-2 rounded-full bg-[#d2ac67]" />
                Collection
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {trendRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[48px_1fr] gap-3 text-xs sm:grid-cols-[60px_1fr_110px_110px]"
              >
                <span className="font-medium text-[#55685c]">{row.label}</span>

                <div className="space-y-1.5">
                  <div className="h-2.5 rounded-full bg-[#edf2ec]">
                    <div
                      className="h-2.5 rounded-full bg-[#2e5a3d]"
                      style={{ width: `${(row.revenue / trendMax) * 100}%` }}
                    />
                  </div>

                  <div className="h-2.5 rounded-full bg-[#f4efe4]">
                    <div
                      className="h-2.5 rounded-full bg-[#d2ac67]"
                      style={{
                        width: `${(row.collection / trendMax) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <span className="hidden text-right font-medium text-[#21392c] sm:block">
                  {formatCurrencyCompact(row.revenue)}
                </span>

                <span className="hidden text-right font-medium text-[#9b6c21] sm:block">
                  {formatCurrencyCompact(row.collection)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-[#21392c]">Action Required</h3>
          <p className="text-xs text-[#6f7d74]">
            Items that need attention from admin
          </p>

          <div className="mt-4 space-y-2">
            <Link
              href="/admin/reports/bookings"
              className="block rounded-xl border border-[#eee6da] bg-[#fbf8f2] p-3 transition hover:bg-[#f4efe4]"
            >
              <p className="text-sm font-semibold text-[#21392c]">
                {pendingBookings} pending bookings
              </p>
              <p className="text-xs text-[#6f7d74]">
                Need confirmation or follow-up
              </p>
            </Link>

            <Link
              href="/admin/reports/revenue"
              className="block rounded-xl border border-[#eee6da] bg-[#fbf8f2] p-3 transition hover:bg-[#f4efe4]"
            >
              <p className="text-sm font-semibold text-[#21392c]">
                {outstandingRows.length} bookings with dues
              </p>
              <p className="text-xs text-[#6f7d74]">
                Pending amount: {currency(outstanding)}
              </p>
            </Link>

            <Link
              href="/admin/reports/checkin-checkout"
              className="block rounded-xl border border-[#eee6da] bg-[#fbf8f2] p-3 transition hover:bg-[#f4efe4]"
            >
              <p className="text-sm font-semibold text-[#21392c]">
                {checkinsToday.length} check-ins today
              </p>
              <p className="text-xs text-[#6f7d74]">
                {checkinsToday.filter((booking) => booking.outstanding > 0).length}{" "}
                have pending balance
              </p>
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ReportTableClient
          title="Cottage Performance"
          fileName="dashboard-cottage-performance.csv"
          rows={cottagePerformance}
          searchKeys={["cottageName"]}
          columns={[
            { key: "cottageName", label: "Cottage", sortable: true },
            { key: "bookings", label: "Bookings", sortable: true },
            {
              key: "revenue",
              label: "Revenue",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "collection",
              label: "Collection",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "outstanding",
              label: "Outstanding",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No cottage performance data available."
        />

        <ReportTableClient
          title="Source Summary"
          fileName="dashboard-source-summary.csv"
          rows={sourceSummary}
          searchKeys={["source"]}
          columns={[
            { key: "source", label: "Source", sortable: true },
            { key: "bookings", label: "Bookings", sortable: true },
            {
              key: "revenue",
              label: "Revenue",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "collection",
              label: "Collection",
              sortable: true,
              format: "currency_inr",
            },
            {
              key: "outstanding",
              label: "Outstanding",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No source data available."
        />

        <ReportTableClient
          title="Payment Methods"
          fileName="dashboard-payment-methods.csv"
          rows={paymentMethodSummary}
          searchKeys={["method"]}
          columns={[
            { key: "method", label: "Method", sortable: true },
            { key: "count", label: "Count", sortable: true },
            {
              key: "amount",
              label: "Collection",
              sortable: true,
              format: "currency_inr",
            },
          ]}
          emptyText="No payment method data available."
        />
      </section>

      <ReportTableClient
        title="Outstanding Dues Preview"
        fileName="dashboard-outstanding-dues.csv"
        rows={outstandingRows}
        searchKeys={["bookingCode", "guestName", "phone", "cottageName"]}
        columns={[
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
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
            label: "Due",
            sortable: true,
            format: "currency_inr",
          },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
          { key: "action", label: "Action", format: "billing_action" },
        ]}
        emptyText="No outstanding dues found for the selected filters."
      />

      <p className="text-xs text-[#6f7d74]">
        Last updated: {new Date(dataset.lastUpdated).toLocaleString("en-IN")}
      </p>
    </div>
  );
}