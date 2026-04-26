import { addDays, format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportsFilterBar } from "@/features/admin/reports/components/ReportsFilterBar";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";

export default async function CheckinCheckoutReportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const scope = typeof params.scope === "string" ? params.scope : "this_week";
  const cottage = typeof params.cottage === "string" ? params.cottage : "all";
  const paymentStatus = typeof params.paymentStatus === "string" ? params.paymentStatus : "all";
  const search = typeof params.q === "string" ? params.q : "";

  const dataset = await getReportDataset();
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const weekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd");

  const inScope = (date: string) => {
    if (scope === "today") return date === today;
    if (scope === "tomorrow") return date === tomorrow;
    if (scope === "this_week") return date >= today && date <= weekEnd;
    return true;
  };

  const base = dataset.bookings.filter((booking) => {
    if (cottage !== "all" && booking.cottageId !== cottage) return false;
    if (paymentStatus !== "all" && booking.paymentStatus !== paymentStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit = [booking.bookingCode, booking.guestName, booking.phone].some((value) => value.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const mapRow = (booking: (typeof base)[number], date: string) => ({
    id: booking.id,
    bookingCode: booking.bookingCode,
    guestName: booking.guestName,
    phone: booking.phone,
    cottageName: booking.cottageName,
    date,
    guests: booking.totalGuests,
    paymentStatus: booking.paymentStatus,
    balance: booking.outstandingAmount,
    action: `Booking: /admin/bookings/${booking.id} | Billing: /admin/billing/${booking.id}`,
  });

  const sections = [
    { title: "Today's Check-ins", rows: base.filter((booking) => booking.checkIn === today).map((booking) => mapRow(booking, booking.checkIn)) },
    { title: "Today's Check-outs", rows: base.filter((booking) => booking.checkOut === today).map((booking) => mapRow(booking, booking.checkOut)) },
    { title: "Upcoming Check-ins", rows: base.filter((booking) => booking.checkIn > today && inScope(booking.checkIn)).map((booking) => mapRow(booking, booking.checkIn)) },
    { title: "Upcoming Check-outs", rows: base.filter((booking) => booking.checkOut > today && inScope(booking.checkOut)).map((booking) => mapRow(booking, booking.checkOut)) },
  ];

  const paymentOptions = Array.from(new Set(dataset.bookings.map((booking) => booking.paymentStatus))).sort();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Check-in / Check-out Report" description="Daily arrivals, departures, and immediate follow-up actions." />
      <ReportsNav />
      <ReportsFilterBar
        preset="this_week"
        from=""
        to=""
        search={search}
        searchPlaceholder="Search booking code, guest, phone"
        filters={[
          {
            name: "scope",
            label: "Date scope",
            value: scope,
            options: [
              { value: "today", label: "Today" },
              { value: "tomorrow", label: "Tomorrow" },
              { value: "this_week", label: "This Week" },
              { value: "all", label: "All Upcoming" },
            ],
          },
          { name: "cottage", label: "Cottage", value: cottage, options: [{ value: "all", label: "All" }, ...dataset.cottages.map((row) => ({ value: row.id, label: row.name }))] },
          { name: "paymentStatus", label: "Payment", value: paymentStatus, options: [{ value: "all", label: "All" }, ...paymentOptions.map((value) => ({ value, label: value }))] },
        ]}
      />

      {sections.map((section) => (
        <ReportTableClient
          key={section.title}
          title={section.title}
          fileName="checkin-checkout-report.csv"
          rows={section.rows}
          searchKeys={["bookingCode", "guestName", "phone", "cottageName"]}
          columns={[
            { key: "bookingCode", label: "Booking Code", sortable: true },
            { key: "guestName", label: "Guest", sortable: true },
            { key: "phone", label: "Phone" },
            { key: "cottageName", label: "Cottage", sortable: true },
            { key: "date", label: "Date", sortable: true },
            { key: "guests", label: "Guests", sortable: true },
            { key: "paymentStatus", label: "Payment Status", sortable: true },
            { key: "balance", label: "Balance", sortable: true, format: "currency_inr" },
            { key: "action", label: "Action" },
          ]}
        />
      ))}
    </div>
  );
}
