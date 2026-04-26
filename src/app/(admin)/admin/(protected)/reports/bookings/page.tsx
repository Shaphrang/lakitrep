import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function BookingsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { preset, from, to } = await resolveReportDateRange(Promise.resolve(params));
  const status = typeof params.status === "string" ? params.status : "all";
  const source = typeof params.source === "string" ? params.source : "all";
  const cottage = typeof params.cottage === "string" ? params.cottage : "all";
  const search = typeof params.q === "string" ? params.q : "";

  const { bookings, cottages } = await getReportDataset(from, to);
  const filtered = bookings.filter((booking) => {
    if (status !== "all" && booking.status !== status) return false;
    if (source !== "all" && booking.source !== source) return false;
    if (cottage !== "all" && booking.cottageId !== cottage) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit = [booking.bookingCode, booking.guestName, booking.phone].some((value) => value.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const statuses = Array.from(new Set(bookings.map((booking) => booking.status))).sort();
  const sources = Array.from(new Set(bookings.map((booking) => booking.source))).sort();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Bookings Report" description="Simple booking monitoring with operational filters." />
      <ReportsNav />
      <ReportsFilterBar
        preset={preset}
        from={from}
        to={to}
        search={search}
        searchPlaceholder="Search booking code, guest, phone"
        filters={[
          { name: "status", label: "Status", value: status, options: [{ value: "all", label: "All" }, ...statuses.map((value) => ({ value, label: value }))] },
          { name: "source", label: "Source", value: source, options: [{ value: "all", label: "All" }, ...sources.map((value) => ({ value, label: value }))] },
          { name: "cottage", label: "Cottage", value: cottage, options: [{ value: "all", label: "All" }, ...cottages.map((row) => ({ value: row.id, label: row.name }))] },
        ]}
      />
      <ReportSummaryCards
        cards={[
          { label: "Total Bookings", value: filtered.length },
          { label: "Confirmed Bookings", value: filtered.filter((booking) => ["confirmed", "advance_paid", "checked_in", "checked_out", "completed"].includes(booking.status)).length },
          { label: "Pending Bookings", value: filtered.filter((booking) => ["pending", "new_request", "contacted"].includes(booking.status)).length },
          { label: "Total Bill", value: filtered.reduce((sum, booking) => sum + booking.finalAmount, 0), kind: "currency" },
        ]}
      />
      <ReportTableClient
        title="Bookings"
        fileName="bookings-report.csv"
        rows={filtered}
        searchKeys={["bookingCode", "guestName", "phone", "cottageName", "source"]}
        columns={[
          { key: "bookingCode", label: "Booking Code", sortable: true },
          { key: "guestName", label: "Guest", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "cottageName", label: "Cottage", sortable: true },
          { key: "checkIn", label: "Check-in", sortable: true },
          { key: "checkOut", label: "Check-out", sortable: true },
          { key: "totalGuests", label: "Guests", sortable: true },
          { key: "status", label: "Status", sortable: true },
          { key: "source", label: "Source", sortable: true },
          { key: "finalAmount", label: "Total Bill", sortable: true, format: "currency_inr" },
          { key: "paymentStatus", label: "Payment Status", sortable: true },
        ]}
      />
    </div>
  );
}
