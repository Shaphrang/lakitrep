"use client";

import { useActionState, useMemo, useState } from "react";
import { submitBookingRequest, type BookingFormState } from "@/actions/public/bookings";
import { calculateBookingEstimate, DEFAULT_GUESTS, formatCurrency, getMinCheckoutDate, validateGuestCapacity, type GuestCounts } from "@/lib/booking";
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
};

export function BookingRequestForm({ cottages, initialValues, cottageLocked = false, compact = false }: BookingRequestFormProps) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, initialState);
  const [cottageSlug, setCottageSlug] = useState(initialValues?.cottageSlug ?? "");
  const [checkInDate, setCheckInDate] = useState(initialValues?.checkInDate ?? "");
  const [checkOutDate, setCheckOutDate] = useState(initialValues?.checkOutDate ?? "");
  const [guests, setGuests] = useState<GuestCounts>({
    adults: initialValues?.adults ?? DEFAULT_GUESTS.adults,
    children: initialValues?.children ?? DEFAULT_GUESTS.children,
    infants: initialValues?.infants ?? DEFAULT_GUESTS.infants,
  });

  const selectedCottage = useMemo(
    () => cottages.find((cottage) => cottage.slug === cottageSlug),
    [cottages, cottageSlug],
  );

  const capacityError = validateGuestCapacity(selectedCottage, guests);
  const estimate = calculateBookingEstimate({
    cottage: selectedCottage,
    checkInDate,
    checkOutDate,
    guests,
  });

  const inputBase = "w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5 text-sm text-[#2f4c3a]";

  return (
    <form action={formAction} className={`space-y-4 rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 shadow-sm sm:p-6 ${compact ? "text-sm" : ""}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Full name *</span>
          <input required name="fullName" className={inputBase} />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Phone *</span>
          <input required name="phone" className={inputBase} />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Email</span>
          <input type="email" name="email" className={inputBase} />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">WhatsApp</span>
          <input name="whatsappNumber" className={inputBase} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Cottage *</span>
          <select
            required
            name="cottageSlug"
            value={cottageSlug}
            disabled={cottageLocked}
            onChange={(event) => setCottageSlug(event.target.value)}
            className={`${inputBase} disabled:bg-[#f1ece3]`}
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

        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Country</span>
          <input name="country" defaultValue="India" className={inputBase} />
        </label>
      </div>

      <DateRangePicker
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onChange={({ checkInDate: nextIn, checkOutDate: nextOut }) => {
          setCheckInDate(nextIn ?? "");
          setCheckOutDate(nextOut ?? "");
        }}
      />

      <div className="hidden">
        <input required type="date" name="checkInDate" value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} />
        <input
          required
          type="date"
          name="checkOutDate"
          value={checkOutDate}
          min={getMinCheckoutDate(checkInDate)}
          onChange={(event) => setCheckOutDate(event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["Adults", "adults", 1],
          ["Children", "children", 0],
          ["Infants", "infants", 0],
        ] as const).map(([label, key, min]) => (
          <div key={key} className="rounded-xl border border-[#d8cebf] bg-white p-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6b7b71]">{label}</p>
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setGuests((value) => ({ ...value, [key]: Math.max(min, value[key] - 1) }))}
                className="h-8 w-8 rounded-full border border-[#d7cbb9] text-[#2f513c]"
              >
                -
              </button>
              <span className="text-sm font-semibold text-[#234734]">{guests[key]}</span>
              <button
                type="button"
                onClick={() => setGuests((value) => ({ ...value, [key]: value[key] + 1 }))}
                className="h-8 w-8 rounded-full border border-[#d7cbb9] text-[#2f513c]"
              >
                +
              </button>
            </div>
            <input type="hidden" name={key} value={guests[key]} readOnly />
          </div>
        ))}
      </div>

      {selectedCottage ? (
        <div className="rounded-xl border border-[#e5dccf] bg-white p-3 text-xs text-[#54635a]">
          <p className="font-semibold text-[#284735]">Pricing estimate</p>
          <p className="mt-1">Weekday: {formatCurrency(selectedCottage.weekday_price)} • Weekend: {formatCurrency(selectedCottage.weekend_price)}</p>
          {estimate ? (
            <div className="mt-2 space-y-1">
              <p>{estimate.nights} nights ({estimate.weekdayNights} weekday + {estimate.weekendNights} weekend)</p>
              {estimate.childAmount > 0 ? <p>Child charges: {formatCurrency(estimate.childAmount)}</p> : null}
              <p className="font-semibold text-[#224332]">Estimated total: {formatCurrency(estimate.totalAmount)}</p>
            </div>
          ) : (
            <p className="mt-2">Select valid dates to view estimate.</p>
          )}
          {selectedCottage.breakfast_included ? <p className="mt-2 text-[#385942]">Complimentary breakfast included.</p> : null}
          {selectedCottage.pricing_note ? <p className="mt-1">{selectedCottage.pricing_note}</p> : null}
        </div>
      ) : null}

      {capacityError ? <p className="text-sm text-rose-700">{capacityError}</p> : null}

      <label className="space-y-1 text-sm text-[#3f4f45]">
        <span className="font-medium">Special requests</span>
        <textarea name="specialRequests" rows={3} className={inputBase} />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.success ? "text-[#2f663f]" : "text-rose-700"}`}>
          {state.message} {state.bookingCode ? `Ref: ${state.bookingCode}` : ""} {state.estimatedTotal ? `Estimated: ${formatCurrency(state.estimatedTotal)}` : ""}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || Boolean(capacityError)}
        className="w-full rounded-xl bg-[#2f5a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264f35] disabled:opacity-70"
      >
        {pending ? "Submitting..." : "Submit booking request"}
      </button>
    </form>
  );
}
