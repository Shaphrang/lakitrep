import { notFound } from "next/navigation";
import { addBookingChargeAction, addBookingPaymentAction, generateInvoiceAction, performCheckInOutAction } from "@/actions/admin/resort-management";
import { deleteBookingsAction, updateBookingsAction } from "@/actions/admin/bookings";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getBookingById } from "@/features/admin/bookings/services/bookings-service";
import { getBillingContext } from "@/features/admin/bookings/services/resort-management-service";

const detailCard = "rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm sm:p-5";
const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2.5 text-sm text-[#21392c]";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const billing = await getBillingContext(id);
  const guest = booking.booking_guests as Record<string, unknown> | null;
  const cottage = booking.cottages as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title={`Booking ${booking.booking_code}`} description="Booking lifecycle, billing, and invoice controls." />

      <div className={detailCard}>
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-[#65756a]">Guest</dt><dd className="font-medium text-[#294736]">{String(guest?.full_name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Phone</dt><dd className="font-medium text-[#294736]">{String(guest?.phone ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Cottage</dt><dd className="font-medium text-[#294736]">{String(cottage?.name ?? "-")}</dd></div>
          <div><dt className="text-[#65756a]">Check-in</dt><dd className="font-medium text-[#294736]">{booking.check_in_date}</dd></div>
          <div><dt className="text-[#65756a]">Check-out</dt><dd className="font-medium text-[#294736]">{booking.check_out_date}</dd></div>
          <div><dt className="text-[#65756a]">Guests</dt><dd className="font-medium text-[#294736]">A:{booking.adults} C:{booking.children} I:{booking.infants}</dd></div>
          <div><dt className="text-[#65756a]">Status</dt><dd className="font-medium"><StatusBadge status={String(booking.status)} /></dd></div>
          <div><dt className="text-[#65756a]">Payment status</dt><dd className="font-medium"><StatusBadge status={String(booking.payment_status ?? "unpaid")} /></dd></div>
          <div><dt className="text-[#65756a]">Pending</dt><dd className="font-medium text-[#294736]">₹{Number(booking.amount_pending ?? 0).toLocaleString("en-IN")}</dd></div>
          <div className="sm:col-span-2 lg:col-span-3"><dt className="text-[#65756a]">Special requests</dt><dd className="font-medium text-[#294736]">{booking.special_requests || "-"}</dd></div>
        </dl>
      </div>

      <form action={updateBookingsAction} className={`${detailCard} flex flex-col gap-3 sm:flex-row sm:items-end`}>
        <input type="hidden" name="id" value={booking.id} />
        <label className="text-sm">
          Status
          <select name="status" defaultValue={String(booking.status)} className={inputClass}>
            {["new_request", "contacted", "confirmed", "advance_paid", "checked_in", "checked_out", "cancelled", "no_show", "rejected"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-4 py-2.5 text-sm font-semibold text-white">Update</button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2">
        <form action={addBookingChargeAction} className={`${detailCard} space-y-2`}>
          <h3 className="font-semibold text-[#294736]">Add charge</h3>
          <input type="hidden" name="booking_id" value={booking.id} />
          <input name="charge_type" className={inputClass} placeholder="charge type" defaultValue="other" />
          <input name="description" className={inputClass} placeholder="description" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" name="quantity" min={1} defaultValue={1} className={inputClass} />
            <input type="number" name="unit_price" min={0} step="0.01" defaultValue={0} className={inputClass} />
          </div>
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save Charge</button>
        </form>

        <form action={addBookingPaymentAction} className={`${detailCard} space-y-2`}>
          <h3 className="font-semibold text-[#294736]">Record payment</h3>
          <input type="hidden" name="booking_id" value={booking.id} />
          <input type="number" name="amount" min={0.01} step="0.01" className={inputClass} required />
          <select name="payment_mode" className={inputClass} defaultValue="cash">
            <option value="cash">cash</option><option value="upi">upi</option><option value="card">card</option><option value="bank_transfer">bank_transfer</option><option value="other">other</option>
          </select>
          <select name="payment_type" className={inputClass} defaultValue="part_payment">
            <option value="advance">advance</option><option value="part_payment">part_payment</option><option value="final_payment">final_payment</option><option value="refund">refund</option>
          </select>
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save Payment</button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <form action={performCheckInOutAction} className={detailCard}>
          <input type="hidden" name="booking_id" value={booking.id} />
          <input type="hidden" name="action_type" value="check_in" />
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm text-white">Check-in</button>
        </form>
        <form action={performCheckInOutAction} className={detailCard}>
          <input type="hidden" name="booking_id" value={booking.id} />
          <input type="hidden" name="action_type" value="check_out" />
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm text-white">Checkout</button>
        </form>
        <form action={generateInvoiceAction} className={detailCard}>
          <input type="hidden" name="booking_id" value={booking.id} />
          <button className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm text-[#2e5a3d]">Generate Invoice</button>
        </form>
      </section>

      <DataTable
        rows={billing.payments.map((row) => ({ id: String((row as { id?: string }).id), ...(row as object) }))}
        columns={[
          { key: "payment_date", header: "Date" },
          { key: "amount", header: "Amount" },
          { key: "payment_mode", header: "Mode" },
          { key: "payment_type", header: "Type" },
        ]}
      />

      <form action={deleteBookingsAction}>
        <input type="hidden" name="id" value={booking.id} />
        <button type="submit" className="rounded-xl border border-[#e2b0b0] bg-[#fbeeee] px-4 py-2 text-sm font-medium text-[#8f3f3f]">Delete Booking</button>
      </form>
    </div>
  );
}
