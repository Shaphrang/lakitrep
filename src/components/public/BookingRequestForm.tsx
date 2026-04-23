"use client";

import { useActionState } from "react";
import { submitBookingRequest, type BookingFormState } from "@/actions/public/bookings";
import type { PublicCottage } from "@/lib/public-site";

const initialState: BookingFormState = {
  success: false,
  message: "",
};

export function BookingRequestForm({ cottages }: { cottages: PublicCottage[] }) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Full name *</span>
          <input required name="fullName" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Phone *</span>
          <input required name="phone" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Email</span>
          <input type="email" name="email" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">WhatsApp</span>
          <input name="whatsappNumber" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Cottage *</span>
          <select required name="cottageSlug" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5">
            <option value="">Select cottage</option>
            {cottages.map((cottage) => (
              <option key={cottage.id} value={cottage.slug}>
                {cottage.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Country</span>
          <input name="country" defaultValue="India" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Check-in *</span>
          <input required type="date" name="checkInDate" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Check-out *</span>
          <input required type="date" name="checkOutDate" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Adults *</span>
          <input defaultValue={2} min={1} type="number" name="adults" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Children</span>
          <input defaultValue={0} min={0} type="number" name="children" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
        <label className="space-y-1 text-sm text-[#3f4f45]">
          <span className="font-medium">Infants</span>
          <input defaultValue={0} min={0} type="number" name="infants" className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
        </label>
      </div>

      <label className="space-y-1 text-sm text-[#3f4f45]">
        <span className="font-medium">Special requests</span>
        <textarea name="specialRequests" rows={4} className="w-full rounded-xl border border-[#cfc4b3] bg-white px-3 py-2.5" />
      </label>

      {state.message ? (
        <p className={`text-sm ${state.success ? "text-[#2f663f]" : "text-rose-700"}`}>
          {state.message} {state.bookingCode ? `Ref: ${state.bookingCode}` : ""}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#2f5a3d] px-4 py-3 font-semibold text-white transition hover:bg-[#264f35] disabled:opacity-70"
      >
        {pending ? "Submitting..." : "Submit booking request"}
      </button>
    </form>
  );
}
