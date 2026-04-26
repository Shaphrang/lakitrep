import { addDays, format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { enumerateDates, pct, safeDivide } from "@/features/admin/reports/reports.utils";

export default async function OccupancyReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const ds = await getReportDataset(from, to);
  const start = from || format(new Date(), "yyyy-MM-dd");
  const end = to || format(addDays(new Date(), 30), "yyyy-MM-dd");
  const dates = enumerateDates(start, end);
  const availableNights = ds.cottages.length * dates.length;
  const bookedNights = ds.bookings.reduce((s, b) => s + b.nights, 0);
  const rows = ds.cottages.map((c) => {
    const book = ds.bookings.filter((b) => b.cottageId === c.id);
    const nights = book.reduce((s, b) => s + b.nights, 0);
    const revenue = book.reduce((s, b) => s + b.finalAmount, 0);
    const blocked = ds.blockedNights.filter((n) => n.cottageId === c.id).length;
    return { id: c.id, cottage: c.name, totalAvailableNights: dates.length, bookedNights: nights, availableNights: Math.max(0, dates.length - nights - blocked), occupancyRate: pct(nights, dates.length), revenue, averageStayDuration: safeDivide(nights, book.length) };
  });
  return <div className="space-y-4"><AdminPageHeader title="Occupancy Report" description="Cottage-night occupancy, availability, and low-demand dates." /><ReportsNav />
    <ReportSummaryCards cards={[{label:"Total Available Cottage Nights",value:availableNights},{label:"Booked Cottage Nights",value:bookedNights},{label:"Occupancy Rate",value:pct(bookedNights,availableNights),kind:"percent"},{label:"Available Nights",value:Math.max(0,availableNights-bookedNights)},{label:"Blocked/Maintenance Nights",value:ds.blockedNights.length}]} />
    <ReportTableClient title="Occupancy by Cottage" fileName="occupancy-report.csv" rows={rows} searchKeys={["cottage"]} columns={[{key:"cottage",label:"Cottage"},{key:"totalAvailableNights",label:"Total Available"},{key:"bookedNights",label:"Booked"},{key:"availableNights",label:"Available"},{key:"occupancyRate",label:"Occupancy",format: "percent_1"},{key:"revenue",label:"Revenue",format: "currency_inr"},{key:"averageStayDuration",label:"Avg Stay",format: "nights_1"}]} />
    <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4"><h3 className="font-semibold">Calendar-style occupancy (next 14 days)</h3><div className="mt-3 overflow-x-auto"><table className="text-xs"><thead><tr><th className="sticky left-0 bg-white px-2 py-1 text-left">Cottage</th>{dates.slice(0,14).map((d)=><th key={d} className="px-2 py-1">{d.slice(5)}</th>)}</tr></thead><tbody>{ds.cottages.map((c)=><tr key={c.id}><td className="sticky left-0 bg-white px-2 py-1">{c.name}</td>{dates.slice(0,14).map((d)=>{const booked=ds.bookings.some((b)=>b.cottageId===c.id && d>=b.checkIn && d<b.checkOut);return <td key={d} className={`px-2 py-1 text-center ${booked?"bg-emerald-100":"bg-amber-50"}`}>{booked?"B":"A"}</td>;})}</tr>)}</tbody></table></div></section>
  </div>;
}
