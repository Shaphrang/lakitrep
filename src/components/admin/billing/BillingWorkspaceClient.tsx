"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  addBookingChargeAction,
  addBookingPaymentAction,
  applyBookingDiscountAction,
  deleteBookingChargeAction,
  generateInvoiceAction,
  performCheckInOutAction,
} from "@/actions/admin/resort-management";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

type BillingWorkspaceClientProps = {
  bookingId: string;
  booking: Record<string, unknown>;
  charges: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
};

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";
const cardClass = "rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm";

const chargeTypes = [
  "extra_bed",
  "extra_person",
  "food",
  "bonfire",
  "transport",
  "laundry",
  "decoration",
  "late_checkout",
  "damage",
  "other",
] as const;

export function BillingWorkspaceClient({ bookingId, booking, charges, payments, invoices }: BillingWorkspaceClientProps) {
  const pending = Number(booking.amount_pending ?? 0);
  const finalTotal = Number(booking.final_total ?? 0);
  const amountPaid = Number(booking.amount_paid ?? 0);
  const roomCharge = Number(booking.total_amount ?? 0);
  const discount = Number(booking.discount_amount ?? 0);
  const extra = Number(booking.extra_charges_total ?? 0);
  const subtotal = roomCharge + extra;
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("part_payment");

  const paymentValidationMessage = useMemo(() => {
    const value = Number(paymentAmount || 0);
    if (value <= 0) return "Payment amount must be valid.";
    if (paymentType !== "refund" && value > pending) return "Payment amount cannot be more than the pending amount.";
    if (paymentType === "refund" && value > amountPaid) return "Refund cannot exceed amount paid so far.";
    return "";
  }, [amountPaid, paymentAmount, paymentType, pending]);

  const nights = Number(booking.nights ?? 0);
  const weekdayPrice = Number((booking.cottages as { weekday_price?: number } | null)?.weekday_price ?? 0);
  const weekendPrice = Number((booking.cottages as { weekend_price?: number } | null)?.weekend_price ?? 0);
  const hasSplitPricing = weekdayPrice > 0 && weekendPrice > 0 && weekdayPrice !== weekendPrice;

  const checkInDate = String(booking.check_in_date ?? "");
  const checkOutDate = String(booking.check_out_date ?? "");
  const today = format(new Date(), "yyyy-MM-dd");

  const checkoutReason = String(booking.status) !== "checked_in"
    ? "Guest must be checked in before checkout."
    : pending > 0
      ? "Pending amount must be cleared before checkout."
      : checkOutDate !== today
        ? "Checkout is available only on the scheduled checkout date."
        : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#d8cfbf] bg-[#fffdf8] p-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#1f442f]">Billing &amp; Final Amount</h2>
          <p className="mt-1 text-sm text-[#56675c]">Simple, staff-friendly billing for one booking.</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-[#9ec1a9] bg-[#eef8f0] px-3 py-1 text-sm font-semibold text-[#225c3d]">
          Booking Selected
        </span>
      </div>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className={cardClass}>
              <h3 className="text-xl font-semibold text-[#1f442f]">Booking Summary</h3>
              <dl className="mt-3 grid grid-cols-[140px_1fr] gap-y-2 text-sm text-[#2c4535]">
                <dt>Booking Code</dt><dd>{String(booking.booking_code ?? "-")}</dd>
                <dt>Guest Name</dt><dd>{String((booking.guest as { full_name?: string } | null)?.full_name ?? "-")}</dd>
                <dt>Phone</dt><dd>{String((booking.guest as { phone?: string } | null)?.phone ?? "-")}</dd>
                <dt>WhatsApp</dt><dd>{String((booking.guest as { whatsapp_number?: string } | null)?.whatsapp_number ?? "-")}</dd>
                <dt>Email</dt><dd>{String((booking.guest as { email?: string } | null)?.email ?? "-")}</dd>
                <dt>Cottage</dt><dd>{String((booking.cottages as { name?: string } | null)?.name ?? "-")}</dd>
                <dt>Check-in</dt><dd>{checkInDate || "-"}</dd>
                <dt>Check-out</dt><dd>{checkOutDate || "-"}</dd>
                <dt>Nights</dt><dd>{nights}</dd>
                <dt>Guests</dt><dd>{Number(booking.adults ?? 0)} Adults, {Number(booking.children ?? 0)} Children</dd>
                <dt>Booking Status</dt><dd><StatusBadge status={String(booking.status ?? "pending")} /></dd>
                <dt>Payment Status</dt><dd><StatusBadge status={String(booking.payment_status ?? "unpaid")} /></dd>
                <dt>Source</dt><dd>{String(booking.source ?? "-")}</dd>
              </dl>
              <p className="mt-3 rounded-xl border border-[#c6d8cb] bg-[#f4fbf6] px-3 py-2 text-xs text-[#48614f]">Phone format rule: 10 digits only.</p>
            </article>

            <article className={cardClass}>
              <h3 className="text-xl font-semibold text-[#1f442f]">Billing Breakdown</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-[#e5dccf]">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Room Charge {hasSplitPricing ? "(weekday/weekend pricing applied)" : `(₹${Math.round(roomCharge / Math.max(nights, 1)).toLocaleString("en-IN")} × ${nights} nights)`}</td><td className="px-3 py-2 text-right">₹{roomCharge.toLocaleString("en-IN")}</td></tr>
                    <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Extra Charges</td><td className="px-3 py-2 text-right">₹{extra.toLocaleString("en-IN")}</td></tr>
                    <tr className="border-b border-[#eee6da] bg-[#f7f4ec] font-semibold"><td className="px-3 py-2">Subtotal</td><td className="px-3 py-2 text-right">₹{subtotal.toLocaleString("en-IN")}</td></tr>
                    <tr className="border-b border-[#eee6da]"><td className="px-3 py-2 text-rose-700">Discount</td><td className="px-3 py-2 text-right text-rose-700">-₹{discount.toLocaleString("en-IN")}</td></tr>
                    <tr className="border-b border-[#eee6da] bg-[#f1f8f2] text-lg font-semibold text-[#1f4c32]"><td className="px-3 py-2">Final Total</td><td className="px-3 py-2 text-right">₹{finalTotal.toLocaleString("en-IN")}</td></tr>
                    <tr className="border-b border-[#eee6da]"><td className="px-3 py-2">Amount Paid</td><td className="px-3 py-2 text-right">-₹{amountPaid.toLocaleString("en-IN")}</td></tr>
                    <tr className="bg-[#fff3e6] text-lg font-semibold text-[#be5b00]"><td className="px-3 py-2">Pending Amount</td><td className="px-3 py-2 text-right">₹{pending.toLocaleString("en-IN")}</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-sm font-medium text-[#2f5a3d]">{pending <= 0 ? "Fully Paid" : "Pending"}</p>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <form action={addBookingChargeAction} className={cardClass}>
              <h3 className="text-xl font-semibold text-[#1f442f]">Extra Charges</h3>
              <input type="hidden" name="booking_id" value={bookingId} />
              <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
              <label className="block text-sm">Charge Type
                <select name="charge_type" className={inputClass} defaultValue="other" required>
                  {chargeTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}
                </select>
              </label>
              <label className="block text-sm">Description<input name="description" className={inputClass} placeholder="Enter clear charge note" maxLength={200} required /></label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">Quantity<input name="quantity" type="number" min={1} defaultValue={1} className={inputClass} required /></label>
                <label className="block text-sm">Unit Price<input name="unit_price" type="number" min={0} step="0.01" defaultValue={0} className={inputClass} required /></label>
              </div>
              <button className="mt-3 w-full rounded-xl border border-[#84aa8c] bg-[#edf8ef] px-3 py-2 font-semibold text-[#2a573b]">Add Charge</button>
            </form>

            <form action={addBookingPaymentAction} className={cardClass}>
              <h3 className="text-xl font-semibold text-[#1f442f]">Record Payment</h3>
              <input type="hidden" name="booking_id" value={bookingId} />
              <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
              <label className="block text-sm">Payment Amount
                <input name="amount" type="number" min={0.01} step="0.01" className={inputClass} placeholder="Enter payment amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required />
              </label>
              <label className="block text-sm">Payment Mode
                <select name="payment_mode" className={inputClass} defaultValue="cash">
                  <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other</option>
                </select>
              </label>
              <label className="block text-sm">Payment Type
                <select name="payment_type" className={inputClass} value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                  <option value="advance">Advance</option><option value="part_payment">Part Payment</option><option value="final_payment">Final Payment</option><option value="refund">Refund</option>
                </select>
              </label>
              <label className="block text-sm">Reference Number<input name="reference_number" className={inputClass} placeholder="Enter UPI or bank reference" /></label>
              <label className="block text-sm">Notes<textarea name="notes" className={inputClass} placeholder="Enter payment notes, if any" /></label>
              {paymentValidationMessage ? <p className="mt-2 rounded-xl border border-[#f4be8d] bg-[#fff4e8] px-3 py-2 text-sm text-[#b35700]">{paymentValidationMessage}</p> : null}
              <button disabled={Boolean(paymentValidationMessage)} className="mt-3 w-full rounded-xl bg-[#e06f00] px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save Payment</button>
            </form>

            <div className={cardClass}>
              <h3 className="text-xl font-semibold text-[#1f442f]">Invoice / Checkout Actions</h3>
              <form action={applyBookingDiscountAction} className="mt-3">
                <input type="hidden" name="booking_id" value={bookingId} />
                <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                <label className="block text-sm">Discount
                  <input type="number" name="discount_amount" min={0} step="0.01" defaultValue={discount} className={inputClass} />
                </label>
                <button className="mt-2 w-full rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">Apply Discount</button>
              </form>
              <form action={generateInvoiceAction} className="mt-2">
                <input type="hidden" name="booking_id" value={bookingId} />
                <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                <button className="w-full rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">Generate Invoice</button>
              </form>
              <form action={performCheckInOutAction} className="mt-2">
                <input type="hidden" name="booking_id" value={bookingId} />
                <input type="hidden" name="action_type" value="check_out" />
                <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                <button disabled={Boolean(checkoutReason)} className="w-full rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Complete Checkout</button>
                <p className="mt-2 text-xs text-[#7c6e58]">{checkoutReason || "Checkout is ready for completion."}</p>
              </form>
              {invoices[0] ? <Link className="mt-2 block text-center text-sm font-semibold text-[#2a5f3f] underline" href={`/admin/invoices/${String(invoices[0].id)}`}>Open Latest Invoice</Link> : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className={cardClass}>
              <h3 className="mb-2 text-xl font-semibold text-[#1f442f]">Extra Charges List</h3>
              {charges.length === 0 ? <p className="text-sm text-[#66766b]">No extra charges added yet.</p> : (
                <DataTable
                  rows={charges.map((charge) => ({
                    id: String(charge.id ?? ""),
                    charge_type: String(charge.charge_type ?? "other").replaceAll("_", " "),
                    description: String(charge.description ?? "-"),
                    quantity: Number(charge.quantity ?? 0),
                    unit_price: Number(charge.unit_price ?? 0),
                    amount: Number(charge.amount ?? 0),
                  }))}
                  columns={[
                    { key: "charge_type", header: "Charge" },
                    { key: "description", header: "Description" },
                    { key: "quantity", header: "Qty" },
                    { key: "unit_price", header: "Unit Price", render: (row) => `₹${row.unit_price.toLocaleString("en-IN")}` },
                    { key: "amount", header: "Amount", render: (row) => `₹${row.amount.toLocaleString("en-IN")}` },
                    {
                      key: "actions",
                      header: "",
                      render: (row) => (
                        <form action={deleteBookingChargeAction} onSubmit={(event) => {
                          if (!window.confirm("Delete this extra charge?")) event.preventDefault();
                        }}>
                          <input type="hidden" name="booking_id" value={bookingId} />
                          <input type="hidden" name="charge_id" value={row.id} />
                          <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                          <button className="text-xs font-semibold text-rose-700">Delete</button>
                        </form>
                      ),
                    },
                  ]}
                />
              )}
            </article>

            <article className={cardClass}>
              <h3 className="mb-2 text-xl font-semibold text-[#1f442f]">Payment History</h3>
              {payments.length === 0 ? <p className="text-sm text-[#66766b]">No payments recorded yet.</p> : (
                <DataTable
                  rows={payments.map((payment) => ({
                    id: String(payment.id ?? ""),
                    payment_date: String(payment.payment_date ?? "-"),
                    payment_type: String(payment.payment_type ?? "-").replaceAll("_", " "),
                    payment_mode: String(payment.payment_mode ?? "-").toUpperCase(),
                    amount: Number(payment.amount ?? 0),
                    reference_number: String(payment.reference_number ?? "-"),
                    notes: String(payment.notes ?? "-"),
                    received_by: String(payment.received_by ?? "-"),
                  }))}
                  columns={[
                    { key: "payment_date", header: "Date" },
                    { key: "payment_type", header: "Type" },
                    { key: "payment_mode", header: "Mode" },
                    { key: "amount", header: "Amount", render: (row) => `₹${row.amount.toLocaleString("en-IN")}` },
                    { key: "reference_number", header: "Reference" },
                    { key: "notes", header: "Notes" },
                    { key: "received_by", header: "Received By" },
                  ]}
                />
              )}
            </article>
          </div>
        </div>

        <aside className={`${cardClass} h-fit bg-[#fffaf1]`}>
          <h3 className="text-2xl font-semibold text-[#1f442f]">How this billing works</h3>
          <ol className="mt-3 space-y-3 text-sm text-[#324739]">
            <li>1. Select booking from billing search — never enter raw booking ID.</li>
            <li>2. Room charges are auto-calculated from cottage price and nights.</li>
            <li>3. Add extra charges, discount, and payments to update totals.</li>
            <li>4. Every payment is saved in payment history separately.</li>
            <li>5. Checkout is available only when pending amount is zero.</li>
          </ol>
          <p className="mt-4 rounded-xl border border-[#bdd2c2] bg-[#f2f9f3] px-3 py-2 text-sm text-[#3a5e49]">
            Goal: staff should always know whose bill this is, what is paid, and what remains pending.
          </p>
        </aside>
      </section>
    </div>
  );
}
