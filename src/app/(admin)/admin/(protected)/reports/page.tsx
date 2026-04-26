import Link from "next/link";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { REPORT_DATE_PRESETS } from "@/features/admin/reports/reports.constants";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { averageBookingValue, collectionRate, currency, occupancyRate, repeatCustomerRate } from "@/features/admin/reports/reports.utils";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";
const trendBaseClass = "h-2 rounded-full bg-emerald-700";

export default async function ReportsDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { preset, from, to } = await resolveReportDateRange(searchParams);
  const dataset = await getReportDataset(from, to);
  const bookings = dataset.bookings;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalCollection = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const totalNights = bookings.reduce((sum, b) => sum + b.nights, 0);
  const outstanding = bookings.reduce((sum, b) => sum + b.outstandingAmount, 0);
  const cancelled = bookings.filter((b) => ["cancelled", "rejected", "no_show"].includes(b.status));
  const confirmed = bookings.filter((b) => ["confirmed", "advance_paid", "checked_in", "checked_out", "completed"].includes(b.status));
  const pending = bookings.filter((b) => ["pending", "new_request", "contacted"].includes(b.status));
  const today = format(new Date(), "yyyy-MM-dd");
  const checkinsToday = bookings.filter((b) => b.checkIn === today);
  const checkoutsToday = bookings.filter((b) => b.checkOut === today);
  const checkinsTodayUnpaid = checkinsToday.filter((b) => b.outstandingAmount > 0);

  const sourceRows = Object.entries(
    bookings.reduce<Record<string, { bookings: number; revenue: number; collection: number }>>((acc, booking) => {
      const source = booking.source || "other";
      if (!acc[source]) acc[source] = { bookings: 0, revenue: 0, collection: 0 };
      acc[source].bookings += 1;
      acc[source].revenue += booking.finalAmount;
      acc[source].collection += booking.paidAmount;
      return acc;
    }, {}),
  )
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.bookings - a.bookings);

  const topSource = sourceRows[0]?.source ?? "—";
  const topCottage = Object.entries(bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.cottageName] = (acc[b.cottageName] ?? 0) + b.finalAmount;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const cottages = dataset.cottages.filter((c) => c.isBookable);
  const availableCottageNights = Math.max(1, cottages.length * 30);
  const repeatCustomerCount = Object.values(bookings.reduce<Record<string, number>>((acc, b) => {
    const key = b.phone !== "-" ? b.phone : b.guestName;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {})).filter((count) => count > 1).length;
  const totalCustomers = Object.keys(bookings.reduce<Record<string, boolean>>((acc, b) => {
    const key = b.phone !== "-" ? b.phone : b.guestName;
    acc[key] = true;
    return acc;
  }, {})).length;

  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const rows = bookings.filter((booking) => booking.checkIn.slice(5, 7) === month);
    return {
      month: format(new Date(`2026-${month}-01`), "MMM"),
      revenue: rows.reduce((sum, row) => sum + row.finalAmount, 0),
      collection: rows.reduce((sum, row) => sum + row.paidAmount, 0),
    };
  });

  const trendMax = Math.max(1, ...monthlyTrend.map((row) => Math.max(row.revenue, row.collection)));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports Dashboard" description="Overview of resort performance" />
      <ReportsNav />

      <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 lg:grid-cols-7">
        <label className="text-sm">Date preset<select name="preset" defaultValue={preset} className={`${inputClass} mt-1 w-full`}>{REPORT_DATE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
        <label className="text-sm">From<input type="date" name="from" defaultValue={from} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">To<input type="date" name="to" defaultValue={to} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm lg:col-span-2">Search<input name="q" placeholder="Search by booking / guest / source" className={`${inputClass} mt-1 w-full`} /></label>
        <button type="submit" className="self-end rounded-xl border border-[#d8cfbf] px-3 py-2 text-sm font-semibold text-[#2b4637]">Filter</button>
        <Link href="/admin/reports/bookings" className="self-end rounded-xl bg-[#2e5a3d] px-3 py-2 text-center text-sm font-semibold text-white">Export CSV</Link>
      </form>

      <ReportSummaryCards cards={[
        { label: "Total Bookings", value: bookings.length },
        { label: "Confirmed Bookings", value: confirmed.length },
        { label: "Pending Bookings", value: pending.length },
        { label: "Cancelled Bookings", value: cancelled.length },
        { label: "Total Revenue", value: totalRevenue, kind: "currency", helper: "Final bill amount" },
        { label: "Total Collection", value: totalCollection, kind: "currency", helper: "Actual paid amount" },
        { label: "Outstanding Amount", value: outstanding, kind: "currency" },
        { label: "Occupancy Rate", value: occupancyRate(totalNights, availableCottageNights), kind: "percent" },
        { label: "Average Booking Value", value: averageBookingValue(totalRevenue, bookings.length), kind: "currency" },
        { label: "Repeat Customers", value: repeatCustomerCount, helper: `${repeatCustomerRate(repeatCustomerCount, totalCustomers).toFixed(1)}% of customers` },
      ]} />

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 lg:col-span-2">
          <h3 className="font-semibold">Revenue & Collection Trend</h3>
          <div className="mt-4 space-y-2">
            {monthlyTrend.map((row) => (
              <div key={row.month} className="grid grid-cols-[50px_1fr_90px_90px] items-center gap-2 text-xs">
                <span className="text-[#55685c]">{row.month}</span>
                <div className="space-y-1">
                  <div className={`${trendBaseClass}`} style={{ width: `${(row.revenue / trendMax) * 100}%` }} />
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: `${(row.collection / trendMax) * 100}%` }} />
                </div>
                <span>{currency(row.revenue)}</span>
                <span>{currency(row.collection)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold">Booking Status</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Confirmed: <strong>{confirmed.length}</strong></li>
            <li>Pending: <strong>{pending.length}</strong></li>
            <li>Cancelled: <strong>{cancelled.length}</strong></li>
            <li>Collection Rate: <strong>{collectionRate(totalCollection, totalRevenue).toFixed(1)}%</strong></li>
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold">Bookings by Source</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {sourceRows.slice(0, 6).map((row) => <li key={row.source} className="flex justify-between"><span>{row.source}</span><strong>{row.bookings}</strong></li>)}
            {sourceRows.length === 0 ? <li>No data available</li> : null}
          </ul>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold">Action Required / Insights</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#33453a]">
            <li>{pending.length} pending bookings need confirmation.</li>
            <li>{checkinsTodayUnpaid.length} today&apos;s check-ins have unpaid balance.</li>
            <li>{bookings.filter((b) => b.checkOut < today && b.outstandingAmount > 0).length} past check-outs still have dues.</li>
            <li>{bookings.filter((b) => b.invoiceNumber === "Not generated" && ["checked_out", "completed"].includes(b.status)).length} completed stays are missing invoice generation.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold">Today&apos;s Operations</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Check-ins: <strong>{checkinsToday.length}</strong></li>
            <li>Check-outs: <strong>{checkoutsToday.length}</strong></li>
            <li>Top Booking Source: <strong>{topSource}</strong></li>
            <li>Top Cottage: <strong>{topCottage}</strong></li>
          </ul>
        </article>
      </section>

      {dataset.limitations.length ? <section className="rounded-2xl border border-[#e7d6b9] bg-[#fff9ef] p-4 text-sm text-[#7a6032]"><h3 className="font-semibold">Data limitations</h3><ul className="mt-2 list-disc pl-5">{dataset.limitations.map((l) => <li key={l}>{l}</li>)}</ul></section> : null}

      <p className="text-xs text-[#6f7d74]">Last updated: {new Date(dataset.lastUpdated).toLocaleString("en-IN")}</p>
    </div>
  );
}
