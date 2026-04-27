"use client";

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
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

type BillingWorkspaceClientProps = {
  bookingId: string;
  booking: Record<string, unknown>;
  charges: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  invoices: Record<string, unknown>[];
};

const inputClass =
  "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#21392c] outline-none transition focus:border-[#2e5a3d] focus:ring-2 focus:ring-[#2e5a3d]/15";

const cardClass =
  "rounded-2xl border border-[#d8cfbf] bg-white p-4 shadow-sm sm:p-5";

const mutedCardClass =
  "rounded-2xl border border-[#eee6da] bg-[#fbf8f2] p-4";

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

function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatMoney(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: unknown) {
  const text = cleanText(value);

  if (text === "-") return "-";

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getChargeTypeLabel(value: string) {
  const fromOption = chargeTypeOptions.find((item) => item.value === value);

  if (fromOption) return fromOption.label;
  if (value === "food") return "Food Bill";
  if (value === "damage") return "Damage Charge";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNestedText(
  row: Record<string, unknown>,
  key: string,
  nestedKey: string,
) {
  const value = row[key];

  if (typeof value === "object" && value !== null && nestedKey in value) {
    return cleanText((value as Record<string, unknown>)[nestedKey]);
  }

  return "-";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 border-b border-[#f0e8dd] py-2 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.08em] text-[#6f7d74]">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[#21392c]">{value}</dd>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#1f442f] sm:text-lg">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-[#6f7d74]">{description}</p>
      ) : null}
    </div>
  );
}

export function BillingWorkspaceClient({
  bookingId,
  booking,
  charges,
  payments,
  invoices,
}: BillingWorkspaceClientProps) {
  const roomCharge = Math.max(0, toNumber(booking.total_amount));
  const discount = Math.max(0, toNumber(booking.discount_amount));
  const finalTotal = Math.max(0, toNumber(booking.final_total));
  const amountPaid = Math.max(0, toNumber(booking.amount_paid));
  const pending = Math.max(
    0,
    toNumber(booking.amount_pending) || finalTotal - amountPaid,
  );

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("part_payment");
  const [discountAmount, setDiscountAmount] = useState(String(discount));
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeQuantity, setChargeQuantity] = useState("1");
  const [chargeUnitPrice, setChargeUnitPrice] = useState("0");

  const safeCharges = charges.map((charge) => ({
    id: cleanText(charge.id, ""),
    charge_type: cleanText(charge.charge_type, "other"),
    description: cleanText(charge.description, ""),
    quantity: toNumber(charge.quantity),
    unit_price: toNumber(charge.unit_price),
    amount: toNumber(charge.amount),
  }));

  const safePayments = payments.map((payment) => ({
    id: cleanText(payment.id, ""),
    payment_date: cleanText(payment.payment_date ?? payment.created_at),
    payment_type: cleanText(payment.payment_type, "-"),
    payment_mode: cleanText(payment.payment_mode, "-").toUpperCase(),
    amount: toNumber(payment.amount),
    reference_number: cleanText(payment.reference_number),
    notes: cleanText(payment.notes),
  }));

  const extraTotal = useMemo(
    () => safeCharges.reduce((sum, row) => sum + Math.max(0, row.amount), 0),
    [safeCharges],
  );

  const subtotal = roomCharge + extraTotal;

  const totalGuests =
    toNumber(booking.adults) +
    toNumber(booking.children) +
    toNumber(booking.infants);

  const invoice = invoices[0];

  const today = format(new Date(), "yyyy-MM-dd");
  const checkOutDate = cleanText(booking.check_out_date, "");
  const bookingStatus = cleanText(booking.status, "");

  const checkoutReason =
    bookingStatus !== "checked_in"
      ? "Guest must be checked in before checkout."
      : pending > 0
        ? "Pending amount must be cleared before checkout."
        : checkOutDate !== today
          ? "Checkout is available only on the scheduled checkout date."
          : "";

  const paymentValidationMessage = useMemo(() => {
    const value = Number(paymentAmount || 0);

    if (value <= 0) return "Payment amount must be valid.";
    if (paymentType !== "refund" && value > pending) {
      return "Payment amount cannot be more than the pending amount.";
    }
    if (paymentType === "refund" && value > amountPaid) {
      return "Refund cannot exceed amount paid so far.";
    }

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

    if (
      !Number.isFinite(quantity) ||
      !Number.isFinite(unitPrice) ||
      quantity <= 0 ||
      unitPrice < 0
    ) {
      return 0;
    }

    return Number((quantity * unitPrice).toFixed(2));
  }, [chargeQuantity, chargeUnitPrice]);

  const bookingCode = cleanText(booking.booking_code);
  const guestName = getNestedText(booking, "guest", "full_name");
  const guestPhone = getNestedText(booking, "guest", "phone");
  const cottageName = getNestedText(booking, "cottages", "name");
  const nights = toNumber(booking.nights);

  return (
    <div className="space-y-5">
      <section className="grid gap-4 print:hidden xl:grid-cols-[1.05fr_1.15fr_0.8fr]">
        <article className={cardClass}>
          <SectionTitle
            title="Booking Summary"
            description="Guest, cottage and stay information."
          />

          <dl className="mt-4 rounded-2xl border border-[#eee6da] bg-[#fffdf8] p-3">
            <DetailRow label="Booking" value={bookingCode} />
            <DetailRow label="Guest" value={guestName} />
            <DetailRow label="Phone" value={guestPhone} />
            <DetailRow label="Cottage" value={cottageName} />
            <DetailRow label="Check-in" value={formatDate(booking.check_in_date)} />
            <DetailRow label="Check-out" value={formatDate(booking.check_out_date)} />
            <DetailRow label="Nights" value={nights} />
            <DetailRow label="Guests" value={totalGuests} />
            <DetailRow
              label="Status"
              value={<StatusBadge status={cleanText(booking.status, "pending")} />}
            />
            <DetailRow
              label="Payment"
              value={
                <StatusBadge
                  status={cleanText(booking.payment_status, "unpaid")}
                />
              }
            />
            <DetailRow label="Source" value={cleanText(booking.source)} />
          </dl>
        </article>

        <article className={cardClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              title="Billing Breakdown"
              description="Room charges, add-ons, discounts and final amount."
            />

            <span
              className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                pending <= 0
                  ? "border-[#9cc7aa] bg-[#edf9ef] text-[#25563b]"
                  : "border-[#f0c99e] bg-[#fff4e8] text-[#b35700]"
              }`}
            >
              {pending <= 0 ? "Fully Paid" : "Pending Payment"}
            </span>
          </div>

          <div
            id="billing-invoice-section"
            className="mt-4 rounded-2xl border border-[#e6dccd] bg-[#fffdf8] p-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f7d74]">
                    Room Charge
                  </p>
                  <p className="mt-1 text-sm text-[#536458]">
                    {cottageName} × {nights} night{nights === 1 ? "" : "s"}
                  </p>
                </div>
                <p className="font-semibold text-[#21392c]">
                  {formatMoney(roomCharge)}
                </p>
              </div>

              <div className="rounded-xl border border-[#eee6da] bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f7d74]">
                    Extra Charges
                  </p>
                  <p className="text-sm font-semibold text-[#21392c]">
                    {formatMoney(extraTotal)}
                  </p>
                </div>

                {safeCharges.length === 0 ? (
                  <p className="mt-2 text-sm text-[#67786d]">
                    No extra charges added yet.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {safeCharges.map((charge) => (
                      <li
                        key={charge.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <span className="text-[#536458]">
                          {getChargeTypeLabel(charge.charge_type)} ×{" "}
                          {Math.max(0, charge.quantity)}
                          {charge.description
                            ? ` (${charge.description})`
                            : ""}
                        </span>
                        <span className="font-medium text-[#21392c]">
                          {formatMoney(charge.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2 border-t border-[#efe8dd] pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#536458]">Subtotal</span>
                  <span className="font-medium text-[#21392c]">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#536458]">Discount</span>
                  <span className="font-medium text-rose-700">
                    -{formatMoney(discount)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#edf5ed] px-3 py-2">
                  <span className="font-semibold text-[#1f4c32]">
                    Final Total
                  </span>
                  <span className="text-lg font-bold text-[#1f4c32]">
                    {formatMoney(finalTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#536458]">Amount Paid</span>
                  <span className="font-medium text-[#21392c]">
                    {formatMoney(amountPaid)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[#fff4e8] px-3 py-2">
                  <span className="font-semibold text-[#b35700]">
                    Pending Amount
                  </span>
                  <span className="text-lg font-bold text-[#b35700]">
                    {formatMoney(pending)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className={cardClass}>
          <SectionTitle
            title="Quick Actions"
            description="Generate invoice, print bill or complete checkout."
          />

          <div className="mt-4 space-y-3">
            <div className={mutedCardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d74]">
                Invoice
              </p>

              {invoice ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-[#21392c]">
                    Invoice Generated
                  </p>
                  <p className="text-xs text-[#6f7d74]">
                    #{cleanText(invoice.invoice_number)}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#6f7d74]">
                  No invoice generated yet.
                </p>
              )}

              <div className="mt-3 grid gap-2">
                {!invoice ? (
                  <form action={generateInvoiceAction}>
                    <input type="hidden" name="booking_id" value={bookingId} />
                    <input
                      type="hidden"
                      name="return_path"
                      value={`/admin/billing/${bookingId}`}
                    />
                    <SubmitButton pendingText="Generating..." className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e5a3d] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]">
                      Generate Invoice
                    </SubmitButton>
                  </form>
                ) : null}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full rounded-xl border border-[#2e5a3d] bg-white px-3 py-2.5 text-sm font-semibold text-[#2e5a3d] transition hover:bg-[#f4efe4]"
                >
                  Print Invoice
                </button>
              </div>
            </div>

            <form action={performCheckInOutAction} className={mutedCardClass}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f7d74]">
                Checkout
              </p>

              <input type="hidden" name="booking_id" value={bookingId} />
              <input type="hidden" name="action_type" value="check_out" />
              <input
                type="hidden"
                name="return_path"
                value={`/admin/billing/${bookingId}`}
              />

              <SubmitButton
                pendingText="Processing..."
                disabled={Boolean(checkoutReason)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#d87319] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#bd6012]"
              >
                Complete Checkout
              </SubmitButton>

              <p className="mt-2 text-xs leading-5 text-[#7c6e58]">
                {checkoutReason || "Checkout is ready for completion."}
              </p>
            </form>
          </div>
        </article>
      </section>

      <section className="grid gap-4 print:hidden xl:grid-cols-[1fr_0.9fr_0.9fr]">
        <article className={cardClass}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle
              title="Extra Charges"
              description="Add or remove additional charges for this booking."
            />

            <button
              type="button"
              onClick={() => setShowChargeModal(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
            >
              + Add Charge
            </button>
          </div>

          {safeCharges.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#c7baa1] bg-[#fbf8f2] p-4 text-sm text-[#66766b]">
              No extra charges added yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e6dccd]">
              <table className="min-w-full text-sm">
                <thead className="bg-[#f7f2e8] text-[#294736]">
                  <tr>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Rate</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {safeCharges.map((charge) => (
                    <tr key={charge.id} className="border-t border-[#eee6da]">
                      <td className="whitespace-nowrap px-3 py-2">
                        {getChargeTypeLabel(charge.charge_type)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {charge.description || "-"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {charge.quantity}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {formatMoney(charge.unit_price)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {formatMoney(charge.amount)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <form
                          action={deleteBookingChargeAction}
                          onSubmit={(event) => {
                            if (!window.confirm("Delete this extra charge?")) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input
                            type="hidden"
                            name="booking_id"
                            value={bookingId}
                          />
                          <input
                            type="hidden"
                            name="charge_id"
                            value={charge.id}
                          />
                          <input
                            type="hidden"
                            name="return_path"
                            value={`/admin/billing/${bookingId}`}
                          />
                          <SubmitButton pendingText="Deleting..." className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                            Delete
                          </SubmitButton>
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
          <SectionTitle
            title="Record Payment"
            description="Add payment received or refund entry."
          />

          <input type="hidden" name="booking_id" value={bookingId} />
          <input
            type="hidden"
            name="return_path"
            value={`/admin/billing/${bookingId}`}
          />

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-[#344b3d]">
              Payment Amount
              <input
                name="amount"
                type="number"
                min={0.01}
                step="0.01"
                className={inputClass}
                placeholder="Enter payment amount"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
                required
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#344b3d]">
                Payment Mode
                <select
                  name="payment_mode"
                  className={inputClass}
                  defaultValue="cash"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#344b3d]">
                Payment Type
                <select
                  name="payment_type"
                  className={inputClass}
                  value={paymentType}
                  onChange={(event) => setPaymentType(event.target.value)}
                  required
                >
                  <option value="advance">Advance</option>
                  <option value="part_payment">Part Payment</option>
                  <option value="final_payment">Final Payment</option>
                  <option value="refund">Refund</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-[#344b3d]">
              Reference Number
              <input
                name="reference_number"
                className={inputClass}
                placeholder="Enter UPI or bank reference"
              />
            </label>

            <label className="block text-sm font-medium text-[#344b3d]">
              Notes
              <textarea
                name="notes"
                className={inputClass}
                placeholder="Enter payment notes, if any"
              />
            </label>

            {paymentValidationMessage ? (
              <p className="rounded-xl border border-[#f4be8d] bg-[#fff4e8] px-3 py-2 text-sm text-[#b35700]">
                {paymentValidationMessage}
              </p>
            ) : null}

            <SubmitButton
              pendingText="Saving payment..."
              disabled={Boolean(paymentValidationMessage)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e5a3d] px-3 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#244832]"
            >
              Save Payment
            </SubmitButton>
          </div>
        </form>

        <form action={applyBookingDiscountAction} className={cardClass}>
          <SectionTitle
            title="Discount"
            description="Apply or update discount for this booking."
          />

          <input type="hidden" name="booking_id" value={bookingId} />
          <input
            type="hidden"
            name="return_path"
            value={`/admin/billing/${bookingId}`}
          />

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-[#344b3d]">
              Discount Amount
              <input
                type="number"
                name="discount_amount"
                min={0}
                step="0.01"
                className={inputClass}
                value={discountAmount}
                onChange={(event) => setDiscountAmount(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-medium text-[#344b3d]">
              Discount Reason / Notes
              <textarea
                name="notes"
                className={inputClass}
                placeholder="Optional reason for discount"
              />
            </label>

            {discountValidationMessage ? (
              <p className="rounded-xl border border-[#f4be8d] bg-[#fff4e8] px-3 py-2 text-sm text-[#b35700]">
                {discountValidationMessage}
              </p>
            ) : null}

            <SubmitButton
              pendingText="Applying discount..."
              disabled={Boolean(discountValidationMessage)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#d87319] px-3 py-2.5 font-semibold text-white shadow-sm transition hover:bg-[#bd6012]"
            >
              Apply Discount
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className={`${cardClass} print:hidden`}>
        <SectionTitle
          title="Payment History"
          description="All payments and refunds recorded for this booking."
        />

        {safePayments.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-[#c7baa1] bg-[#fbf8f2] p-4 text-sm text-[#66766b]">
            No payments recorded yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#e6dccd]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f7f2e8] text-[#294736]">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Reference</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {safePayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-[#eee6da]">
                    <td className="whitespace-nowrap px-3 py-2">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.payment_type.replaceAll("_", " ")}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.payment_mode}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-medium">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.reference_number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      {payment.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="print-invoice-only" className="hidden print:block">
        <div className="mx-auto max-w-3xl rounded-xl border border-[#d6ccbd] bg-white p-4 text-sm text-[#203628]">
          <div className="mb-2 border-b border-[#e6dccd] pb-2">
            <h2 className="text-xl font-semibold">La Ki Trep Resort</h2>
            <p>
              Invoice{" "}
              {invoice
                ? `#${cleanText(invoice.invoice_number)}`
                : "(Draft)"}
            </p>
            <p>Generated: {format(new Date(), "yyyy-MM-dd")}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <p>
              <strong>Booking Code:</strong> {bookingCode}
            </p>
            <p>
              <strong>Guest:</strong> {guestName}
            </p>
            <p>
              <strong>Phone:</strong> {guestPhone}
            </p>
            <p>
              <strong>Cottage:</strong> {cottageName}
            </p>
            <p>
              <strong>Stay:</strong> {formatDate(booking.check_in_date)} →{" "}
              {formatDate(booking.check_out_date)}
            </p>
            <p>
              <strong>Nights:</strong> {nights}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-[#e6dccd] p-2">
            <p className="flex justify-between">
              <span>Room Charges</span>
              <span>{formatMoney(roomCharge)}</span>
            </p>

            {safeCharges.map((charge) => (
              <p key={charge.id} className="flex justify-between">
                <span>
                  {getChargeTypeLabel(charge.charge_type)} × {charge.quantity}
                </span>
                <span>{formatMoney(charge.amount)}</span>
              </p>
            ))}

            <p className="mt-1 flex justify-between">
              <span>Discount</span>
              <span>-{formatMoney(discount)}</span>
            </p>
            <p className="flex justify-between font-semibold">
              <span>Final Total</span>
              <span>{formatMoney(finalTotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Amount Paid</span>
              <span>{formatMoney(amountPaid)}</span>
            </p>
            <p className="flex justify-between font-semibold">
              <span>Pending Amount</span>
              <span>{formatMoney(pending)}</span>
            </p>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold">Payment History</h4>
            {safePayments.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <ul className="space-y-1">
                {safePayments.map((payment) => (
                  <li key={payment.id}>
                    {formatDate(payment.payment_date)} •{" "}
                    {payment.payment_type.replaceAll("_", " ")} •{" "}
                    {payment.payment_mode} • {formatMoney(payment.amount)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {showChargeModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0f1f17]/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#d8cfbf] bg-[#fffdf8] shadow-2xl">
            <div className="border-b border-[#eee6da] bg-[linear-gradient(120deg,#fbf8f2_0%,#f2ede3_100%)] p-5">
              <h3 className="text-lg font-semibold text-[#1f442f]">
                Add Extra Charge
              </h3>
              <p className="mt-1 text-sm text-[#6f7d74]">
                Add additional services or charges to this booking.
              </p>
            </div>

            <form action={addBookingChargeAction} className="space-y-3 p-5">
              <input type="hidden" name="booking_id" value={bookingId} />
              <input
                type="hidden"
                name="return_path"
                value={`/admin/billing/${bookingId}`}
              />

              <label className="block text-sm font-medium text-[#344b3d]">
                Charge Type
                <select
                  name="charge_type"
                  className={inputClass}
                  defaultValue="other"
                  required
                >
                  {chargeTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-[#344b3d]">
                Description
                <input
                  name="description"
                  className={inputClass}
                  placeholder="Optional charge details"
                  maxLength={200}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-[#344b3d]">
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    step="1"
                    className={inputClass}
                    required
                    value={chargeQuantity}
                    onChange={(event) =>
                      setChargeQuantity(event.target.value)
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-[#344b3d]">
                  Unit Price
                  <input
                    name="unit_price"
                    type="number"
                    min={0}
                    step="0.01"
                    className={inputClass}
                    required
                    value={chargeUnitPrice}
                    onChange={(event) =>
                      setChargeUnitPrice(event.target.value)
                    }
                  />
                </label>
              </div>

              <p className="rounded-xl border border-[#efe8dd] bg-white px-3 py-2 text-sm text-[#344b3d]">
                Amount Preview:{" "}
                <strong>{formatMoney(chargeAmountPreview)}</strong>
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChargeModal(false)}
                  className="rounded-xl border border-[#b8ad9b] bg-white px-4 py-2 text-sm font-semibold text-[#4d5f52] transition hover:bg-[#f4efe4]"
                >
                  Cancel
                </button>

                <SubmitButton pendingText="Saving charge..." className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]">
                  Save Charge
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}