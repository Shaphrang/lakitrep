import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  return (
    <div>
      <AdminPageHeader title={`Booking ${booking.reference}`} description="Booking detail snapshot (edit workflow later)." />
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <dl className="grid gap-4 md:grid-cols-2">
          <div><dt className="text-slate-500">Guest</dt><dd className="font-medium">{booking.guestName}</dd></div>
          <div><dt className="text-slate-500">Cottage</dt><dd className="font-medium">{booking.cottageName}</dd></div>
          <div><dt className="text-slate-500">Check-in</dt><dd className="font-medium">{booking.checkIn}</dd></div>
          <div><dt className="text-slate-500">Check-out</dt><dd className="font-medium">{booking.checkOut}</dd></div>
          <div><dt className="text-slate-500">Total Amount</dt><dd className="font-medium">${booking.totalAmount}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd className="font-medium"><StatusBadge status={booking.status} /></dd></div>
        </dl>
      </div>
    </div>
  );
}
