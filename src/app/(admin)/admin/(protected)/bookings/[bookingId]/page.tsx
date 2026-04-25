import Link from "next/link";
import { format } from "date-fns";
import {
  addBookingChargeAction,
  addBookingPaymentAction,
  applyBookingDiscountAction,
  deleteBookingChargeAction,
  generateInvoiceAction,
  performCheckInOutAction,
} from "@/actions/admin/resort-management";
import { deleteBookingsAction, updateBookingsAction } from "@/actions/admin/bookings";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";
import { getBillingContext } from "@/features/admin/bookings/services/resort-management-service";


const detailCard = "rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm sm:p-5";
const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidBookingId(value: string) {
  return UUID_PATTERN.test(value);
}

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

  if (!isValidBookingId(bookingId)) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Booking Details" description="Booking lifecycle, billing, and invoice controls." />
        <div className={detailCard}>
          <p className="text-sm text-[#5e6f63]">Invalid booking reference.</p>
          <div className="mt-3">
            <Link href="/admin/bookings" className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let booking: Awaited<ReturnType<typeof getBookingById>> = null;
  let billing: Awaited<ReturnType<typeof getBillingContext>> = { booking: null, charges: [], payments: [], invoices: [] };
  let loadFailed = false;

  try {
    booking = await getBookingById(bookingId);
    if (booking) {
      billing = await getBillingContext(bookingId);
    }
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Booking Details" description="Booking lifecycle, billing, and invoice controls." />
        <div className={detailCard}>
          <p className="text-sm text-[#5e6f63]">Unable to load booking details. Please refresh and try again.</p>
          <div className="mt-3">
            <Link href="/admin/bookings" className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Booking Details" description="Booking lifecycle, billing, and invoice controls." />
        <div className={detailCard}>
          <p className="text-sm text-[#5e6f63]">Booking not found or no longer available.</p>
          <div className="mt-3">
            <Link href="/admin/bookings" className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">
              Back to Bookings
            </Link>
          </div>
        </div>
        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  const guest = booking.guest as Record<string, unknown> | null;
  const cottage = booking.cottages as Record<string, unknown> | null;
  const today = format(new Date(), "yyyy-MM-dd");

  const canCheckInStatus = ["confirmed", "advance_paid"].includes(String(booking.status));
  const canCheckInToday = today === String(booking.check_in_date);
  const checkInDisabledReason = !canCheckInStatus
    ? "Only confirmed or advance-paid bookings can be checked in."
    : !canCheckInToday
      ? today < String(booking.check_in_date)
        ? "Check-in will be available on the booking check-in date."
        : "The scheduled check-in date has passed. Please review this booking before checking in."
      : "";

  const pending = Number(booking.amount_pending ?? 0);
  const canCheckout = String(booking.status) === "checked_in" && today === String(booking.check_out_date) && pending <= 0;
  const checkoutDisabledReason = String(booking.status) !== "checked_in"
    ? "Only checked-in bookings can be checked out."
    : today !== String(booking.check_out_date)
      ? today < String(booking.check_out_date)
        ? "Checkout will be available on the booking check-out date."
        : "The scheduled checkout date has passed. Please review the booking. To change dates, cancel/delete and create a new booking."
      : pending > 0
        ? `Pending balance ₹${pending.toLocaleString("en-IN")} must be cleared before checkout.`
        : "";

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Booking ${booking.booking_code}`} description="Booking lifecycle, billing, and invoice controls." />

      <div className={detailCard}>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-[#65756a]">Guest</dt><dd className="font-medium text-[#294736]">{String(guest?.full_name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Phone</dt><dd className="font-medium text-[#294736]">{String(guest?.phone ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Cottage</dt><dd className="font-medium text-[#294736]">{String(cottage?.name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-in</dt><dd className="font-medium text-[#294736]">{String(booking.check_in_date ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-out</dt><dd className="font-medium text-[#294736]">{String(booking.check_out_date ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Guests</dt><dd className="font-medium text-[#294736]">A:{booking.adults} C:{booking.children} I:{booking.infants}</dd></div>
          <div><dt className="text-[#65756a]">Status</dt><dd className="font-medium"><StatusBadge status={String(booking.status)} /></dd></div>
          <div><dt className="text-[#65756a]">Payment status</dt><dd className="font-medium"><StatusBadge status={String(booking.payment_status ?? "unpaid")} /></dd></div>
          <div><dt className="text-[#65756a]">Pending</dt><dd className="font-medium text-[#294736]">₹{Number(booking.amount_pending ?? 0).toLocaleString("en-IN")}</dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-[#65756a]">Special requests</dt><dd className="font-medium text-[#294736]">{String(booking.special_requests ?? "-")}</dd></div>
        </dl>
        <div className="mt-3"><Link href={`/admin/billing/${booking.id}`} className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">Open Billing</Link></div>
      </div>

      <form action={updateBookingsAction} className={`${detailCard} flex flex-col gap-3 sm:flex-row sm:items-end`}>
        <input type="hidden" name="id" value={booking.id} />
        <input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} />
        <label className="text-sm">Booking Status
          <select name="status" defaultValue={String(booking.status)} className={inputClass}>{["new_request", "contacted", "confirmed", "advance_paid", "checked_in", "checked_out", "cancelled", "no_show", "rejected"].map((status) => <option key={status} value={status}>{status}</option>)}</select>
        </label>
        <button type="submit" className="rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white">Update Status</button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2">
        <form action={addBookingChargeAction} className={`${detailCard} space-y-2`}>
          <h3 className="font-semibold text-[#294736]">Add Extra Charge</h3>
          <input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} />
          <label className="text-sm">Charge Type<input name="charge_type" className={inputClass} placeholder="Example: Food, Laundry, Transport" defaultValue="other" required /></label>
          <label className="text-sm">Description<input name="description" className={inputClass} placeholder="Short note for this charge" maxLength={200} /></label>
          <div className="grid grid-cols-2 gap-2"><label className="text-sm">Quantity<input type="number" name="quantity" min={1} defaultValue={1} className={inputClass} required /></label><label className="text-sm">Unit Price<input type="number" name="unit_price" min={0.01} step="0.01" defaultValue={0} className={inputClass} required /></label></div>
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save Charge</button>
        </form>

        <form action={addBookingPaymentAction} className={`${detailCard} space-y-2`}>
          <h3 className="font-semibold text-[#294736]">Record Payment</h3>
          <input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} />
          <label className="text-sm">Payment Amount<input type="number" name="amount" min={0.01} step="0.01" className={inputClass} placeholder="Enter amount received" required /></label>
          <label className="text-sm">Payment Mode<select name="payment_mode" className={inputClass} defaultValue="cash"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other</option></select></label>
          <label className="text-sm">Payment Type<select name="payment_type" className={inputClass} defaultValue="part_payment"><option value="advance">Advance</option><option value="part_payment">Part Payment</option><option value="final_payment">Final Payment</option><option value="refund">Refund</option></select></label>
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Record Payment</button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <form action={performCheckInOutAction} className={detailCard}><input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="action_type" value="check_in" /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} /><button disabled={Boolean(checkInDisabledReason)} title={checkInDisabledReason} className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50">Check-in</button><p className="mt-1 text-xs text-[#66766b]">{checkInDisabledReason || "Ready for check-in today."}</p></form>
        <form action={performCheckInOutAction} className={detailCard}><input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="action_type" value="check_out" /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} /><button disabled={!canCheckout} title={checkoutDisabledReason} className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50">Checkout</button><p className="mt-1 text-xs text-[#66766b]">{checkoutDisabledReason || "Ready for checkout today."}</p></form>
        <form action={generateInvoiceAction} className={detailCard}><input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} /><button className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm text-[#2e5a3d]">Generate Invoice</button></form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className={detailCard}><h3 className="mb-2 font-semibold">Existing Extra Charges</h3>{billing.charges.length === 0 ? <p className="text-sm text-[#66766b]">No extra charges added yet.</p> : <ul className="space-y-2">{billing.charges.map((row) => <li key={String((row as { id?: string }).id)} className="flex items-center justify-between rounded-lg border p-2 text-sm"><div>{String((row as { charge_type?: string }).charge_type ?? "other")} - ₹{Number((row as { amount?: number }).amount ?? 0).toLocaleString("en-IN")}</div><form action={deleteBookingChargeAction}><input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="charge_id" value={String((row as { id?: string }).id ?? "")} /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} /><button type="submit" className="text-rose-700">Delete</button></form></li>)}</ul>}</div>
        <form action={applyBookingDiscountAction} className={detailCard}><h3 className="mb-2 font-semibold">Apply Discount</h3><input type="hidden" name="booking_id" value={booking.id} /><input type="hidden" name="return_path" value={`/admin/bookings/${booking.id}`} /><label className="text-sm">Discount Amount<input name="discount_amount" type="number" min={0} step="0.01" defaultValue={Number(booking.discount_amount ?? 0)} className={inputClass} /></label><button className="mt-3 rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm text-[#2e5a3d]">Apply Discount</button></form>
      </section>

      <DataTable rows={billing.payments.map((row) => ({ id: String((row as { id?: string }).id), ...(row as object) }))} columns={[{ key: "payment_date", header: "Date" }, { key: "amount", header: "Amount" }, { key: "payment_mode", header: "Mode" }, { key: "payment_type", header: "Type" }]} />

      <form action={deleteBookingsAction}>
        <input type="hidden" name="id" value={booking.id} />
        <input type="hidden" name="return_path" value="/admin/bookings" />
        <button type="submit" className="rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Booking</button>
      </form>
      <ActionDialog success={success} error={error} />
    </div>
  );
}
