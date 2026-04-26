import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function PaymentsCollectionsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { payments, bookings } = await getReportDataset(from, to);
  const total = payments.filter((p)=>p.paymentType!=="refund").reduce((s,p)=>s+p.amount,0);
  const refunds = payments.filter((p)=>p.paymentType==="refund").reduce((s,p)=>s+p.amount,0);
  const mode = (m:string)=>payments.filter((p)=>p.method===m).reduce((s,p)=>s+p.amount,0);
  const pending = bookings.reduce((s,b)=>s+b.outstandingAmount,0);
  return <div className="space-y-4"><AdminPageHeader title="Payments & Collections Report" description="Actual receipts with method split and pending collection." /><ReportsNav />
  <ReportSummaryCards cards={[
    { label: "Total Collection", value: total, kind: "currency" },{ label: "Cash Collection", value: mode("cash"), kind: "currency" },{ label: "UPI Collection", value: mode("upi"), kind: "currency" },{ label: "Card Collection", value: mode("card"), kind: "currency" },{ label: "Bank Transfer", value: mode("bank_transfer"), kind: "currency" },{ label: "Online/Other", value: mode("other"), kind: "currency" },{ label: "Pending Collection", value: pending, kind: "currency" },{ label: "Refunds", value: refunds, kind: "currency" },{ label: "Partial Payments", value: bookings.filter((b)=>b.paymentStatus==="partially_paid").length },
  ]} />
  <ReportTableClient title="Payment Transactions" fileName="payments-collections-report.csv" rows={payments} searchKeys={["bookingCode","guestName","phone","method","transactionReference"]} columns={[
    { key: "paymentDate", label: "Payment Date", sortable: true },{ key: "bookingCode", label: "Booking", sortable: true },{ key: "guestName", label: "Guest" },{ key: "phone", label: "Phone" },{ key: "method", label: "Method", sortable: true },{ key: "amount", label: "Amount", sortable: true, format:"currency" },{ key: "collectedBy", label: "Collected By" },{ key: "transactionReference", label: "Txn Ref" },{ key: "status", label: "Status" },{ key: "remarks", label: "Remarks" },
  ]} />
  </div>;
}
