"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";
import { BOOKING_SOURCE_OPTIONS } from "@/features/admin/bookings/constants";

type CottageOption = {
  id: string;
  name: string;
  code: string;
  slug: string;
  max_adults: number;
  max_children: number;
  max_infants: number;
  max_total_guests: number;
};
type CustomerOption = { id: string; full_name: string; phone: string; source: string };

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export function ManualBookingForm({ cottages, customers, propertyId }: { cottages: CottageOption[]; customers: CustomerOption[]; propertyId: string }) {
  const [cottageId, setCottageId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [availabilityError, setAvailabilityError] = useState("");
  const [customerId, setCustomerId] = useState("");

  const selectedCottage = useMemo(() => cottages.find((item) => item.id === cottageId), [cottages, cottageId]);
  const selectedCustomer = useMemo(() => customers.find((item) => item.id === customerId), [customerId, customers]);
  const maxGuests = selectedCottage?.max_total_guests ?? 0;
  const maxAdults = selectedCottage?.max_adults ?? 0;
  const maxChildren = selectedCottage?.max_children ?? 0;
  const maxInfants = selectedCottage?.max_infants ?? 0;
  const totalGuests = adults + children + infants;
  const maxReached = maxGuests > 0 && totalGuests >= maxGuests;
  const bookingSource = selectedCustomer?.source || "phone";

  function updateGuests(key: "adults" | "children" | "infants", value: number) {
    const next = { adults, children, infants, [key]: Math.max(key === "adults" ? 1 : 0, value) };
    if (maxAdults > 0 && next.adults > maxAdults) return;
    if (maxChildren >= 0 && next.children > maxChildren) return;
    if (maxInfants >= 0 && next.infants > maxInfants) return;
    if (maxGuests > 0 && next.adults + next.children + next.infants > maxGuests) return;
    setAdults(next.adults);
    setChildren(next.children);
    setInfants(next.infants);
  }

  return (
    <>
      <input type="hidden" name="property_id" value={propertyId} />
      <label className="text-sm text-[#32483a]">Customer *
        <select name="customer_id" className={inputClass} required value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
          <option value="">Select customer</option>
          {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name} ({customer.phone})</option>)}
        </select>
        <p className="mt-1 text-xs text-[#67776b]">Choose an existing guest profile before creating the booking.</p>
      </label>

      <label className="text-sm text-[#32483a]">Cottage *
        <select name="cottage_id" className={inputClass} required value={cottageId} onChange={(event) => { setCottageId(event.target.value); setCheckInDate(""); setCheckOutDate(""); setAvailabilityError(""); }}>
          <option value="">Select cottage</option>
          {cottages.map((cottage) => <option key={cottage.id} value={cottage.id}>{cottage.name} ({cottage.code})</option>)}
        </select>
        <p className="mt-1 text-xs text-[#67776b]">Select cottage first. Date availability loads based on this cottage.</p>
      </label>

      <label className="text-sm text-[#32483a]">Booking Source
        <select className={inputClass} value={bookingSource} disabled>
          {BOOKING_SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input type="hidden" name="source" value={bookingSource} />
      </label>

      <div className="sm:col-span-3">
        <DateRangePicker compact cottageSlug={selectedCottage?.slug} checkInDate={checkInDate} checkOutDate={checkOutDate} onChange={({ checkInDate: nextIn, checkOutDate: nextOut }) => { setCheckInDate(nextIn ?? ""); setCheckOutDate(nextOut ?? ""); }} onAvailabilityStateChange={(state) => setAvailabilityError(state.error || state.rangeError)} />
        <input type="hidden" name="check_in_date" value={checkInDate} />
        <input type="hidden" name="check_out_date" value={checkOutDate} />
        {availabilityError ? <p className="mt-1 text-sm text-rose-700">{availabilityError}</p> : null}
      </div>

      <div className="sm:col-span-3 rounded-xl border border-[#ddd4c6] bg-[#fcfaf6] p-3"><p className="text-sm font-semibold text-[#32483a]">Guest Count</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">{([ ["Adults", adults, "adults"], ["Children", children, "children"], ["Infants", infants, "infants"] ] as const).map(([label, value, key]) => {
          const maxForKey = key === "adults" ? maxAdults : key === "children" ? maxChildren : maxInfants;
          const increaseDisabled = maxReached || (maxForKey >= 0 && value >= maxForKey);
          return <div key={key} className="rounded-lg border border-[#e4dbc9] bg-white p-2"><p className="text-xs text-[#56685b]">{label}</p><div className="mt-1 flex items-center gap-2"><button type="button" className="h-7 w-7 rounded-full border disabled:opacity-50" onClick={() => updateGuests(key, value - 1)} disabled={value <= (key === "adults" ? 1 : 0)}>-</button><span className="min-w-5 text-center text-sm font-semibold">{value}</span><button type="button" className="h-7 w-7 rounded-full border disabled:opacity-50" onClick={() => updateGuests(key, value + 1)} disabled={increaseDisabled}>+</button></div><input type="hidden" name={key} value={value} readOnly /></div>;
        })}</div>
        {maxGuests > 0 ? <p className="mt-2 text-xs text-[#67776b]">Total guests: {totalGuests} / {maxGuests} · Adults max {maxAdults}, Children max {maxChildren}, Infants max {maxInfants}</p> : null}
      </div>

      <label className="text-sm text-[#32483a]">Booking Status *
        <select name="status" className={inputClass} defaultValue="confirmed" required><option value="confirmed">Confirmed</option><option value="advance_paid">Advance Paid</option></select>
      </label>
      <label className="text-sm text-[#32483a] sm:col-span-2">Guest Special Requests<input name="special_requests" className={inputClass} maxLength={500} placeholder="Example: Need extra mattress, arrive after 8 PM" /></label>
      <label className="text-sm text-[#32483a]">Internal Staff Notes<input name="internal_notes" className={inputClass} maxLength={500} placeholder="Only visible to admin staff" /></label>
      <button type="submit" className="sm:col-span-3 rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Create Manual Booking</button>
    </>
  );
}
