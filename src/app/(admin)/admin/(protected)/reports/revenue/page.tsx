import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { safeDivide } from "@/features/admin/reports/reports.utils";

export default async function RevenueReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { bookings } = await getReportDataset(from, to);
  const gross = bookings.reduce((s, b) => s + b.finalAmount, 0);
  const roomRevenue = bookings.reduce((s, b) => s + b.baseAmount, 0);
  const extra = bookings.reduce((s, b) => s + b.extraCharges, 0);
  const discount = bookings.reduce((s, b) => s + b.discount, 0);
  const tax = bookings.reduce((s, b) => s + b.tax, 0);
  const collection = bookings.reduce((s, b) => s + b.paidAmount, 0);
  return <div className="space-y-4"><AdminPageHeader title="Revenue Report" description="Revenue is billed amount; collection is actual received amount." /><ReportsNav />
  <ReportSummaryCards cards={[
    { label: "Gross Revenue", value: gross, kind: "currency" },
    { label: "Net Revenue", value: gross - discount, kind: "currency" },
    { label: "Room Revenue", value: roomRevenue, kind: "currency" },
    { label: "Extra Charge Revenue", value: extra, kind: "currency" },
    { label: "Discount Given", value: discount, kind: "currency" },
    { label: "Tax Collected", value: tax, kind: "currency" },
    { label: "Total Collection", value: collection, kind: "currency" },
    { label: "Outstanding", value: gross - collection, kind: "currency" },
    { label: "Average Booking Value", value: safeDivide(gross, bookings.length), kind: "currency" },
  ]} />
  <ReportTableClient title="Revenue Details" fileName="revenue-report.csv" rows={bookings} searchKeys={["bookingCode","guestName","cottageName","invoiceNumber"]} columns={[
    { key: "bookingCode", label: "Booking" },{ key: "guestName", label: "Guest" },{ key: "cottageName", label: "Cottage" },{ key: "checkIn", label: "Check-in" },{ key: "checkOut", label: "Check-out" },{ key: "baseAmount", label: "Base", sortable: true, format:"currency" },{ key: "extraCharges", label: "Extra", sortable:true, format:"currency" },{ key: "discount", label: "Discount", sortable:true, format:"currency" },{ key: "tax", label: "Tax", sortable:true, format:"currency" },{ key: "finalAmount", label: "Final Bill", sortable:true, format:"currency" },{ key: "paidAmount", label: "Paid", sortable:true, format:"currency" },{ key: "outstandingAmount", label: "Balance", sortable:true, format:"currency" },{ key: "paymentStatus", label: "Payment" },{ key: "invoiceStatus", label: "Invoice" },
  ]} />
  </div>;
}
