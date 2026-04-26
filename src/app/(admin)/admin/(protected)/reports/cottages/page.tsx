import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { pct, safeDivide } from "@/features/admin/reports/reports.utils";

export default async function CottagesReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const ds = await getReportDataset(from, to);
  const totalDays = Math.max(1, Math.ceil((new Date(to || new Date()).getTime() - new Date(from || new Date()).getTime()) / 86400000) || 30);
  const rows = ds.cottages.map((c) => {
    const bookings = ds.bookings.filter((b) => b.cottageId === c.id);
    const nights = bookings.reduce((s, b) => s + b.nights, 0);
    const rev = bookings.reduce((s, b) => s + b.finalAmount, 0);
    const paid = bookings.reduce((s, b) => s + b.paidAmount, 0);
    return { id: c.id, cottageName: c.name, totalBookings: bookings.length, totalNightsBooked: nights, occupancyRate: pct(nights, totalDays), totalRevenue: rev, totalCollection: paid, outstandingAmount: rev - paid, averageRevenuePerBooking: safeDivide(rev, bookings.length), averageStayDuration: safeDivide(nights, bookings.length), cancellationCount: bookings.filter((b) => b.status === "cancelled").length };
  });
  const bestRevenue = [...rows].sort((a,b)=>b.totalRevenue-a.totalRevenue)[0]?.cottageName ?? "—";
  const bestOcc = [...rows].sort((a,b)=>b.occupancyRate-a.occupancyRate)[0]?.cottageName ?? "—";
  const low = [...rows].sort((a,b)=>a.totalRevenue-b.totalRevenue)[0]?.cottageName ?? "—";
  return <div className="space-y-4"><AdminPageHeader title="Cottages Report" description="Performance by cottage for demand and promotion decisions." /><ReportsNav />
  <ReportSummaryCards cards={[{ label:"Best Cottage by Revenue", value: bestRevenue },{ label:"Best Cottage by Occupancy", value: bestOcc },{ label:"Lowest Performing", value: low },{ label:"Most Booked Cottage", value: [...rows].sort((a,b)=>b.totalBookings-a.totalBookings)[0]?.cottageName ?? "—" },{ label:"Most Cancelled Cottage", value: [...rows].sort((a,b)=>b.cancellationCount-a.cancellationCount)[0]?.cottageName ?? "—" }]} />
  <ReportTableClient title="Cottage Performance" fileName="cottages-report.csv" rows={rows} searchKeys={["cottageName"]} columns={[{key:"cottageName",label:"Cottage"},{key:"totalBookings",label:"Bookings",sortable:true},{key:"totalNightsBooked",label:"Nights",sortable:true},{key:"occupancyRate",label:"Occupancy",sortable:true,format:"percent_1"},{key:"totalRevenue",label:"Revenue",sortable:true,format:"currency"},{key:"totalCollection",label:"Collection",format:"currency"},{key:"outstandingAmount",label:"Outstanding",format:"currency"},{key:"averageRevenuePerBooking",label:"Avg/Booking",format:"currency"},{key:"averageStayDuration",label:"Avg Stay",format:"nights_1"},{key:"cancellationCount",label:"Cancelled"}]} />
  </div>;
}
