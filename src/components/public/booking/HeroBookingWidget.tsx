"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";
import { DEFAULT_GUESTS, validateGuestCapacity } from "@/lib/booking";
import type { PublicCottage } from "@/lib/public-site";
import { useBookingFlow } from "./BookingFlowProvider";

export function HeroBookingWidget({ cottages }: { cottages: PublicCottage[] }) {
  const { openBooking } = useBookingFlow();
  const [cottageSlug, setCottageSlug] = useState(cottages[0]?.slug ?? "");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(DEFAULT_GUESTS.adults);
  const [children, setChildren] = useState(DEFAULT_GUESTS.children);
  const [infants, setInfants] = useState(DEFAULT_GUESTS.infants);

  const selected = useMemo(
    () => cottages.find((item) => item.slug === cottageSlug),
    [cottages, cottageSlug],
  );

  const totalGuests = adults + children + infants;
  const maxReached =
    Boolean(selected) && totalGuests >= (selected?.max_total_guests ?? 0);
  const guestError = validateGuestCapacity(selected, { adults, children, infants });

  function updateGuests(key: "adults" | "children" | "infants", nextValue: number, min: number) {
    const next = {
      adults,
      children,
      infants,
      [key]: Math.max(min, nextValue),
    };

    if (selected && validateGuestCapacity(selected, next)) {
      return;
    }

    setAdults(next.adults);
    setChildren(next.children);
    setInfants(next.infants);
  }

  return (
    <aside className="w-full rounded-[24px] border border-[#d8cebf] bg-[#fbf7f1]/95 p-4 text-[#264330] shadow-[0_18px_42px_rgba(22,31,24,0.16)] backdrop-blur-xl sm:p-5 lg:max-w-[400px]">
      <div className="mb-4 border-b border-[#e3dacc] pb-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#6a7c70]">
          Booking request
        </p>
        <h2 className="mt-1 font-serif text-[1.5rem] leading-tight text-[#1f3b2b] sm:text-[1.6rem]">
          Check dates & cottages
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-[#67776d]">
          Choose your stay dates and cottage to send a booking request.
        </p>
      </div>

      <div className="space-y-3.5">
        <label className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#66766b]">
            Cottage
          </span>
          <select
            value={cottageSlug}
            onChange={(event) => {
              setCottageSlug(event.target.value);
              setCheckInDate("");
              setCheckOutDate("");
            }}
            className="h-11 w-full rounded-2xl border border-[#d7ccb9] bg-white px-3 text-sm text-[#274330] outline-none transition focus:border-[#3d6545] focus:ring-2 focus:ring-[#2f5a3d]/10"
          >
            {cottages.map((cottage) => (
              <option key={cottage.id} value={cottage.slug}>
                {cottage.name}
              </option>
            ))}
          </select>
        </label>

        <DateRangePicker
          compact
          cottageSlug={cottageSlug}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onChange={({ checkInDate: nextIn, checkOutDate: nextOut }) => {
            setCheckInDate(nextIn ?? "");
            setCheckOutDate(nextOut ?? "");
          }}
        />

        <div className="rounded-2xl border border-[#ddd2c2] bg-white/90 p-3">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6a7a70]">
              Guests
            </span>
            <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 text-[11px] font-semibold text-[#2f5a3d]">
              Total {totalGuests}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([
              ["Adults", adults, "adults", 1],
              ["Children", children, "children", 0],
              ["Infants", infants, "infants", 0],
            ] as const).map(([label, value, key, min]) => (
              <div
                key={label}
                className="rounded-xl border border-[#e8dece] bg-[#fffdfa] px-2 py-2.5 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#748279]">
                  {label}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd1c0] text-[#264330]"
                    onClick={() => updateGuests(key, value - 1, min)}
                    aria-label={`Decrease ${label}`}
                  >
                    -
                  </button>
                  <span className="min-w-[16px] text-sm font-semibold text-[#234736]">{value}</span>
                  <button
                    type="button"
                    disabled={maxReached}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd1c0] text-[#264330] disabled:cursor-not-allowed disabled:border-[#e7ddd0] disabled:bg-[#f4eee4] disabled:text-[#b09f8f]"
                    onClick={() => updateGuests(key, value + 1, min)}
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {guestError ? (
          <p className="text-xs text-rose-700">
            This cottage allows a maximum of {selected?.max_total_guests ?? 0} occupants.
          </p>
        ) : null}

        <button
          type="button"
          disabled={Boolean(guestError)}
          onClick={() =>
            openBooking(
              { cottageSlug, checkInDate, checkOutDate, adults, children, infants },
              { lockCottage: true },
            )
          }
          className="h-11 w-full rounded-2xl bg-[#e17b22] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,123,34,0.34)] transition hover:bg-[#c96718] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Book Now
        </button>

        <div className="space-y-1 text-center">
          <p className="text-[11px] text-[#7a857d]">Pre-booking required</p>
          {selected ? (
            <p className="text-xs text-[#607267]">
              Starting from ₹{selected.weekday_price.toLocaleString("en-IN")} per weekday night.
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
