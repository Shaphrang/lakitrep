import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function OutstandingDuesReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { bookings } = await getReportDataset(from, to);
  const dues = bookings.filter((b) => b.outstandingAmount > 0);
  const today = format(new Date(), "yyyy-MM-dd");
  return <div className="space-y-4"><AdminPageHeader title="Outstanding Dues Report" description="Critical collection follow-up report (only bookings with due amount)." /><ReportsNav />
  <ReportSummaryCards cards={[
    { label: "Total Outstanding", value: dues.reduce((s,b)=>s+b.outstandingAmount,0), kind: "currency" },
    { label: "Unpaid Bookings", value: dues.filter((b)=>b.paymentStatus==="unpaid").length },
    { label: "Partially Paid", value: dues.filter((b)=>b.paymentStatus==="partially_paid" || b.paymentStatus==="advance_paid").length },
    { label: "Past Checkout With Due", value: dues.filter((b)=>b.checkOut<today).length },
    { label: "Upcoming Check-in With Due", value: dues.filter((b)=>b.checkIn>=today).length },
  ]} />
  <ReportTableClient title="Outstanding Bookings" fileName="outstanding-dues-report.csv" rows={dues.map((d)=>({...d,dueSince:d.checkOut<today?d.checkOut:d.checkIn,whatsappReminder:d.phone!=='-'?`https://wa.me/${d.phone.replace(/\D/g,'')}`:'—'}))} searchKeys={["bookingCode","guestName","phone","cottageName","source"]} columns={[
    { key: "bookingCode", label: "Booking" },{ key: "guestName", label: "Guest" },{ key: "phone", label: "Phone" },{ key: "cottageName", label: "Cottage" },{ key: "checkIn", label: "Check-in" },{ key: "checkOut", label: "Check-out" },{ key: "finalAmount", label: "Total Bill", format:"currency" },{ key: "paidAmount", label: "Paid", format:"currency" },{ key: "outstandingAmount", label: "Due", format:"currency" },{ key: "dueSince", label: "Due Since" },{ key: "paymentStatus", label: "Payment" },{ key: "source", label: "Source" },{ key: "whatsappReminder", label: "WhatsApp" },
  ]} />
  </div>;
}
