"use client";

import { useMemo, useState } from "react";
import { DateRangePicker } from "@/components/public/booking/DateRangePicker";

type CottageOption = { id: string; name: string; code: string; slug: string; max_total_guests: number };
type CustomerOption = { id: string; full_name: string; phone: string };

const inputClass = "mt-1 w-full rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export function ManualBookingForm({ cottages, customers, propertyId }: { cottages: CottageOption[]; customers: CustomerOption[]; propertyId: string }) {
  const [cottageId, setCottageId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [availabilityError, setAvailabilityError] = useState("");

  const selectedCottage = useMemo(() => cottages.find((item) => item.id === cottageId), [cottages, cottageId]);
  const maxGuests = selectedCottage?.max_total_guests ?? 0;
  const totalGuests = adults + children + infants;
  const maxReached = maxGuests > 0 && totalGuests >= maxGuests;

  function updateGuests(key: "adults" | "children" | "infants", value: number) {
    const next = { adults, children, infants, [key]: Math.max(key === "adults" ? 1 : 0, value) };
    if (maxGuests > 0 && next.adults + next.children + next.infants > maxGuests) return;
    setAdults(next.adults);
    setChildren(next.children);
    setInfants(next.infants);
  }

  return (
    <>
      <input type="hidden" name="property_id" value={propertyId} />
      <label className="text-sm text-[#32483a]">Customer *
        <select name="customer_id" className={inputClass} required>
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
        <select name="source" className={inputClass} defaultValue="phone">
          <option value="website">Website</option><option value="phone">Phone Call</option><option value="whatsapp">WhatsApp</option><option value="walk_in">Walk-in</option><option value="instagram">Instagram</option><option value="agent">Agent</option><option value="repeat_guest">Repeat Guest</option><option value="other">Other</option>
        </select>
      </label>

      <div className="sm:col-span-3">
        <DateRangePicker compact cottageSlug={selectedCottage?.slug} checkInDate={checkInDate} checkOutDate={checkOutDate} onChange={({ checkInDate: nextIn, checkOutDate: nextOut }) => { setCheckInDate(nextIn ?? ""); setCheckOutDate(nextOut ?? ""); }} onAvailabilityStateChange={(state) => setAvailabilityError(state.error || state.rangeError)} />
        <input type="hidden" name="check_in_date" value={checkInDate} />
        <input type="hidden" name="check_out_date" value={checkOutDate} />
        {availabilityError ? <p className="mt-1 text-sm text-rose-700">{availabilityError}</p> : null}
      </div>

      <div className="sm:col-span-3 rounded-xl border border-[#ddd4c6] bg-[#fcfaf6] p-3"><p className="text-sm font-semibold text-[#32483a]">Guest Count</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">{([ ["Adults", adults, "adults"], ["Children", children, "children"], ["Infants", infants, "infants"] ] as const).map(([label, value, key]) => <div key={key} className="rounded-lg border border-[#e4dbc9] bg-white p-2"><p className="text-xs text-[#56685b]">{label}</p><div className="mt-1 flex items-center gap-2"><button type="button" className="h-7 w-7 rounded-full border disabled:opacity-50" onClick={() => updateGuests(key, value - 1)} disabled={value <= (key === "adults" ? 1 : 0)}>-</button><span className="min-w-5 text-center text-sm font-semibold">{value}</span><button type="button" className="h-7 w-7 rounded-full border disabled:opacity-50" onClick={() => updateGuests(key, value + 1)} disabled={maxReached}>+</button></div><input type="hidden" name={key} value={value} readOnly /></div>)}</div>
        {maxGuests > 0 ? <p className="mt-2 text-xs text-[#67776b]">Total guests: {totalGuests} / {maxGuests}</p> : null}
      </div>

      <label className="text-sm text-[#32483a]">Booking Status *
        <select name="status" className={inputClass} defaultValue="confirmed" required><option value="confirmed">Confirmed</option><option value="advance_paid">Advance Paid</option><option value="contacted">Contacted</option><option value="new_request">New Request</option></select>
      </label>
      <label className="text-sm text-[#32483a]">Discount Amount<input name="discount_amount" type="number" min={0} step="0.01" defaultValue={0} className={inputClass} placeholder="Enter discount amount" /></label>
      <label className="text-sm text-[#32483a]">Advance Payment<input name="advance_amount" type="number" min={0} step="0.01" defaultValue={0} className={inputClass} placeholder="Enter advance collected" /></label>
      <label className="text-sm text-[#32483a]">Payment Mode<select name="payment_mode" className={inputClass} defaultValue="cash"><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank Transfer</option><option value="other">Other</option></select></label>
      <label className="text-sm text-[#32483a]">Payment Reference Number<input name="reference_number" className={inputClass} placeholder="Optional transaction/reference number" /></label>
      <label className="text-sm text-[#32483a] sm:col-span-2">Guest Special Requests<input name="special_requests" className={inputClass} maxLength={500} placeholder="Example: Need extra mattress, arrive after 8 PM" /></label>
      <label className="text-sm text-[#32483a]">Internal Staff Notes<input name="internal_notes" className={inputClass} maxLength={500} placeholder="Only visible to admin staff" /></label>
      <button type="submit" className="sm:col-span-3 rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Create Manual Booking</button>
    </>
  );
}
