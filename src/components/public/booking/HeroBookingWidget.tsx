//src\components\public\booking\HeroBookingWidget.tsx
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

  const selected = useMemo(() => cottages.find((item) => item.slug === cottageSlug), [cottages, cottageSlug]);

  const totalGuests = adults + children + infants;
  const maxReached = Boolean(selected) && totalGuests >= (selected?.max_total_guests ?? 0);
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
    <aside className="w-full rounded-[26px] border border-[#ddd2c2] bg-[#fbf7f1]/95 p-4 text-[#264330] shadow-[0_18px_50px_rgba(22,31,24,0.18)] backdrop-blur-xl sm:p-5 lg:max-w-[400px]">
      <div className="mb-4">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#6e7d72]">
          Booking request
        </p>
        <h2 className="mt-1 font-serif text-[1.65rem] leading-tight text-[#203d2d]">
          Check dates & cottages
        </h2>
      </div>

      <div className="space-y-3.5">
        <label className="space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6f7d73]">
            Cottage Type
          </span>
          <select
            value={cottageSlug}
            onChange={(event) => {
              setCottageSlug(event.target.value);
              setCheckInDate("");
              setCheckOutDate("");
            }}
            className="h-12 w-full rounded-2xl border border-[#d7ccb9] bg-white px-3 text-sm text-[#274330] outline-none transition focus:border-[#3d6545]"
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

        <label className="space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6f7d73]">
            Guests
          </span>
          <div className="flex h-12 items-center justify-between rounded-2xl border border-[#d7ccb9] bg-white px-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd1c0] text-[#254432]"
              onClick={() => updateGuests("adults", adults - 1, 1)}
            >
              -
            </button>
            <span className="text-sm font-semibold text-[#254432]">
              {totalGuests} guest{totalGuests > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              disabled={maxReached}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd1c0] text-[#254432] disabled:cursor-not-allowed disabled:border-[#e7ddd0] disabled:bg-[#f4eee4] disabled:text-[#b09f8f]"
              onClick={() => updateGuests("adults", adults + 1, 1)}
            >
              +
            </button>
          </div>
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          {([
            ["Adults", adults, "adults", 1],
            ["Children", children, "children", 0],
            ["Infants", infants, "infants", 0],
          ] as const).map(([label, value, key, min]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#ddd2c2] bg-white px-2 py-3 text-center shadow-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#76847a]">
                {label}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd1c0] text-[#264330]"
                  onClick={() => updateGuests(key, value - 1, min)}
                >
                  -
                </button>
                <span className="min-w-[18px] text-sm font-semibold text-[#234736]">{value}</span>
                <button
                  type="button"
                  disabled={maxReached}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd1c0] text-[#264330] disabled:cursor-not-allowed disabled:border-[#e7ddd0] disabled:bg-[#f4eee4] disabled:text-[#b09f8f]"
                  onClick={() => updateGuests(key, value + 1, min)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {guestError ? <p className="text-xs text-rose-700">This cottage allows a maximum of {selected?.max_total_guests ?? 0} occupants.</p> : null}

        <button
          type="button"
          disabled={Boolean(guestError)}
          onClick={() =>
            openBooking(
              { cottageSlug, checkInDate, checkOutDate, adults, children, infants },
              { lockCottage: true },
            )
          }
          className="h-12 w-full rounded-2xl bg-[#2f5a3d] px-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#264f35] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send Booking Request
        </button>

        <p className="text-center text-[11px] text-[#7a857d]">Pre-booking required</p>

        {selected ? (
          <p className="text-center text-xs text-[#607267]">
            Starting from ₹{selected.weekday_price.toLocaleString("en-IN")} per weekday night.
          </p>
        ) : null}
      </div>
    </aside>
  );
}
