import { addDays, format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { pct } from "@/features/admin/reports/reports.utils";

export default async function ForecastingReportPage() {
  const ds = await getReportDataset();
  const today = format(new Date(), "yyyy-MM-dd");
  const next90 = format(addDays(new Date(), 90), "yyyy-MM-dd");
  const upcoming = ds.bookings.filter((b) => b.checkIn >= today && b.checkIn <= next90 && !["cancelled", "rejected", "no_show"].includes(b.status));
  const views = [7, 15, 30, 90].map((days) => {
    const end = format(addDays(new Date(), days), "yyyy-MM-dd");
    const rows = upcoming.filter((b) => b.checkIn <= end);
    return { id: String(days), window: `Next ${days} days`, upcomingBookings: rows.length, expectedRevenue: rows.reduce((s, r) => s + r.finalAmount, 0), expectedCollection: rows.reduce((s, r) => s + r.paidAmount, 0), upcomingCheckins: rows.length, upcomingCheckouts: rows.filter((r) => r.checkOut <= end).length, availableCottageNights: Math.max(0, ds.cottages.length * days - rows.reduce((s, r) => s + r.nights, 0)), expectedOccupancy: pct(rows.reduce((s, r) => s + r.nights, 0), ds.cottages.length * days) };
  });
  return <div className="space-y-4"><AdminPageHeader title="Forecasting Report" description="Forward-looking expected business from upcoming non-cancelled bookings." /><ReportsNav />
    <ReportSummaryCards cards={[{label:"Upcoming Bookings",value:upcoming.length},{label:"Expected Revenue",value:upcoming.reduce((s,r)=>s+r.finalAmount,0),kind:"currency"},{label:"Expected Collection",value:upcoming.reduce((s,r)=>s+r.paidAmount,0),kind:"currency"},{label:"Upcoming Check-ins",value:upcoming.length},{label:"Upcoming Check-outs",value:upcoming.filter((r)=>r.checkOut>=today).length}]} />
    <ReportTableClient title="Forecast windows" fileName="forecasting-report.csv" rows={views} searchKeys={["window"]} columns={[{key:"window",label:"Window"},{key:"upcomingBookings",label:"Upcoming Bookings"},{key:"expectedRevenue",label:"Expected Revenue",format: "currency_inr"},{key:"expectedCollection",label:"Expected Collection",format: "currency_inr"},{key:"expectedOccupancy",label:"Expected Occupancy",format: "percent_1"},{key:"upcomingCheckins",label:"Check-ins"},{key:"upcomingCheckouts",label:"Check-outs"},{key:"availableCottageNights",label:"Available Cottage Nights"}]} />
  </div>;
}
