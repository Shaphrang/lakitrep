import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";
import { safeDivide } from "@/features/admin/reports/reports.utils";

export default async function CustomersReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { bookings } = await getReportDataset(from, to);
  const customers = Object.entries(bookings.reduce<Record<string, { id: string; name: string; phone: string; email: string; source: string; count: number; revenue: number; paid: number; outstanding: number; last: string }>>((acc, b) => {
    const key = b.phone !== "-" ? b.phone : b.guestName;
    if (!acc[key]) acc[key] = { id: key, name: b.guestName, phone: b.phone, email: b.email, source: b.source, count: 0, revenue: 0, paid: 0, outstanding: 0, last: b.checkOut };
    acc[key].count += 1; acc[key].revenue += b.finalAmount; acc[key].paid += b.paidAmount; acc[key].outstanding += b.outstandingAmount; if (b.checkOut > acc[key].last) acc[key].last = b.checkOut;
    return acc;
  }, {})).map(([id, row]) => ({ id, customerName: row.name, phone: row.phone, email: row.email, bookingSource: row.source, totalBookings: row.count, totalRevenue: row.revenue, totalPaid: row.paid, outstandingAmount: row.outstanding, lastBookingDate: row.last, repeatCustomerStatus: row.count > 1 ? "Repeat" : "New" }));
  return <div className="space-y-4"><AdminPageHeader title="Customers Report" description="Customer value and repeat behavior (using phone, fallback to name)." /><ReportsNav />
    <ReportSummaryCards cards={[
      { label: "Total Customers", value: customers.length },{ label: "New Customers", value: customers.filter((c)=>c.repeatCustomerStatus==="New").length },{ label: "Repeat Customers", value: customers.filter((c)=>c.repeatCustomerStatus==="Repeat").length },{ label: "Customers With Outstanding", value: customers.filter((c)=>c.outstandingAmount>0).length },{ label: "Average Customer Value", value: safeDivide(customers.reduce((s,c)=>s+c.totalRevenue,0), customers.length), kind: "currency" },
    ]} />
    <ReportTableClient title="Customers" fileName="customers-report.csv" rows={customers} searchKeys={["customerName","phone","email","bookingSource"]} columns={[
      { key: "customerName", label: "Customer" },{ key: "phone", label: "Phone" },{ key: "email", label: "Email" },{ key: "bookingSource", label: "Source" },{ key: "totalBookings", label: "Bookings", sortable:true },{ key: "totalRevenue", label: "Revenue", sortable:true, format:"currency" },{ key: "totalPaid", label: "Paid", format:"currency" },{ key: "outstandingAmount", label: "Outstanding", format:"currency" },{ key: "lastBookingDate", label: "Last Booking", sortable:true },{ key: "repeatCustomerStatus", label: "Repeat Status" },
    ]} />
  </div>;
}
