import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportEmptyState } from "@/features/admin/reports/components/ReportEmptyState";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function ExtraChargesReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const ds = await getReportDataset(from, to);
  if (!ds.charges.length) return <div className="space-y-4"><AdminPageHeader title="Extra Charges Report" description="Charge analytics for ancillary revenue." /><ReportsNav /><ReportEmptyState title="No extra charges found" description="Extra charge entries are not available for the selected range." /></div>;
  const byType = Object.entries(ds.charges.reduce<Record<string,number>>((a,c)=>{a[c.chargeType]=(a[c.chargeType]??0)+c.amount;return a;},{})).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? "—";
  return <div className="space-y-4"><AdminPageHeader title="Extra Charges Report" description="Charge analytics for ancillary revenue." /><ReportsNav />
    <ReportSummaryCards cards={[{label:"Total Extra Charge Revenue",value:ds.charges.reduce((s,c)=>s+c.amount,0),kind:"currency"},{label:"Most Used Charge Type",value:byType}]} />
    <ReportTableClient title="Extra Charge Entries" fileName="extra-charges-report.csv" rows={ds.charges} searchKeys={["bookingCode","guestName","cottage","chargeType","description"]} columns={[{key:"bookingCode",label:"Booking"},{key:"guestName",label:"Guest"},{key:"cottage",label:"Cottage"},{key:"chargeType",label:"Charge Type"},{key:"description",label:"Description"},{key:"amount",label:"Amount",render:(r)=>`₹${r.amount.toLocaleString('en-IN')}`},{key:"dateAdded",label:"Date Added"}]} />
  </div>;
}
