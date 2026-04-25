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
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

type BillingWorkspaceClientProps = {
  bookingId: string;
  booking: Record<string, unknown>;
  charges: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
};

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf8] px-3 py-2 text-sm text-[#21392c]";
const cardClass = "rounded-2xl border border-[#d8cfbf] bg-[#fffdf8] p-4 shadow-sm";
const fieldRowClass = "grid grid-cols-[130px_1fr] gap-2 text-sm text-[#2c4535]";

const chargeTypeOptions = [
  { value: "extra_bed", label: "Extra Bed" },
  { value: "extra_person", label: "Extra Person" },
  { value: "food_bill", label: "Food Bill" },
  { value: "bonfire", label: "Bonfire" },
  { value: "transport", label: "Transport" },
  { value: "laundry", label: "Laundry" },
  { value: "decoration", label: "Decoration" },
  { value: "late_checkout", label: "Late Checkout" },
  { value: "damage_charge", label: "Damage Charge" },
  { value: "other", label: "Other" },
] as const;

function formatMoney(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function getChargeTypeLabel(value: string) {
  const normalized = value.replaceAll("_", " ");
  const fromOption = chargeTypeOptions.find((item) => item.value === value);
  if (fromOption) return fromOption.label;
  if (value === "food") return "Food Bill";
  if (value === "damage") return "Damage Charge";
  return normalized.replace(/\b\w/g, (x) => x.toUpperCase());
}

export function BillingWorkspaceClient({ bookingId, booking, charges, payments, invoices }: BillingWorkspaceClientProps) {
  const pending = Math.max(0, Number(booking.amount_pending ?? 0));
  const finalTotal = Math.max(0, Number(booking.final_total ?? 0));
  const amountPaid = Math.max(0, Number(booking.amount_paid ?? 0));
  const roomCharge = Math.max(0, Number(booking.total_amount ?? 0));
  const discount = Math.max(0, Number(booking.discount_amount ?? 0));
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("part_payment");
  const [discountAmount, setDiscountAmount] = useState(String(discount));
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeQuantity, setChargeQuantity] = useState("1");
  const [chargeUnitPrice, setChargeUnitPrice] = useState("0");

  const safeCharges = charges.map((charge) => ({
    id: String(charge.id ?? ""),
    charge_type: String(charge.charge_type ?? "other"),
    description: String(charge.description ?? ""),
    quantity: Number(charge.quantity ?? 0),
    unit_price: Number(charge.unit_price ?? 0),
    amount: Number(charge.amount ?? 0),
  }));

  const safePayments = payments.map((payment) => ({
    id: String(payment.id ?? ""),
    payment_date: String(payment.payment_date ?? "-"),
    payment_type: String(payment.payment_type ?? "-"),
    payment_mode: String(payment.payment_mode ?? "-").toUpperCase(),
    amount: Number(payment.amount ?? 0),
    reference_number: String(payment.reference_number ?? "-"),
    notes: String(payment.notes ?? "-") || "-",
  }));

  const extraTotal = useMemo(() => safeCharges.reduce((sum, row) => sum + Math.max(0, row.amount), 0), [safeCharges]);
  const subtotal = roomCharge + extraTotal;

  const paymentValidationMessage = useMemo(() => {
    const value = Number(paymentAmount || 0);
    if (value <= 0) return "Payment amount must be valid.";
    if (paymentType !== "refund" && value > pending) return "Payment amount cannot be more than the pending amount.";
    if (paymentType === "refund" && value > amountPaid) return "Refund cannot exceed amount paid so far.";
    return "";
  }, [amountPaid, paymentAmount, paymentType, pending]);

  const discountValidationMessage = useMemo(() => {
    const value = Number(discountAmount || 0);
    if (!Number.isFinite(value)) return "Discount amount is invalid.";
    if (value < 0) return "Discount cannot be negative.";
    if (value > subtotal) return "Discount cannot exceed subtotal.";
    return "";
  }, [discountAmount, subtotal]);

  const chargeAmountPreview = useMemo(() => {
    const quantity = Number(chargeQuantity || 0);
    const unitPrice = Number(chargeUnitPrice || 0);
    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice) || quantity <= 0 || unitPrice < 0) return 0;
    return Number((quantity * unitPrice).toFixed(2));
  }, [chargeQuantity, chargeUnitPrice]);

  const totalGuests = Number(booking.adults ?? 0) + Number(booking.children ?? 0) + Number(booking.infants ?? 0);
  const invoice = invoices[0];
  const today = format(new Date(), "yyyy-MM-dd");
  const checkOutDate = String(booking.check_out_date ?? "");
  const bookingStatus = String(booking.status ?? "");
  const checkoutReason = bookingStatus !== "checked_in"
    ? "Guest must be checked in before checkout."
    : pending > 0
      ? "Pending amount must be cleared before checkout."
      : checkOutDate !== today
        ? "Checkout is available only on the scheduled checkout date."
        : "";

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 print:hidden">
        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-[#1f442f]">Booking Summary</h3>
          <dl className="mt-3 space-y-2">
            <div className={fieldRowClass}><dt>Booking Code</dt><dd>{String(booking.booking_code ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Guest Name</dt><dd>{String((booking.guest as { full_name?: string } | null)?.full_name ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Phone Number</dt><dd>{String((booking.guest as { phone?: string } | null)?.phone ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Cottage</dt><dd>{String((booking.cottages as { name?: string } | null)?.name ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Check-in Date</dt><dd>{String(booking.check_in_date ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Check-out Date</dt><dd>{String(booking.check_out_date ?? "-")}</dd></div>
            <div className={fieldRowClass}><dt>Nights</dt><dd>{Number(booking.nights ?? 0)}</dd></div>
            <div className={fieldRowClass}><dt>Guests</dt><dd>{totalGuests}</dd></div>
            <div className={fieldRowClass}><dt>Booking Status</dt><dd><StatusBadge status={String(booking.status ?? "pending")} /></dd></div>
            <div className={fieldRowClass}><dt>Payment Status</dt><dd><StatusBadge status={String(booking.payment_status ?? "unpaid")} /></dd></div>
            <div className={fieldRowClass}><dt>Booking Source</dt><dd>{String(booking.source ?? "-")}</dd></div>
          </dl>
        </article>

        <article className={cardClass}>
          <h3 className="text-lg font-semibold text-[#1f442f]">Billing Breakdown</h3>
          <div id="billing-invoice-section" className="mt-3 space-y-3 rounded-xl border border-[#e6dccd] bg-white p-3">
            <div>
              <h4 className="text-sm font-semibold text-[#1f442f]">Room Charges</h4>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span>{String((booking.cottages as { name?: string } | null)?.name ?? "Room")} × {Number(booking.nights ?? 0)} nights</span>
                <span>{formatMoney(roomCharge)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1f442f]">Extra Charges / Add-ons</h4>
              {safeCharges.length === 0 ? (
                <p className="mt-1 text-sm text-[#67786d]">No extra charges added yet.</p>
              ) : (
                <ul className="mt-1 space-y-1 text-sm">
                  {safeCharges.map((charge) => (
                    <li key={charge.id} className="flex items-center justify-between">
                      <span>{getChargeTypeLabel(charge.charge_type)} × {Math.max(0, charge.quantity)} {charge.description ? `(${charge.description})` : ""}</span>
                      <span>{formatMoney(charge.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-[#efe8dd] pt-2 text-sm">
              <div className="flex items-center justify-between"><span>Discount</span><span className="text-rose-700">-{formatMoney(discount)}</span></div>
              <div className="mt-1 flex items-center justify-between font-semibold text-[#1f4c32]"><span>Final Total</span><span>{formatMoney(finalTotal)}</span></div>
              <div className="mt-1 flex items-center justify-between"><span>Amount Paid</span><span>{formatMoney(amountPaid)}</span></div>
              <div className="mt-1 flex items-center justify-between text-[#b35700] font-semibold"><span>Pending Amount</span><span>{formatMoney(pending)}</span></div>
              <div className="mt-2">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${pending <= 0 ? "border-[#9cc7aa] bg-[#edf9ef] text-[#25563b]" : "border-[#f0c99e] bg-[#fff4e8] text-[#b35700]"}`}>
                  {pending <= 0 ? "Fully Paid" : "Pending"}
                </span>
              </div>
            </div>

            <div className="print:hidden border-t border-[#efe8dd] pt-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {!invoice ? (
                  <form action={generateInvoiceAction}>
                    <input type="hidden" name="booking_id" value={bookingId} />
                    <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                    <button className="w-full rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white">Generate Invoice</button>
                  </form>
                ) : null}
                <button type="button" onClick={() => window.print()} className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-sm font-semibold text-[#2e5a3d]">Print Invoice</button>
              </div>
              <form action={performCheckInOutAction} className="mt-2">
                <input type="hidden" name="booking_id" value={bookingId} />
                <input type="hidden" name="action_type" value="check_out" />
                <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                <button disabled={Boolean(checkoutReason)} className="w-full rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Complete Checkout</button>
                <p className="mt-1 text-xs text-[#7c6e58]">{checkoutReason || "Checkout is ready for completion."}</p>
              </form>
              {invoice ? <Link className="mt-2 block text-sm font-semibold text-[#2a5f3f] underline" href={`/admin/invoices/${String(invoice.id ?? "")}`}>View Invoice</Link> : null}
            </div>
          </div>
        </article>

        <article className={cardClass}>
          <h3 className="mb-2 text-lg font-semibold text-[#1f442f]">Payment History</h3>
          {safePayments.length === 0 ? <p className="text-sm text-[#66766b]">No payments recorded yet.</p> : (
            <div className="max-h-[420px] overflow-auto rounded-xl border border-[#e6dccd]">
              <table className="w-full text-sm">
                <thead className="bg-[#f7f2e8] text-[#294736]"><tr><th className="px-2 py-2 text-left">Date</th><th className="px-2 py-2 text-left">Type</th><th className="px-2 py-2 text-left">Mode</th><th className="px-2 py-2 text-right">Amount</th><th className="px-2 py-2 text-left">Reference</th><th className="px-2 py-2 text-left">Notes</th></tr></thead>
                <tbody>
                  {safePayments.map((payment) => (
                    <tr key={payment.id} className="border-t border-[#eee6da]"><td className="px-2 py-2">{payment.payment_date}</td><td className="px-2 py-2">{payment.payment_type.replaceAll("_", " ")}</td><td className="px-2 py-2">{payment.payment_mode}</td><td className="px-2 py-2 text-right">{formatMoney(payment.amount)}</td><td className="px-2 py-2">{payment.reference_number}</td><td className="px-2 py-2">{payment.notes}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 print:hidden">
        <article className={cardClass}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#1f442f]">Extra Charges</h3>
            <button type="button" onClick={() => setShowChargeModal(true)} className="rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white">+ Add Charge</button>
          </div>
          {safeCharges.length === 0 ? <p className="text-sm text-[#66766b]">No extra charges added yet.</p> : (
            <div className="max-h-[360px] overflow-auto rounded-xl border border-[#e6dccd]">
              <table className="w-full text-sm">
                <thead className="bg-[#f7f2e8]"><tr><th className="px-2 py-2 text-left">Type</th><th className="px-2 py-2 text-left">Description</th><th className="px-2 py-2 text-right">Qty</th><th className="px-2 py-2 text-right">Rate</th><th className="px-2 py-2 text-right">Amount</th><th className="px-2 py-2" /></tr></thead>
                <tbody>
                  {safeCharges.map((charge) => (
                    <tr key={charge.id} className="border-t border-[#eee6da]">
                      <td className="px-2 py-2">{getChargeTypeLabel(charge.charge_type)}</td>
                      <td className="px-2 py-2">{charge.description || "-"}</td>
                      <td className="px-2 py-2 text-right">{charge.quantity}</td>
                      <td className="px-2 py-2 text-right">{formatMoney(charge.unit_price)}</td>
                      <td className="px-2 py-2 text-right">{formatMoney(charge.amount)}</td>
                      <td className="px-2 py-2 text-right">
                        <form action={deleteBookingChargeAction} onSubmit={(event) => {
                          if (!window.confirm("Delete this extra charge?")) event.preventDefault();
                        }}>
                          <input type="hidden" name="booking_id" value={bookingId} />
                          <input type="hidden" name="charge_id" value={charge.id} />
                          <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
                          <button className="text-xs font-semibold text-rose-700">Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <form action={addBookingPaymentAction} className={cardClass}>
          <h3 className="text-lg font-semibold text-[#1f442f]">Record Payment</h3>
          <input type="hidden" name="booking_id" value={bookingId} />
          <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
          <label className="block text-sm">Payment Amount
            <input name="amount" type="number" min={0.01} step="0.01" className={inputClass} placeholder="Enter payment amount" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} required />
          </label>
          <label className="block text-sm">Payment Mode
            <select name="payment_mode" className={inputClass} defaultValue="cash" required>
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other</option>
            </select>
          </label>
          <label className="block text-sm">Payment Type
            <select name="payment_type" className={inputClass} value={paymentType} onChange={(event) => setPaymentType(event.target.value)} required>
              <option value="advance">Advance</option><option value="part_payment">Part Payment</option><option value="final_payment">Final Payment</option><option value="refund">Refund</option>
            </select>
          </label>
          <label className="block text-sm">Reference Number<input name="reference_number" className={inputClass} placeholder="Enter UPI or bank reference" /></label>
          <label className="block text-sm">Notes<textarea name="notes" className={inputClass} placeholder="Enter payment notes, if any" /></label>
          {paymentValidationMessage ? <p className="mt-2 rounded-xl border border-[#f4be8d] bg-[#fff4e8] px-3 py-2 text-sm text-[#b35700]">{paymentValidationMessage}</p> : null}
          <button disabled={Boolean(paymentValidationMessage)} className="mt-3 w-full rounded-xl bg-[#e06f00] px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Save Payment</button>
        </form>

        <form action={applyBookingDiscountAction} className={cardClass}>
          <h3 className="text-lg font-semibold text-[#1f442f]">Discount</h3>
          <input type="hidden" name="booking_id" value={bookingId} />
          <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
          <label className="block text-sm">Discount Amount
            <input type="number" name="discount_amount" min={0} step="0.01" className={inputClass} value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} required />
          </label>
          <label className="block text-sm">Discount Reason / Notes
            <textarea name="notes" className={inputClass} placeholder="Optional reason for discount" />
          </label>
          {discountValidationMessage ? <p className="mt-2 rounded-xl border border-[#f4be8d] bg-[#fff4e8] px-3 py-2 text-sm text-[#b35700]">{discountValidationMessage}</p> : null}
          <button disabled={Boolean(discountValidationMessage)} className="mt-3 w-full rounded-xl bg-[#e06f00] px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Apply Discount</button>
        </form>
      </section>

      <section id="print-invoice-only" className="hidden print:block">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#d6ccbd] bg-white p-4 text-sm text-[#203628]">
          <div className="mb-2 border-b border-[#e6dccd] pb-2">
            <h2 className="text-xl font-semibold">La Ki Trep Resort</h2>
            <p>Invoice {invoice ? `#${String(invoice.invoice_number ?? "-")}` : "(Draft)"}</p>
            <p>Generated: {format(new Date(), "yyyy-MM-dd")}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <p><strong>Booking Code:</strong> {String(booking.booking_code ?? "-")}</p>
            <p><strong>Guest:</strong> {String((booking.guest as { full_name?: string } | null)?.full_name ?? "-")}</p>
            <p><strong>Phone:</strong> {String((booking.guest as { phone?: string } | null)?.phone ?? "-")}</p>
            <p><strong>Cottage:</strong> {String((booking.cottages as { name?: string } | null)?.name ?? "-")}</p>
            <p><strong>Stay:</strong> {String(booking.check_in_date ?? "-")} → {String(booking.check_out_date ?? "-")}</p>
            <p><strong>Nights:</strong> {Number(booking.nights ?? 0)}</p>
          </div>
          <div className="mt-3 rounded-lg border border-[#e6dccd] p-2">
            <p className="flex justify-between"><span>Room Charges</span><span>{formatMoney(roomCharge)}</span></p>
            {safeCharges.map((charge) => (
              <p key={charge.id} className="flex justify-between"><span>{getChargeTypeLabel(charge.charge_type)} × {charge.quantity}</span><span>{formatMoney(charge.amount)}</span></p>
            ))}
            <p className="mt-1 flex justify-between"><span>Discount</span><span>-{formatMoney(discount)}</span></p>
            <p className="flex justify-between font-semibold"><span>Final Total</span><span>{formatMoney(finalTotal)}</span></p>
            <p className="flex justify-between"><span>Amount Paid</span><span>{formatMoney(amountPaid)}</span></p>
            <p className="flex justify-between font-semibold"><span>Pending Amount</span><span>{formatMoney(pending)}</span></p>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold">Payment History</h4>
            {safePayments.length === 0 ? <p>No payments recorded yet.</p> : (
              <ul className="space-y-1">
                {safePayments.map((payment) => <li key={payment.id}>{payment.payment_date} • {payment.payment_type.replaceAll("_", " ")} • {payment.payment_mode} • {formatMoney(payment.amount)}</li>)}
              </ul>
            )}
          </div>
        </div>
      </section>

      {showChargeModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#d8cfbf] bg-[#fffdf8] p-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#1f442f]">Add Extra Charge</h3>
            <form action={addBookingChargeAction} className="mt-3">
              <input type="hidden" name="booking_id" value={bookingId} />
              <input type="hidden" name="return_path" value={`/admin/billing/${bookingId}`} />
              <label className="block text-sm">Charge Type
                <select name="charge_type" className={inputClass} defaultValue="other" required>
                  {chargeTypeOptions.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
              <label className="block text-sm">Description
                <input name="description" className={inputClass} placeholder="Optional charge details" maxLength={200} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-sm">Quantity
                  <input name="quantity" type="number" min={1} step="1" className={inputClass} required value={chargeQuantity} onChange={(event) => setChargeQuantity(event.target.value)} />
                </label>
                <label className="block text-sm">Unit Price
                  <input name="unit_price" type="number" min={0} step="0.01" className={inputClass} required value={chargeUnitPrice} onChange={(event) => setChargeUnitPrice(event.target.value)} />
                </label>
              </div>
              <p className="mt-2 rounded-lg border border-[#efe8dd] bg-white px-3 py-2 text-sm">Amount Preview: <strong>{formatMoney(chargeAmountPreview)}</strong></p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowChargeModal(false)} className="rounded-xl border border-[#b8ad9b] px-3 py-2 text-sm font-semibold text-[#4d5f52]">Cancel</button>
                <button className="rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white">Save Charge</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
