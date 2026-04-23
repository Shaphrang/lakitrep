"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";
import { DEFAULT_GUESTS, getMinCheckoutDate } from "@/lib/booking";
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

  return (
    <aside className="w-full rounded-2xl border border-[#ded4c5] bg-[#fdfbf7]/95 p-4 text-[#264330] shadow-lg backdrop-blur sm:p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#6d7e73]">Book your stay</p>
      <h2 className="mt-1 font-serif text-2xl">Check dates & cottages</h2>

      <div className="mt-3 space-y-3">
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
          <input type="date" value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} />
          <input type="date" value={checkOutDate} min={getMinCheckoutDate(checkInDate)} onChange={(event) => setCheckOutDate(event.target.value)} />
        </div>

        <select value={cottageSlug} onChange={(event) => setCottageSlug(event.target.value)} className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5 text-sm">
          {cottages.map((cottage) => (
            <option key={cottage.id} value={cottage.slug}>
              {cottage.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {([
            ["Adults", adults, setAdults, 1],
            ["Children", children, setChildren, 0],
            ["Infants", infants, setInfants, 0],
          ] as const).map(([label, value, setter, min]) => (
            <div key={label} className="rounded-xl border border-[#d8cebf] bg-white px-2 py-2.5 text-center">
              <p className="text-[#6a7b70]">{label}</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <button type="button" className="h-6 w-6 rounded-full border border-[#d5cab8]" onClick={() => setter(Math.max(min, value - 1))}>-</button>
                <span className="font-semibold text-[#234736]">{value}</span>
                <button type="button" className="h-6 w-6 rounded-full border border-[#d5cab8]" onClick={() => setter(value + 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openBooking({ cottageSlug, checkInDate, checkOutDate, adults, children, infants }, { lockCottage: true })}
          className="w-full rounded-xl bg-[#2f5a3d] px-4 py-3 text-sm font-semibold text-white"
        >
          Continue booking
        </button>

        {selected ? <p className="text-xs text-[#607267]">Starting from ₹{selected.weekday_price.toLocaleString("en-IN")} per weekday night.</p> : null}
      </div>
    </aside>
  );
}
