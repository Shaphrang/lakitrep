import { addDays, format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReportTableClient } from "@/features/admin/reports/components/ReportTableClient";
import { ReportsNav } from "@/features/admin/reports/components/ReportsNav";
import { getReportDataset } from "@/features/admin/reports/services/reports.service";

export default async function CheckinCheckoutReportPage() {
  const ds = await getReportDataset();
  const today = format(new Date(), "yyyy-MM-dd");
  const week = format(addDays(new Date(), 7), "yyyy-MM-dd");
  const arrivalsToday = ds.bookings.filter((b)=>b.checkIn===today);
  const departuresToday = ds.bookings.filter((b)=>b.checkOut===today);
  const upcomingArrivals = ds.bookings.filter((b)=>b.checkIn>today && b.checkIn<=week);
  const upcomingDepartures = ds.bookings.filter((b)=>b.checkOut>today && b.checkOut<=week);
  const cols = [{key:"bookingCode",label:"Booking"},{key:"guestName",label:"Guest"},{key:"phone",label:"Phone"},{key:"cottageName",label:"Cottage"},{key:"checkIn",label:"Check-in"},{key:"checkOut",label:"Check-out"},{key:"totalGuests",label:"Guests"},{key:"paymentStatus",label:"Payment"},{key:"outstandingAmount",label:"Balance"},{key:"source",label:"Source"}] as const;
  return <div className="space-y-4"><AdminPageHeader title="Check-in / Check-out Report" description="Daily arrivals/departures and next 7-day operations." /><ReportsNav />
    <ReportTableClient title="Today's Arrivals" fileName="arrivals-today.csv" rows={arrivalsToday} searchKeys={["bookingCode","guestName","phone","cottageName"]} columns={[...cols]} />
    <ReportTableClient title="Today's Departures" fileName="departures-today.csv" rows={departuresToday} searchKeys={["bookingCode","guestName","phone","cottageName"]} columns={[...cols]} />
    <ReportTableClient title="Upcoming Arrivals (7 days)" fileName="upcoming-arrivals.csv" rows={upcomingArrivals} searchKeys={["bookingCode","guestName","phone","cottageName"]} columns={[...cols]} />
    <ReportTableClient title="Upcoming Departures (7 days)" fileName="upcoming-departures.csv" rows={upcomingDepartures} searchKeys={["bookingCode","guestName","phone","cottageName"]} columns={[...cols]} />
  </div>;
}
