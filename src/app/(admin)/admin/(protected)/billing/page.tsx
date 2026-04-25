import Link from "next/link";
import {
  addBookingChargeAction,
  addBookingPaymentAction,
  applyBookingDiscountAction,
  deleteBookingChargeAction,
  generateInvoiceAction,
} from "@/actions/admin/resort-management";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";
import { getBillingContext } from "@/features/admin/bookings/services/resort-management-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function BillingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const bookingId = typeof params.booking_id === "string" ? params.booking_id : "";
  const success = typeof params.success === "string" ? decodeURIComponent(params.success) : "";
  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : "";

  const bookings = await getAllBookings({ pageSize: 100, query });
  const selectedBooking = bookingId ? bookings.rows.find((row) => row.id === bookingId) : bookings.rows[0];
  const billing = selectedBooking ? await getBillingContext(selectedBooking.id) : null;

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Billing" description="Select a booking, review bill summary, then record charges and payments." />

      <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-4">
        <input name="query" className={inputClass} placeholder="Search by booking code, guest name, phone, cottage" defaultValue={query} />
        <select name="booking_id" className={inputClass} defaultValue={selectedBooking?.id ?? ""}>
          {bookings.rows.map((row) => (
            <option key={row.id} value={row.id}>{row.booking_code} - {row.guest_name} ({row.guest_phone})</option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Find Booking</button>
        {selectedBooking ? <Link href={`/admin/bookings/${selectedBooking.id}`} className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-center text-sm font-semibold text-[#2e5a3d]">Open Booking Details</Link> : null}
      </form>

      {selectedBooking && billing?.booking ? (
        <>
          <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
            <h3 className="font-semibold text-[#294736]">Billing For</h3>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-4">
              <p><strong>Booking:</strong> {String(billing.booking.booking_code ?? "-")}</p>
              <p><strong>Guest:</strong> {String((billing.booking.guest as { full_name?: string })?.full_name ?? "-")}</p>
              <p><strong>Phone:</strong> {String((billing.booking.guest as { phone?: string })?.phone ?? "-")}</p>
              <p><strong>Cottage:</strong> {String((billing.booking.cottages as { name?: string })?.name ?? "-")}</p>
              <p><strong>Check-in:</strong> {String(billing.booking.check_in_date ?? "-")}</p>
              <p><strong>Check-out:</strong> {String(billing.booking.check_out_date ?? "-")}</p>
              <p><strong>Status:</strong> {String(billing.booking.status ?? "-")}</p>
              <p><strong>Payment:</strong> {String(billing.booking.payment_status ?? "-")}</p>
            </div>

            <div className="mt-3 grid gap-2 rounded-xl border border-[#e2dacd] bg-[#f9f5ee] p-3 text-sm sm:grid-cols-3">
              <p>Room charges: ₹{Number(billing.booking.total_amount ?? 0).toLocaleString("en-IN")}</p>
              <p>Extra charges: ₹{Number(billing.booking.extra_charges_total ?? 0).toLocaleString("en-IN")}</p>
              <p>Discount: ₹{Number(billing.booking.discount_amount ?? 0).toLocaleString("en-IN")}</p>
              <p>Final total: ₹{Number(billing.booking.final_total ?? 0).toLocaleString("en-IN")}</p>
              <p>Amount paid: ₹{Number(billing.booking.amount_paid ?? 0).toLocaleString("en-IN")}</p>
              <p>Pending amount: ₹{Number(billing.booking.amount_pending ?? 0).toLocaleString("en-IN")}</p>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <form action={addBookingChargeAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
              <h3 className="font-semibold">Add Extra Charge</h3>
              <input type="hidden" name="booking_id" value={selectedBooking.id} /><input type="hidden" name="return_path" value={`/admin/billing?booking_id=${selectedBooking.id}`} />
              <input name="charge_type" placeholder="Charge type" className={inputClass} defaultValue="food" required />
              <input name="description" placeholder="Description" className={inputClass} maxLength={200} />
              <input type="number" min={1} name="quantity" className={inputClass} defaultValue={1} required />
              <input type="number" min={0.01} step="0.01" name="unit_price" className={inputClass} defaultValue={0} required />
              <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Add Charge</button>
            </form>

            <form action={addBookingPaymentAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
              <h3 className="font-semibold">Record Payment</h3>
              <input type="hidden" name="booking_id" value={selectedBooking.id} /><input type="hidden" name="return_path" value={`/admin/billing?booking_id=${selectedBooking.id}`} />
              <input type="number" min={0.01} step="0.01" name="amount" className={inputClass} placeholder="Payment amount" required />
              <select name="payment_mode" className={inputClass} defaultValue="cash"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other</option></select>
              <select name="payment_type" className={inputClass} defaultValue="part_payment"><option value="advance">Advance</option><option value="part_payment">Part Payment</option><option value="final_payment">Final Payment</option><option value="refund">Refund</option></select>
              <input name="reference_number" className={inputClass} placeholder="Reference number (optional)" />
              <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Record Payment</button>
            </form>

            <form action={applyBookingDiscountAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
              <h3 className="font-semibold">Apply Discount</h3>
              <input type="hidden" name="booking_id" value={selectedBooking.id} /><input type="hidden" name="return_path" value={`/admin/billing?booking_id=${selectedBooking.id}`} />
              <input name="discount_amount" type="number" min={0} step="0.01" defaultValue={Number(billing.booking.discount_amount ?? 0)} className={inputClass} placeholder="Discount amount" />
              <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Apply Discount</button>
              <button formAction={generateInvoiceAction} className="w-full rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">Generate Invoice</button>
            </form>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Extra Charges</h3>
              {billing.charges.length === 0 ? <p className="text-sm text-[#647267]">No extra charges added.</p> : <ul className="space-y-2">{billing.charges.map((charge) => <li key={String((charge as { id?: string }).id)} className="flex items-center justify-between rounded-xl border border-[#ddd4c6] bg-white p-2 text-sm"><span>{String((charge as { description?: string }).description ?? (charge as { charge_type?: string }).charge_type ?? "Charge")} - ₹{Number((charge as { amount?: number }).amount ?? 0).toLocaleString("en-IN")}</span><form action={deleteBookingChargeAction}><input type="hidden" name="booking_id" value={selectedBooking.id} /><input type="hidden" name="charge_id" value={String((charge as { id?: string }).id ?? "")} /><input type="hidden" name="return_path" value={`/admin/billing?booking_id=${selectedBooking.id}`} /><button className="text-rose-700">Delete</button></form></li>)}</ul>}
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Payment History</h3>
              <DataTable rows={billing.payments.map((row) => ({ id: String((row as { id?: string }).id ?? ""), payment_date: String((row as { payment_date?: string }).payment_date ?? "-"), amount: Number((row as { amount?: number }).amount ?? 0), payment_mode: String((row as { payment_mode?: string }).payment_mode ?? "-"), payment_type: String((row as { payment_type?: string }).payment_type ?? "-") }))} columns={[{ key: "payment_date", header: "Date" }, { key: "amount", header: "Amount", render: (row) => `₹${row.amount.toLocaleString("en-IN")}` }, { key: "payment_mode", header: "Mode" }, { key: "payment_type", header: "Type" }]} />
            </div>
          </section>
        </>
      ) : (
        <p className="rounded-2xl border border-[#ddd4c6] bg-white p-4 text-sm text-[#647267]">Select a booking to start billing. Staff do not need to type raw booking UUIDs.</p>
      )}

      <ActionDialog success={success} error={error} />
    </div>
  );
}
