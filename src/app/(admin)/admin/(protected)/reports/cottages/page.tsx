import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { pct } from "@/features/admin/reports/reports.utils";

export default async function CottagesReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { preset, from, to } = await resolveReportDateRange(Promise.resolve(params));
  const status = typeof params.status === "string" ? params.status : "all";
  const search = typeof params.q === "string" ? params.q.toLowerCase() : "";

  const dataset = await getReportDataset(from, to);
  const totalDays = Math.max(1, Math.ceil((new Date(to || new Date()).getTime() - new Date(from || new Date()).getTime()) / 86400000) || 30);

  const rows = dataset.cottages
    .filter((cottage) => (status === "all" ? true : cottage.status === status))
    .map((cottage) => {
      const bookings = dataset.bookings.filter((booking) => booking.cottageId === cottage.id);
      const bookedNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);
      const revenue = bookings.reduce((sum, booking) => sum + booking.finalAmount, 0);
      const collection = bookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
      return {
        id: cottage.id,
        cottageName: cottage.name,
        totalBookings: bookings.length,
        bookedNights,
        occupancyRate: pct(bookedNights, totalDays),
        revenue,
        collection,
        outstanding: revenue - collection,
        cancellationCount: bookings.filter((booking) => booking.status === "cancelled").length,
      };
    })
    .filter((row) => (search ? row.cottageName.toLowerCase().includes(search) : true));

  const statuses = Array.from(new Set(dataset.cottages.map((cottage) => cottage.status))).sort();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Cottages Report" description="Cottage-level performance and collection visibility." />
      <ReportsNav />
      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={typeof params.q === "string" ? params.q : ""}
        searchPlaceholder="Search cottage"
        filters={[{ name: "status", label: "Cottage status", value: status, options: [{ value: "all", label: "All" }, ...statuses.map((value) => ({ value, label: value }))] }]}
      />
      <ReportSummaryCards
        cards={[
          { label: "Cottages", value: rows.length },
          { label: "Total Revenue", value: rows.reduce((sum, row) => sum + row.revenue, 0), kind: "currency" },
          { label: "Total Collection", value: rows.reduce((sum, row) => sum + row.collection, 0), kind: "currency" },
          { label: "Outstanding", value: rows.reduce((sum, row) => sum + row.outstanding, 0), kind: "currency" },
        ]}
      />
      <ReportTableClient
        title="Cottage Performance"
        fileName="cottages-report.csv"
        rows={rows}
        searchKeys={["cottageName"]}
        columns={[
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "totalBookings", label: "Total Bookings", sortable: true },
          { key: "bookedNights", label: "Booked Nights", sortable: true },
          { key: "occupancyRate", label: "Occupancy Rate", sortable: true, format: "percent_1" },
          { key: "revenue", label: "Revenue", sortable: true, format: "currency_inr" },
          { key: "collection", label: "Collection", sortable: true, format: "currency_inr" },
          { key: "outstanding", label: "Outstanding", sortable: true, format: "currency_inr" },
          { key: "cancellationCount", label: "Cancellation Count", sortable: true },
        ]}
      />
    </div>
  );
}
