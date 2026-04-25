//src\components\public\BookingRequestForm.tsx
"use client";

import { useActionState, useMemo, useState } from "react";
import { submitBookingRequest, type BookingFormState } from "@/actions/public/bookings";
import {
  calculateBookingEstimate,
  DEFAULT_GUESTS,
  formatCurrency,
  getMinCheckoutDate,
  validateGuestCapacity,
  type GuestCounts,
} from "@/lib/booking";
import type { PublicCottage } from "@/lib/public-site";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";

const initialState: BookingFormState = {
  success: false,
  message: "",
};

type BookingRequestFormProps = {
  cottages: PublicCottage[];
  initialValues?: {
    cottageSlug?: string;
    checkInDate?: string;
    checkOutDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
  cottageLocked?: boolean;
  compact?: boolean;
  onCancel?: () => void;
};

function keepOnlyTenDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function BookingRequestForm({
  cottages,
  initialValues,
  cottageLocked = false,
  compact = false,
  onCancel,
}: BookingRequestFormProps) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, initialState);

  const [cottageSlug, setCottageSlug] = useState(initialValues?.cottageSlug ?? "");
  const [checkInDate, setCheckInDate] = useState(initialValues?.checkInDate ?? "");
  const [checkOutDate, setCheckOutDate] = useState(initialValues?.checkOutDate ?? "");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const [guests, setGuests] = useState<GuestCounts>({
    adults: initialValues?.adults ?? DEFAULT_GUESTS.adults,
    children: initialValues?.children ?? DEFAULT_GUESTS.children,
    infants: initialValues?.infants ?? DEFAULT_GUESTS.infants,
  });

  const selectedCottage = useMemo(
    () => cottages.find((cottage) => cottage.slug === cottageSlug),
    [cottages, cottageSlug],
  );

  const totalGuests = guests.adults + guests.children + guests.infants;
  const capacityError = validateGuestCapacity(selectedCottage, guests);

  const estimate = calculateBookingEstimate({
    cottage: selectedCottage,
    checkInDate,
    checkOutDate,
    guests,
  });

  const phoneError = phone.length > 0 && phone.length !== 10 ? "Phone number must be exactly 10 digits." : "";
  const whatsappError =
    whatsappNumber.length > 0 && whatsappNumber.length !== 10
      ? "WhatsApp number must be exactly 10 digits."
      : "";

  const dateError =
    checkInDate && checkOutDate && checkOutDate <= checkInDate
      ? "Check-out date must be after check-in date."
      : "";

  const canSubmit =
    Boolean(cottageSlug) &&
    Boolean(checkInDate) &&
    Boolean(checkOutDate) &&
    phone.length === 10 &&
    !whatsappError &&
    !dateError &&
    !capacityError;

  const inputBase =
    "w-full rounded-xl border border-[#cfc4b3] bg-white px-3 text-sm text-[#2f4c3a] outline-none transition placeholder:text-[#9a8f80] focus:border-[#2f5a3d] focus:ring-2 focus:ring-[#2f5a3d]/10 disabled:bg-[#f1ece3]";

  const inputSize = compact ? "h-10" : "h-11";
  const labelClass = "space-y-1 text-sm text-[#3f4f45]";
  const labelTextClass = "font-medium";

  function updateGuests(key: keyof GuestCounts, nextValue: number, min: number) {
    setGuests((current) => ({
      ...current,
      [key]: Math.max(min, nextValue),
    }));
  }

  return (
    <form
      action={formAction}
      className={`overflow-hidden rounded-[24px] border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm ${
        compact ? "text-sm" : ""
      }`}
    >
      <div className="space-y-3 p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                <span className={labelTextClass}>Full name *</span>
                <input
                  required
                  name="fullName"
                  autoComplete="name"
                  placeholder="Enter guest name"
                  className={`${inputBase} ${inputSize}`}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Phone *</span>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  autoComplete="tel"
                  placeholder="10 digit mobile number"
                  onChange={(event) => setPhone(keepOnlyTenDigits(event.target.value))}
                  aria-invalid={Boolean(phoneError)}
                  className={`${inputBase} ${inputSize}`}
                />
                {phoneError ? <p className="text-xs text-rose-700">{phoneError}</p> : null}
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Optional"
                  className={`${inputBase} ${inputSize}`}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>WhatsApp</span>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={whatsappNumber}
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  autoComplete="tel"
                  placeholder="Optional"
                  onChange={(event) => setWhatsappNumber(keepOnlyTenDigits(event.target.value))}
                  aria-invalid={Boolean(whatsappError)}
                  className={`${inputBase} ${inputSize}`}
                />
                {whatsappError ? <p className="text-xs text-rose-700">{whatsappError}</p> : null}
              </label>
            </div>

            <DateRangePicker
              compact
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onChange={({ checkInDate: nextIn, checkOutDate: nextOut }) => {
                setCheckInDate(nextIn ?? "");
                setCheckOutDate(nextOut ?? "");
              }}
            />

            <div className="hidden">
              <input
                required
                type="date"
                name="checkInDate"
                value={checkInDate}
                onChange={(event) => setCheckInDate(event.target.value)}
              />
              <input
                required
                type="date"
                name="checkOutDate"
                value={checkOutDate}
                min={getMinCheckoutDate(checkInDate)}
                onChange={(event) => setCheckOutDate(event.target.value)}
              />

              {/* Hidden fallback only. The country field is removed from the visible booking form. */}
              <input type="hidden" name="country" value="India" />

              <input type="hidden" name="totalGuests" value={totalGuests} readOnly />
            </div>

            {dateError ? <p className="text-sm text-rose-700">{dateError}</p> : null}

            <label className={labelClass}>
              <span className={labelTextClass}>Special requests</span>
              <textarea
                name="specialRequests"
                rows={compact ? 2 : 3}
                placeholder="Food preference, arrival time, special requirement..."
                className={`${inputBase} min-h-[72px] py-2.5`}
              />
            </label>
          </div>

          <div className="space-y-3">
            <label className={labelClass}>
              <span className={labelTextClass}>Cottage *</span>
              <select
                required
                name="cottageSlug"
                value={cottageSlug}
                disabled={cottageLocked}
                onChange={(event) => setCottageSlug(event.target.value)}
                className={`${inputBase} ${inputSize}`}
              >
                <option value="">Select cottage</option>
                {cottages.map((cottage) => (
                  <option key={cottage.id} value={cottage.slug}>
                    {cottage.name}
                  </option>
                ))}
              </select>
              {cottageLocked ? <input type="hidden" name="cottageSlug" value={cottageSlug} /> : null}
            </label>

            <div className="rounded-2xl border border-[#d8cebf] bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7b71]">
                    Guests
                  </p>
                  <p className="text-xs text-[#78867c]">
                    {guests.adults} adult{guests.adults > 1 ? "s" : ""} + {guests.children} child
                    {guests.children !== 1 ? "ren" : ""} + {guests.infants} infant
                    {guests.infants !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="rounded-full bg-[#edf3ee] px-3 py-1 text-xs font-semibold text-[#2f5a3d]">
                  Total: {totalGuests}
                </div>
              </div>

              <div className="grid gap-2">
                {([
                  ["Adults", "adults", 1],
                  ["Children", "children", 0],
                  ["Infants", "infants", 0],
                ] as const).map(([label, key, min]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-[#eee5d8] bg-[#fffdfa] px-3 py-2"
                  >
                    <span className="text-sm font-medium text-[#314d3b]">{label}</span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateGuests(key, guests[key] - 1, min)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7cbb9] bg-white text-[#2f513c] transition hover:bg-[#f2ecdf]"
                        aria-label={`Decrease ${label}`}
                      >
                        -
                      </button>

                      <span className="min-w-6 text-center text-sm font-bold text-[#234734]">
                        {guests[key]}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateGuests(key, guests[key] + 1, min)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d7cbb9] bg-white text-[#2f513c] transition hover:bg-[#f2ecdf]"
                        aria-label={`Increase ${label}`}
                      >
                        +
                      </button>
                    </div>

                    <input type="hidden" name={key} value={guests[key]} readOnly />
                  </div>
                ))}
              </div>
            </div>

            {selectedCottage ? (
              <div className="rounded-2xl border border-[#e5dccf] bg-white p-3 text-xs text-[#54635a]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#284735]">Pricing estimate</p>
                    <p className="mt-1">
                      Weekday: {formatCurrency(selectedCottage.weekday_price)}
                    </p>
                    <p>Weekend: {formatCurrency(selectedCottage.weekend_price)}</p>
                  </div>

                  {estimate ? (
                    <div className="rounded-xl bg-[#2f5a3d] px-3 py-2 text-right text-white">
                      <p className="text-[10px] uppercase tracking-wide opacity-80">Estimated</p>
                      <p className="text-sm font-bold">{formatCurrency(estimate.totalAmount)}</p>
                    </div>
                  ) : null}
                </div>

                {estimate ? (
                  <div className="mt-2 space-y-1">
                    <p>
                      {estimate.nights} night{estimate.nights > 1 ? "s" : ""} (
                      {estimate.weekdayNights} weekday + {estimate.weekendNights} weekend)
                    </p>

                    {estimate.childAmount > 0 ? (
                      <p>Child charges: {formatCurrency(estimate.childAmount)}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2">Select valid dates to view estimate.</p>
                )}

                {selectedCottage.breakfast_included ? (
                  <p className="mt-2 font-medium text-[#385942]">
                    Complimentary breakfast included.
                  </p>
                ) : null}

                {selectedCottage.pricing_note ? (
                  <p className="mt-1">{selectedCottage.pricing_note}</p>
                ) : null}
              </div>
            ) : null}

            {capacityError ? <p className="text-sm text-rose-700">{capacityError}</p> : null}

            {state.message ? (
              <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? "bg-[#e8f3eb] text-[#2f663f]" : "bg-rose-50 text-rose-700"}`}>
                {state.message}
                {state.bookingCode ? ` Ref: ${state.bookingCode}` : ""}
                {state.estimatedTotal ? ` Estimated: ${formatCurrency(state.estimatedTotal)}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-[#e1d7c8] bg-[#fdfbf7]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:grid sm:grid-cols-[0.9fr_1.1fr] sm:gap-2 sm:p-4">
  {onCancel ? (
    <button
      type="button"
      onClick={onCancel}
      className="hidden h-11 rounded-xl border border-[#cfc4b3] bg-white px-4 text-sm font-semibold text-[#2f513c] shadow-sm transition hover:bg-[#f2ecdf] sm:block"
    >
      Cancel
    </button>
  ) : null}

  <button
    type="submit"
    disabled={pending || !canSubmit}
    className="h-12 w-full rounded-2xl bg-[#e17b22] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,123,34,0.35)] transition hover:bg-[#c96718] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:rounded-xl"
  >
    {pending ? "Submitting..." : "Book Now"}
  </button>
</div>
    </form>
  );
}