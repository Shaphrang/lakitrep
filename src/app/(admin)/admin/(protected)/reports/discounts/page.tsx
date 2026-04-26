import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportEmptyState } from "@/features/admin/reports/components/ReportEmptyState";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function DiscountsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const ds = await getReportDataset(from, to);
  const rows = ds.bookings.filter((b)=>b.discount>0).map((b)=>({ ...b, originalAmount: b.baseAmount + b.extraCharges, discountAmount: b.discount, discountReason: "Not available", approvedBy: "Not available", date: b.createdAt.slice(0,10) }));
  if (!rows.length) return <div className="space-y-4"><AdminPageHeader title="Discounts Report" description="Discount impact and revenue leakage tracking." /><ReportsNav /><ReportEmptyState title="Discount data is limited" description="Discount amount exists, but discount reason/approved-by tracking is not configured in current schema." /></div>;
  return <div className="space-y-4"><AdminPageHeader title="Discounts Report" description="Discount impact and revenue leakage tracking." /><ReportsNav />
    <ReportSummaryCards cards={[{label:"Total Discount Given",value:rows.reduce((s,r)=>s+r.discountAmount,0),kind:"currency"},{label:"Revenue Lost Due to Discount",value:rows.reduce((s,r)=>s+r.discountAmount,0),kind:"currency"}]} />
    <ReportTableClient title="Discounted Bookings" fileName="discounts-report.csv" rows={rows} searchKeys={["bookingCode","guestName","cottageName"]} columns={[{key:"bookingCode",label:"Booking"},{key:"guestName",label:"Guest"},{key:"cottageName",label:"Cottage"},{key:"originalAmount",label:"Original",format: "currency_inr"},{key:"discountAmount",label:"Discount",format: "currency_inr"},{key:"discountReason",label:"Reason"},{key:"finalAmount",label:"Final",format: "currency_inr"},{key:"approvedBy",label:"Approved By"},{key:"date",label:"Date"}]} />
  </div>;
}
