//src\components\public\booking\HeroBookingWidget.tsx
"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";
import { DEFAULT_GUESTS, validateGuestCapacity } from "@/lib/booking";
import type { PublicCottage } from "@/lib/public-site";
import { useBookingFlow } from "./BookingFlowProvider";

type GuestKey = "adults" | "children" | "infants";

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

  const maxOccupants =
    typeof selected?.max_total_guests === "number" && selected.max_total_guests > 0
      ? selected.max_total_guests
      : null;

  const maxReached = Boolean(maxOccupants && totalGuests >= maxOccupants);

  const guestError = validateGuestCapacity(selected, {
    adults,
    children,
    infants,
  });

  function updateGuests(key: GuestKey, nextValue: number, min: number) {
    const nextGuests = {
      adults,
      children,
      infants,
      [key]: Math.max(min, nextValue),
    };

    if (selected && validateGuestCapacity(selected, nextGuests)) {
      return;
    }

    setAdults(nextGuests.adults);
    setChildren(nextGuests.children);
    setInfants(nextGuests.infants);
  }

  const guestItems: {
    label: string;
    helper: string;
    key: GuestKey;
    value: number;
    min: number;
  }[] = [
    {
      label: "Adults",
      helper: "Age 12+",
      key: "adults",
      value: adults,
      min: 1,
    },
    {
      label: "Children",
      helper: "Age 2-11",
      key: "children",
      value: children,
      min: 0,
    },
    {
      label: "Infants",
      helper: "Below 2",
      key: "infants",
      value: infants,
      min: 0,
    },
  ];

  return (
    <aside className="w-full overflow-visible rounded-[30px] border border-[#ded3c3] bg-[#fbf7ef]/95 p-3 text-[#264330] shadow-[0_18px_48px_rgba(22,31,24,0.20)] backdrop-blur-xl sm:p-4 lg:max-w-[410px]">
      <div className="rounded-[24px] border border-[#eadfce] bg-gradient-to-br from-[#fffaf0] via-[#fbf7ef] to-[#eef4ec] p-4 shadow-sm">
        <div className="mb-4">
          <div className="inline-flex rounded-full border border-[#d8cdbd] bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6e7d72] shadow-sm">
            Booking request
          </div>

          <h2 className="mt-3 font-serif text-[1.55rem] leading-tight text-[#203d2d] sm:text-[1.75rem]">
            Check dates & cottages
          </h2>

          <p className="mt-1.5 text-xs leading-5 text-[#657568] sm:text-sm">
            Choose your stay dates and cottage to send a quick booking request.
          </p>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f7d73]">
              Cottage Type
            </span>

            <select
              value={cottageSlug}
              onChange={(event) => {
                setCottageSlug(event.target.value);
                setCheckInDate("");
                setCheckOutDate("");
              }}
              className="h-11 w-full rounded-2xl border border-[#d7ccb9] bg-white px-3 text-sm font-medium text-[#274330] shadow-sm outline-none transition focus:border-[#3d6545] focus:ring-2 focus:ring-[#2f5a3d]/10"
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

          <div className="rounded-2xl border border-[#ddd2c2] bg-white p-2.5 shadow-sm">
  <div className="mb-2 flex items-center justify-between gap-2">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f7d73]">
        Guests
      </p>
      <p className="text-[11px] text-[#728176]">
        {totalGuests} guest{totalGuests > 1 ? "s" : ""}
        {maxOccupants ? ` / max ${maxOccupants}` : ""}
      </p>
    </div>

    <span className="rounded-full bg-[#edf3ee] px-2.5 py-1 text-[11px] font-bold text-[#2f5a3d]">
      Total {totalGuests}
    </span>
  </div>

  <div className="grid grid-cols-3 gap-1.5">
    {guestItems.map((item) => {
      const decreaseDisabled = item.value <= item.min;

      return (
        <div
          key={item.key}
          className="rounded-xl border border-[#efe5d8] bg-[#fffdf8] px-1.5 py-2 text-center"
        >
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.06em] text-[#617268]">
            {item.label}
          </p>

          <p className="mt-0.5 hidden text-[9px] text-[#8a958d] sm:block">
            {item.helper}
          </p>

          <div className="mt-1.5 flex items-center justify-center gap-1">
            <button
              type="button"
              disabled={decreaseDisabled}
              onClick={() =>
                updateGuests(item.key, item.value - 1, item.min)
              }
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#ddd1c0] bg-white text-xs font-bold text-[#264330] transition hover:bg-[#f2ecdf] disabled:cursor-not-allowed disabled:border-[#eadfce] disabled:bg-[#f6efe5] disabled:text-[#b09f8f]"
              aria-label={`Decrease ${item.label}`}
            >
              -
            </button>

            <span className="min-w-4 text-center text-sm font-bold text-[#234736]">
              {item.value}
            </span>

            <button
              type="button"
              disabled={maxReached}
              onClick={() =>
                updateGuests(item.key, item.value + 1, item.min)
              }
              className="flex h-6 w-6 items-center justify-center rounded-full border border-[#ddd1c0] bg-white text-xs font-bold text-[#264330] transition hover:bg-[#f2ecdf] disabled:cursor-not-allowed disabled:border-[#eadfce] disabled:bg-[#f6efe5] disabled:text-[#b09f8f]"
              aria-label={`Increase ${item.label}`}
            >
              +
            </button>
          </div>
        </div>
      );
    })}
  </div>

  {guestError ? (
    <p className="mt-2 rounded-xl bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700">
      This cottage allows a maximum of {maxOccupants ?? 0} occupants.
    </p>
  ) : null}
</div>

          {selected ? (
            <div className="rounded-2xl border border-[#e3d8c8] bg-[#fffdf8] px-3 py-2.5 text-xs text-[#5f6f64]">
              <div className="flex items-center justify-between gap-3">
                <span>Starting from</span>
                <span className="font-bold text-[#244631]">
                  ₹{selected.weekday_price.toLocaleString("en-IN")} / weekday night
                </span>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled={Boolean(guestError) || !cottageSlug}
            onClick={() =>
              openBooking(
                {
                  cottageSlug,
                  checkInDate,
                  checkOutDate,
                  adults,
                  children,
                  infants,
                },
                { lockCottage: true },
              )
            }
            className="h-12 w-full rounded-2xl bg-[#e17b22] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,123,34,0.35)] transition hover:bg-[#c96718] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send Booking Request
          </button>

          <p className="text-center text-[11px] font-medium text-[#7a857d]">
            Pre-booking required. Our team will confirm availability.
          </p>
        </div>
      </div>
    </aside>
  );
}