import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function BillingInvoicesReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { bookings } = await getReportDataset(from, to);
  return <div className="space-y-4"><AdminPageHeader title="Billing & Invoices Report" description="Invoice coverage and billing completeness." /><ReportsNav />
  <ReportSummaryCards cards={[
    { label: "Total Invoices", value: bookings.filter((b)=>b.invoiceNumber!=="Not generated").length },
    { label: "Generated Invoices", value: bookings.filter((b)=>b.invoiceNumber!=="Not generated").length },
    { label: "Not Generated", value: bookings.filter((b)=>b.invoiceNumber==="Not generated").length },
    { label: "Fully Paid", value: bookings.filter((b)=>b.paymentStatus==="paid").length },
    { label: "Partially Paid", value: bookings.filter((b)=>b.paymentStatus==="partially_paid" || b.paymentStatus==="advance_paid").length },
    { label: "Unpaid", value: bookings.filter((b)=>b.paymentStatus==="unpaid").length },
    { label: "Total Invoice Value", value: bookings.reduce((s,b)=>s+b.finalAmount,0), kind: "currency" },
    { label: "Total Balance", value: bookings.reduce((s,b)=>s+b.outstandingAmount,0), kind: "currency" },
  ]} />
  <ReportTableClient title="Invoices" fileName="billing-invoices-report.csv" rows={bookings} searchKeys={["invoiceNumber","bookingCode","guestName"]} columns={[
    { key: "invoiceNumber", label: "Invoice #", sortable: true },{ key: "bookingCode", label: "Booking" },{ key: "guestName", label: "Guest" },{ key: "invoiceDate", label: "Invoice Date" },{ key: "baseAmount", label: "Base", format: "currency_inr" },{ key: "extraCharges", label: "Extra", format: "currency_inr" },{ key: "discount", label: "Discount", format: "currency_inr" },{ key: "tax", label: "Tax", format: "currency_inr" },{ key: "finalAmount", label: "Final", format: "currency_inr" },{ key: "paidAmount", label: "Paid", format: "currency_inr" },{ key: "outstandingAmount", label: "Balance", format: "currency_inr" },{ key: "invoiceStatus", label: "Invoice Status" },{ key: "paymentStatus", label: "Payment Status" },
  ]} />
  </div>;
}
