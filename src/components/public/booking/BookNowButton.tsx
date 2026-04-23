"use client";

import { useBookingFlow } from "@/components/public/booking/BookingFlowProvider";

type BookNowButtonProps = {
  cottageSlug?: string;
  label?: string;
  className?: string;
  lockCottage?: boolean;
};

export function BookNowButton({ cottageSlug, label = "Book Now", className, lockCottage = true }: BookNowButtonProps) {
  const { openBooking } = useBookingFlow();

  return (
    <button
      type="button"
      onClick={() => openBooking(cottageSlug ? { cottageSlug } : {}, { lockCottage })}
      className={className ?? "rounded-full bg-[#2f5a3d] px-4 py-2 text-sm font-semibold text-white"}
    >
      {label}
    </button>
  );
}
