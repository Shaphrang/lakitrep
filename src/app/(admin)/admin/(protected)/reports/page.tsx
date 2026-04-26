import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { REPORT_DATE_PRESETS } from "@/features/admin/reports/reports.constants";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { pct, safeDivide } from "@/features/admin/reports/reports.utils";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function ReportsDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { preset, from, to } = await resolveReportDateRange(searchParams);
  const dataset = await getReportDataset(from, to);
  const bookings = dataset.bookings;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.finalAmount, 0);
  const totalCollection = bookings.reduce((sum, b) => sum + b.paidAmount, 0);
  const outstanding = bookings.reduce((sum, b) => sum + b.outstandingAmount, 0);
  const cancelled = bookings.filter((b) => ["cancelled", "rejected", "no_show"].includes(b.status));
  const confirmed = bookings.filter((b) => ["confirmed", "advance_paid", "checked_in", "checked_out", "completed"].includes(b.status));
  const today = format(new Date(), "yyyy-MM-dd");
  const checkinsTodayUnpaid = bookings.filter((b) => b.checkIn === today && b.outstandingAmount > 0);
  const topCottage = Object.entries(bookings.reduce<Record<string, number>>((acc, b) => { acc[b.cottageName] = (acc[b.cottageName] ?? 0) + b.finalAmount; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topSource = Object.entries(bookings.reduce<Record<string, number>>((acc, b) => { acc[b.source] = (acc[b.source] ?? 0) + b.finalAmount; return acc; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const repeatCustomerCount = Object.values(bookings.reduce<Record<string, number>>((acc, b) => { const key = b.phone !== "-" ? b.phone : b.guestName; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {})).filter((count) => count > 1).length;
  const totalCustomers = Object.keys(bookings.reduce<Record<string, boolean>>((acc, b) => { const key = b.phone !== "-" ? b.phone : b.guestName; acc[key] = true; return acc; }, {})).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports Dashboard" description="Business analytics for bookings, revenue, collection, occupancy, and action points." />
      <ReportsNav />

      <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-5">
        <label className="text-sm">Date preset<select name="preset" defaultValue={preset} className={`${inputClass} mt-1 w-full`}>{REPORT_DATE_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>
        <label className="text-sm">From<input type="date" name="from" defaultValue={from} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">To<input type="date" name="to" defaultValue={to} className={`${inputClass} mt-1 w-full`} /></label>
        <button type="submit" className="self-end rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Apply</button>
      </form>

      <ReportSummaryCards cards={[
        { label: "Total Bookings", value: bookings.length },
        { label: "Confirmed Bookings", value: confirmed.length },
        { label: "Pending Bookings", value: bookings.filter((b) => ["pending", "new_request", "contacted"].includes(b.status)).length },
        { label: "Cancelled Bookings", value: cancelled.length },
        { label: "Total Revenue", value: totalRevenue, kind: "currency", helper: "Billed/final amount" },
        { label: "Total Collection", value: totalCollection, kind: "currency", helper: "Actual amount received" },
        { label: "Outstanding Amount", value: outstanding, kind: "currency" },
        { label: "Refund Amount", value: dataset.payments.filter((p) => p.paymentType === "refund").reduce((s, p) => s + p.amount, 0), kind: "currency" },
        { label: "Occupancy Rate", value: pct(bookings.reduce((s, b) => s + b.nights, 0), Math.max(1, dataset.cottages.filter((c) => c.isBookable).length * 30)), kind: "percent", helper: "Booked nights / available nights" },
        { label: "Average Booking Value", value: safeDivide(totalRevenue, bookings.length), kind: "currency" },
        { label: "Average Stay Duration", value: safeDivide(bookings.reduce((s, b) => s + b.nights, 0), bookings.length).toFixed(1) + " nights" },
        { label: "Repeat Customers", value: repeatCustomerCount, helper: `${pct(repeatCustomerCount, totalCustomers).toFixed(1)}% of customers` },
        { label: "Top Cottage", value: topCottage },
        { label: "Top Booking Source", value: topSource },
      ]} />

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
        <h3 className="font-semibold">Action Required / Business Insights</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#33453a]">
          <li>{bookings.filter((b) => ["pending", "new_request"].includes(b.status)).length} pending bookings need confirmation.</li>
          <li>{checkinsTodayUnpaid.length} guest(s) checking in today ({today}) have unpaid balance.</li>
          <li>{bookings.filter((b) => b.checkOut < today && b.outstandingAmount > 0).length} past check-out bookings still have dues.</li>
          <li>Top performing cottage: {topCottage}. Best source by revenue: {topSource}.</li>
          <li>{bookings.filter((b) => b.invoiceNumber === "Not generated" && ["checked_out", "completed"].includes(b.status)).length} completed stays are missing invoice generation.</li>
        </ul>
      </section>

      {dataset.limitations.length ? <section className="rounded-2xl border border-[#e7d6b9] bg-[#fff9ef] p-4 text-sm text-[#7a6032]"><h3 className="font-semibold">Data limitations</h3><ul className="mt-2 list-disc pl-5">{dataset.limitations.map((l) => <li key={l}>{l}</li>)}</ul></section> : null}

      <p className="text-xs text-[#6f7d74]">Last updated: {new Date(dataset.lastUpdated).toLocaleString("en-IN")}</p>
    </div>
  );
}
