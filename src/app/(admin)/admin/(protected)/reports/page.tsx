import Link from "next/link";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ExportCsvButton } from "@/features/admin/reports/components/ExportCsvButton";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { averageBookingValue, collectionRate, occupancyRate } from "@/features/admin/reports/reports.utils";

const confirmedStatuses = ["confirmed", "advance_paid", "checked_in", "checked_out", "completed"];

export default async function ReportsDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const { preset, from, to } = await resolveReportDateRange(Promise.resolve(params));
  const search = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const source = typeof params.source === "string" ? params.source : "all";

  const dataset = await getReportDataset(from, to);

  const bookings = dataset.bookings.filter((booking) => {
    if (source !== "all" && booking.source !== source) return false;
    if (!search) return true;
    return [booking.bookingCode, booking.guestName, booking.phone, booking.cottageName, booking.source].some((value) => value.toLowerCase().includes(search));
  });

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.finalAmount, 0);
  const totalCollection = bookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const outstanding = bookings.reduce((sum, booking) => sum + booking.outstandingAmount, 0);
  const totalNights = bookings.reduce((sum, booking) => sum + booking.nights, 0);

  const today = format(new Date(), "yyyy-MM-dd");
  const confirmed = bookings.filter((booking) => confirmedStatuses.includes(booking.status));
  const pending = bookings.filter((booking) => ["pending", "new_request", "contacted"].includes(booking.status));
  const checkinsToday = bookings.filter((booking) => booking.checkIn === today);
  const checkoutsToday = bookings.filter((booking) => booking.checkOut === today);

  const bookableCottages = dataset.cottages.filter((cottage) => cottage.isBookable).length;
  const occupiedNightDenominator = Math.max(1, bookableCottages * 30);

  const statusSummary = Object.entries(
    bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.status] = (acc[booking.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const cottagePerformance = Object.entries(
    bookings.reduce<Record<string, { bookings: number; revenue: number; collection: number }>>((acc, booking) => {
      if (!acc[booking.cottageName]) acc[booking.cottageName] = { bookings: 0, revenue: 0, collection: 0 };
      acc[booking.cottageName].bookings += 1;
      acc[booking.cottageName].revenue += booking.finalAmount;
      acc[booking.cottageName].collection += booking.paidAmount;
      return acc;
    }, {}),
  )
    .map(([cottageName, values]) => ({ cottageName, ...values }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const trend = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - index));
    const monthKey = format(month, "yyyy-MM");
    const rows = bookings.filter((booking) => booking.checkIn.startsWith(monthKey));
    return {
      label: format(month, "MMM"),
      revenue: rows.reduce((sum, booking) => sum + booking.finalAmount, 0),
      collection: rows.reduce((sum, booking) => sum + booking.paidAmount, 0),
    };
  });

  const trendMax = Math.max(1, ...trend.map((row) => Math.max(row.revenue, row.collection)));

  const dueRows = [...bookings]
    .filter((booking) => booking.outstandingAmount > 0)
    .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
    .slice(0, 6);

  const dashboardExportRows = bookings.map((booking) => ({
    booking_code: booking.bookingCode,
    guest: booking.guestName,
    cottage: booking.cottageName,
    status: booking.status,
    source: booking.source,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    final_bill: `₹${booking.finalAmount.toLocaleString("en-IN")}`,
    paid_amount: `₹${booking.paidAmount.toLocaleString("en-IN")}`,
    outstanding_amount: `₹${booking.outstandingAmount.toLocaleString("en-IN")}`,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports Dashboard" description="Quick overview of resort performance" />
      <ReportsNav />

      <div className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-[#fffdf9] p-4 lg:grid-cols-4">
        <ReportsFilterBar
          preset={preset}
          from={from}
          to={to}
          search={typeof params.q === "string" ? params.q : ""}
          searchPlaceholder="Search booking, guest, cottage, source"
          filters={[{ name: "source", label: "Source", value: source, options: [{ value: "all", label: "All" }, ...Array.from(new Set(dataset.bookings.map((booking) => booking.source))).map((value) => ({ value, label: value }))] }]}
        />
        <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-4">
          <ExportCsvButton fileName="reports-dashboard-summary.csv" rows={dashboardExportRows} />
          <Link href="/admin/reports" className="rounded-xl border border-[#d8cfbf] px-3 py-2 text-sm font-semibold text-[#2b4637]">Refresh</Link>
          <p className="text-xs text-[#6f7d74]">Last updated: {new Date(dataset.lastUpdated).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <ReportSummaryCards
        cards={[
          { label: "Total Bookings", value: bookings.length },
          { label: "Confirmed Bookings", value: confirmed.length },
          { label: "Total Revenue", value: totalRevenue, kind: "currency" },
          { label: "Total Collection", value: totalCollection, kind: "currency" },
          { label: "Outstanding Amount", value: outstanding, kind: "currency" },
          { label: "Occupancy Rate", value: occupancyRate(totalNights, occupiedNightDenominator), kind: "percent" },
          { label: "Today's Check-ins", value: checkinsToday.length },
          { label: "Today's Check-outs", value: checkoutsToday.length },
          { label: "Average Booking Value", value: averageBookingValue(totalRevenue, Math.max(1, bookings.length)), kind: "currency" },
          { label: "Top Cottage", value: cottagePerformance[0]?.cottageName ?? "—" },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 lg:col-span-2">
          <h3 className="font-semibold text-[#21392c]">Revenue vs Collection trend</h3>
          <div className="mt-4 space-y-2">
            {trend.map((row) => (
              <div key={row.label} className="grid grid-cols-[52px_1fr_95px_95px] items-center gap-2 text-xs">
                <span className="text-[#55685c]">{row.label}</span>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-[#2e5a3d]" style={{ width: `${(row.revenue / trendMax) * 100}%` }} />
                  <div className="h-2 rounded-full bg-[#d2ac67]" style={{ width: `${(row.collection / trendMax) * 100}%` }} />
                </div>
                <span>₹{Math.round(row.revenue).toLocaleString("en-IN")}</span>
                <span>₹{Math.round(row.collection).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold text-[#21392c]">Booking status summary</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {statusSummary.slice(0, 6).map(([status, count]) => (
              <li key={status} className="flex justify-between"><span>{status}</span><strong>{count}</strong></li>
            ))}
            <li className="flex justify-between border-t pt-2"><span>Collection Rate</span><strong>{collectionRate(totalCollection, totalRevenue).toFixed(1)}%</strong></li>
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
          <h3 className="font-semibold text-[#21392c]">Cottage performance summary</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {cottagePerformance.map((row) => (
              <li key={row.cottageName} className="space-y-1 rounded-xl bg-[#f8f4ea] p-2">
                <p className="font-medium">{row.cottageName}</p>
                <p className="text-xs text-[#55685c]">Bookings: {row.bookings} · Revenue: ₹{Math.round(row.revenue).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4 lg:col-span-2">
          <h3 className="font-semibold text-[#21392c]">Action required</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#33453a]">
            <li>{pending.length} pending bookings need confirmation.</li>
            <li>{bookings.filter((booking) => booking.outstandingAmount > 0).length} bookings have unpaid balances.</li>
            <li>{checkinsToday.filter((booking) => booking.outstandingAmount > 0).length} today&apos;s arrivals have pending payment.</li>
            <li>{bookings.filter((booking) => booking.invoiceNumber === "Not generated" && ["checked_out", "completed"].includes(booking.status)).length} bookings have billing not finalized.</li>
            <li>{occupancyRate(totalNights, occupiedNightDenominator) < 40 ? "Low occupancy warning: below 40% for selected range." : "Occupancy is healthy for selected range."}</li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#21392c]">Outstanding dues preview</h3>
          <Link href="/admin/reports/revenue" className="text-sm font-semibold text-[#2e5a3d]">Open full revenue report</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f4efe4] text-[#536458]">
              <tr>
                <th className="px-3 py-2">Booking Code</th>
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Cottage</th>
                <th className="px-3 py-2">Total Bill</th>
                <th className="px-3 py-2">Paid</th>
                <th className="px-3 py-2">Due</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {dueRows.map((row) => (
                <tr key={row.id} className="border-t border-[#eee6da]">
                  <td className="whitespace-nowrap px-3 py-2">{row.bookingCode}</td>
                  <td className="whitespace-nowrap px-3 py-2">{row.guestName}</td>
                  <td className="whitespace-nowrap px-3 py-2">{row.cottageName}</td>
                  <td className="whitespace-nowrap px-3 py-2">₹{row.finalAmount.toLocaleString("en-IN")}</td>
                  <td className="whitespace-nowrap px-3 py-2">₹{row.paidAmount.toLocaleString("en-IN")}</td>
                  <td className="whitespace-nowrap px-3 py-2">₹{row.outstandingAmount.toLocaleString("en-IN")}</td>
                  <td className="whitespace-nowrap px-3 py-2"><Link className="font-semibold text-[#2e5a3d]" href={`/admin/billing/${row.id}`}>Open Billing</Link></td>
                </tr>
              ))}
              {dueRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-[#6f7d74]" colSpan={7}>No outstanding dues in the selected range.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
