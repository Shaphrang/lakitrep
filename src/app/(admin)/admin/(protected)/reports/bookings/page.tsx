import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportSummaryCards } from "@/features/admin/reports/components/ReportSummaryCards";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";
import { resolveReportDateRange } from "@/features/admin/reports/services/reports-params";

export default async function BookingsReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { from, to } = await resolveReportDateRange(searchParams);
  const { bookings } = await getReportDataset(from, to);
  return <div className="space-y-4"><AdminPageHeader title="Bookings Report" description="Booking trend and conversion by status/source." /><ReportsNav />
    <ReportSummaryCards cards={[
      { label: "Total bookings", value: bookings.length },
      { label: "Confirmed", value: bookings.filter((b) => ["confirmed", "advance_paid", "checked_in", "checked_out", "completed"].includes(b.status)).length },
      { label: "Pending", value: bookings.filter((b) => ["pending", "new_request", "contacted"].includes(b.status)).length },
      { label: "Cancelled", value: bookings.filter((b) => ["cancelled", "rejected", "no_show"].includes(b.status)).length },
      { label: "Upcoming", value: bookings.filter((b) => b.checkIn >= new Date().toISOString().slice(0, 10)).length },
      { label: "Today's check-ins", value: bookings.filter((b) => b.checkIn === new Date().toISOString().slice(0, 10)).length },
      { label: "Today's check-outs", value: bookings.filter((b) => b.checkOut === new Date().toISOString().slice(0, 10)).length },
    ]} />
    <ReportTableClient title="Bookings" fileName="bookings-report.csv" rows={bookings.map((b)=>({...b,actions:`/admin/bookings/${b.id}`}))} searchKeys={["bookingCode","guestName","phone","cottageName","source"]} columns={[
      { key: "bookingCode", label: "Booking Code", sortable: true },{ key: "guestName", label: "Guest", sortable: true },{ key: "phone", label: "Phone" },{ key: "cottageName", label: "Cottage" },{ key: "checkIn", label: "Check-in", sortable: true },{ key: "checkOut", label: "Check-out", sortable: true },{ key: "nights", label: "Nights", sortable: true },{ key: "adults", label: "Adults" },{ key: "children", label: "Children" },{ key: "totalGuests", label: "Total Guests" },{ key: "status", label: "Booking Status", sortable: true },{ key: "source", label: "Source", sortable: true },{ key: "createdAt", label: "Created", sortable: true },{ key: "finalAmount", label: "Total Bill", sortable: true, render: (r)=>`₹${r.finalAmount.toLocaleString('en-IN')}` },{ key: "paymentStatus", label: "Payment" },
      { key: "actions", label: "Actions", render: (r)=> `Open booking: /admin/bookings/${r.id} | billing: /admin/billing/${r.id}` },
    ]} />
    <p className="text-xs text-[#6f7d74]">Tip: Use booking code links to open detailed booking / billing pages.</p>
  </div>;
}
