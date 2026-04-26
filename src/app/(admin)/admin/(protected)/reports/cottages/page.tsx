import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getRevenueReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import {
  formatDateOnly,
  pct,
} from "@/features/admin/reports/reports.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function daysBetweenInclusive(from: string, to: string) {
  if (!from || !to) return 1;

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

export default async function CottagesReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const { preset, from, to } = await resolveReportDateRange(
    Promise.resolve(params),
  );

  const cottageStatus =
    typeof params.status === "string" ? params.status : "all";
  const search = typeof params.q === "string" ? params.q : "";

  const dataset = await getRevenueReportDataset({
    from,
    to,
    q: search,
  });

  const totalDays = daysBetweenInclusive(from, to);

  const rows = dataset.cottages
    .map((cottage) => {
      const bookings = dataset.revenueRows.filter(
        (booking) => booking.cottageId === cottage.id,
      );

      const bookedNights = bookings.reduce(
        (sum, booking) => sum + Number(booking.nights || 0),
        0,
      );

      const revenue = bookings.reduce(
        (sum, booking) => sum + booking.finalBill,
        0,
      );

      const collection = bookings.reduce(
        (sum, booking) => sum + booking.paidAmount,
        0,
      );

      const outstanding = bookings.reduce(
        (sum, booking) => sum + booking.outstanding,
        0,
      );

      const cancellationCount = bookings.filter(
        (booking) => booking.bookingStatus === "cancelled",
      ).length;

      return {
        id: cottage.id,
        cottageName: cottage.name,
        cottageStatus: "active",
        totalBookings: bookings.length,
        bookedNights,
        availableNights: totalDays,
        occupancyRate: pct(bookedNights, totalDays),
        revenue,
        collection,
        outstanding,
        cancellationCount,
      };
    })
    .filter((row) => {
      if (cottageStatus !== "all" && row.cottageStatus !== cottageStatus) {
        return false;
      }

      if (search) {
        return row.cottageName.toLowerCase().includes(search.toLowerCase());
      }

      return true;
    });

  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalCollection = rows.reduce((sum, row) => sum + row.collection, 0);
  const totalOutstanding = rows.reduce((sum, row) => sum + row.outstanding, 0);
  const totalBookedNights = rows.reduce(
    (sum, row) => sum + row.bookedNights,
    0,
  );

  const totalAvailableNights = rows.reduce(
    (sum, row) => sum + row.availableNights,
    0,
  );

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Cottages Report"
        description="Simple cottage-wise performance report with revenue, collection, outstanding amount, booked nights and occupancy."
      />

      <ReportsNav />

      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search cottage"
        clearHref="/admin/reports/cottages"
        filters={[
          {
            name: "status",
            label: "Cottage status",
            value: cottageStatus,
            options: [
              { value: "all", label: "All cottages" },
              { value: "active", label: "Active" },
            ],
          },
        ]}
      />

      <section className="rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(120deg,#fbf8f2_0%,#f2ede3_100%)] p-4">
        <h2 className="text-lg font-semibold text-[#21392c]">
          Cottage Performance Overview
        </h2>
        <p className="mt-1 text-sm text-[#65756a]">
          Revenue and collection are based on records created from{" "}
          <span className="font-medium text-[#21392c]">
            {formatDateOnly(from)}
          </span>{" "}
          to{" "}
          <span className="font-medium text-[#21392c]">
            {formatDateOnly(to)}
          </span>
          . Booked nights are calculated from the bookings included in this
          selected period.
        </p>
      </section>

      <ReportSummaryCards
        cards={[
          {
            label: "Cottages",
            value: rows.length,
            helper: "Total cottages shown",
          },
          {
            label: "Total Bookings",
            value: rows.reduce((sum, row) => sum + row.totalBookings, 0),
            helper: "Bookings created in selected date range",
          },
          {
            label: "Booked Nights",
            value: totalBookedNights,
            helper: "Total booked nights from filtered bookings",
          },
          {
            label: "Occupancy Rate",
            value: pct(totalBookedNights, totalAvailableNights),
            kind: "percent",
            helper: "Booked nights divided by available cottage nights",
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
            helper: "Amount collected",
          },
          {
            label: "Outstanding",
            value: totalOutstanding,
            kind: "currency",
            helper: "Amount still pending",
          },
          {
            label: "Cancelled Bookings",
            value: rows.reduce((sum, row) => sum + row.cancellationCount, 0),
            helper: "Cancelled bookings in selected data",
          },
        ]}
      />

      <ReportTableClient
        title="Cottage Performance"
        fileName="cottages-report.csv"
        rows={rows}
        searchKeys={["cottageName"]}
        columns={[
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "totalBookings", label: "Bookings", sortable: true },
          { key: "bookedNights", label: "Booked Nights", sortable: true },
          {
            key: "availableNights",
            label: "Available Nights",
            sortable: true,
          },
          {
            key: "occupancyRate",
            label: "Occupancy",
            sortable: true,
            format: "percent_1",
          },
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
          {
            key: "cancellationCount",
            label: "Cancelled",
            sortable: true,
          },
        ]}
        emptyText="No cottage report data found for the selected filters."
      />
    </div>
  );
}