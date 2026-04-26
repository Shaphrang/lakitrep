import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { pct } from "@/features/admin/reports/reports.utils";

export default async function CancellationsRefundsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const ds = await getReportDataset(from, to);
  const rows = ds.bookings.filter((b)=>["cancelled","rejected","no_show"].includes(b.status)).map((b)=>({
    ...b,
    cancellationReason: "Not available",
    refundAmount: ds.payments.filter((p)=>p.bookingCode===b.bookingCode && p.paymentType==="refund").reduce((s,p)=>s+p.amount,0),
    lostRevenue: b.finalAmount,
    cancelledBy: "Not available",
  }));
  return <div className="space-y-4"><AdminPageHeader title="Cancellations & Refunds Report" description="Cancellation impact and refund tracking using available payment records." /><ReportsNav />
  <ReportSummaryCards cards={[{label:"Cancellation Count",value:rows.length},{label:"Cancellation Rate",value:pct(rows.length,ds.bookings.length),kind:"percent"},{label:"Lost Revenue",value:rows.reduce((s,r)=>s+r.lostRevenue,0),kind:"currency"},{label:"Refund Amount",value:rows.reduce((s,r)=>s+r.refundAmount,0),kind:"currency"}]} />
  <ReportTableClient title="Cancellation Details" fileName="cancellations-refunds-report.csv" rows={rows} searchKeys={["bookingCode","guestName","phone","source","cottageName"]} columns={[{key:"bookingCode",label:"Booking"},{key:"guestName",label:"Guest"},{key:"phone",label:"Phone"},{key:"cottageName",label:"Cottage"},{key:"checkIn",label:"Check-in"},{key:"checkOut",label:"Check-out"},{key:"source",label:"Source"},{key:"cancelledDate",label:"Cancelled Date"},{key:"cancellationReason",label:"Reason"},{key:"lostRevenue",label:"Lost Revenue",format:"currency"},{key:"refundAmount",label:"Refund",format:"currency"},{key:"cancelledBy",label:"Cancelled By"}]} />
  </div>;
}
