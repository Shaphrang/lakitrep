import { notFound } from "next/navigation";
import { deleteBookingsAction, updateBookingsAction } from "@/actions/admin/bookings";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const guest = booking.booking_guests as Record<string, unknown> | null;
  const cottage = booking.cottages as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Booking ${booking.booking_code}`} description="Booking details and status update." />
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm">
        <dl className="grid gap-4 md:grid-cols-2">
          <div><dt className="text-slate-500">Guest</dt><dd className="font-medium">{String(guest?.full_name ?? "-")}</dd></div>
          <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{String(guest?.phone ?? "-")}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{String(guest?.email ?? "-")}</dd></div>
          <div><dt className="text-slate-500">Cottage</dt><dd className="font-medium">{String(cottage?.name ?? "-")}</dd></div>
          <div><dt className="text-slate-500">Check-in</dt><dd className="font-medium">{booking.check_in_date}</dd></div>
          <div><dt className="text-slate-500">Check-out</dt><dd className="font-medium">{booking.check_out_date}</dd></div>
          <div><dt className="text-slate-500">Guests</dt><dd className="font-medium">A:{booking.adults} C:{booking.children} I:{booking.infants}</dd></div>
          <div><dt className="text-slate-500">Status</dt><dd className="font-medium"><StatusBadge status={booking.status} /></dd></div>
        </dl>
      </div>
      <form action={updateBookingsAction} className="flex items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input type="hidden" name="id" value={booking.id} />
        <label className="text-sm"><span className="mb-1 block">Status</span><select name="status" defaultValue={booking.status} className="rounded-md border border-slate-300 px-3 py-2"><option value="pending">pending</option><option value="confirmed">confirmed</option><option value="cancelled">cancelled</option><option value="completed">completed</option><option value="rejected">rejected</option></select></label>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Update</button>
      </form>
      <form action={deleteBookingsAction}><input type="hidden" name="id" value={booking.id} /><button type="submit" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Delete Booking</button></form>
    </div>
  );
}
