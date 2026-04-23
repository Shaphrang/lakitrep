import { notFound } from "next/navigation";
import { deleteBookingsAction, updateBookingsAction } from "@/actions/admin/bookings";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";

const detailCard = "rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm sm:p-5";
const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const guest = booking.booking_guests as Record<string, unknown> | null;
  const cottage = booking.cottages as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Booking ${booking.booking_code}`} description="Review guest details and update booking status." />

      <div className={detailCard}>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-[#65756a]">Guest</dt><dd className="font-medium text-[#294736]">{String(guest?.full_name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Phone</dt><dd className="font-medium text-[#294736]">{String(guest?.phone ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Email</dt><dd className="font-medium text-[#294736]">{String(guest?.email ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Cottage</dt><dd className="font-medium text-[#294736]">{String(cottage?.name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-in</dt><dd className="font-medium text-[#294736]">{booking.check_in_date}</dd></div>
          <div><dt className="text-[#65756a]">Check-out</dt><dd className="font-medium text-[#294736]">{booking.check_out_date}</dd></div>
          <div><dt className="text-[#65756a]">Guests</dt><dd className="font-medium text-[#294736]">A:{booking.adults} C:{booking.children} I:{booking.infants}</dd></div>
          <div><dt className="text-[#65756a]">Nights</dt><dd className="font-medium text-[#294736]">{booking.nights ?? "-"}</dd></div>
          <div><dt className="text-[#65756a]">Estimated amount</dt><dd className="font-medium text-[#294736]">₹{Number(booking.total_amount ?? 0).toLocaleString("en-IN")}</dd></div>
          <div><dt className="text-[#65756a]">Status</dt><dd className="font-medium"><StatusBadge status={booking.status} /></dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-[#65756a]">Special requests</dt><dd className="font-medium text-[#294736]">{booking.special_requests || "-"}</dd></div>
        </dl>
      </div>

      <form action={updateBookingsAction} className={`${detailCard} flex flex-col gap-3 sm:flex-row sm:items-end`}>
        <input type="hidden" name="id" value={booking.id} />
        <label className="text-sm">
          Status
          <select name="status" defaultValue={booking.status} className={inputClass}>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="cancelled">cancelled</option>
            <option value="completed">completed</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <button type="submit" className="rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white">Update</button>
      </form>

      <form action={deleteBookingsAction}>
        <input type="hidden" name="id" value={booking.id} />
        <button type="submit" className="rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Booking</button>
      </form>
    </div>
  );
}
