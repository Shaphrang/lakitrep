import Link from "next/link";
import { deleteBookingsAction } from "@/actions/admin/bookings";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ConfirmSubmitButton } from "@/components/admin/shared/ConfirmSubmitButton";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";

const detailCard = "rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm sm:p-5";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const query = await searchParams;
  const success = typeof query.success === "string" ? decodeURIComponent(query.success) : "";
  const error = typeof query.error === "string" ? decodeURIComponent(query.error) : "";

  if (!UUID_PATTERN.test(bookingId)) {
    return <div className="text-sm text-[#5e6f63]">Invalid booking reference.</div>;
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return <div className="text-sm text-[#5e6f63]">Booking not found.</div>;
  }

  const guest = booking.guest as Record<string, unknown> | null;
  const cottage = booking.cottages as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Booking ${booking.booking_code}`} description="Booking and guest details." />

      <div className={detailCard}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#5e6f63]">Booking detail</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-[#65756a]">Code</dt><dd className="font-medium text-[#294736]">{String(booking.booking_code ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Status</dt><dd className="font-medium"><StatusBadge status={String(booking.status ?? "-")} /></dd></div>
          <div><dt className="text-[#65756a]">Cottage</dt><dd className="font-medium text-[#294736]">{String(cottage?.name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Source</dt><dd className="font-medium text-[#294736]">{String(booking.source ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-in</dt><dd className="font-medium text-[#294736]">{String(booking.check_in_date ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-out</dt><dd className="font-medium text-[#294736]">{String(booking.check_out_date ?? "-")}</dd></div>
        </dl>
      </div>

      <div className={detailCard}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#5e6f63]">Guest detail</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-[#65756a]">Guest</dt><dd className="font-medium text-[#294736]">{String(guest?.full_name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Phone</dt><dd className="font-medium text-[#294736]">{String(guest?.phone ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">WhatsApp</dt><dd className="font-medium text-[#294736]">{String(guest?.whatsapp_number ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Email</dt><dd className="font-medium text-[#294736]">{String(guest?.email ?? "-")}</dd></div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/billing/${booking.id}`} className="rounded-xl border border-[#2e5a3d] px-4 py-2 text-sm font-semibold text-[#2e5a3d]">
          Open Billing
        </Link>
        <form action={deleteBookingsAction}>
          <input type="hidden" name="id" value={booking.id} />
          <input type="hidden" name="return_path" value="/admin/bookings" />
          <ConfirmSubmitButton
            label="Delete Booking"
            confirmMessage="Delete this booking? This cannot be undone."
            className="rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]"
          />
        </form>
      </div>

      <ActionDialog success={success} error={error} />
    </div>
  );
}
