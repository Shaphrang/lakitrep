//src\components\public\booking\BookingFlowProvider.tsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { BookingRequestForm } from "@/components/public/BookingRequestForm";
import type { PublicCottage } from "@/lib/public-site";

type BookingSeed = {
  cottageSlug?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
};

type BookingFlowContextValue = {
  openBooking: (seed?: BookingSeed, options?: { lockCottage?: boolean }) => void;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

export function BookingFlowProvider({ children, cottages }: { children: React.ReactNode; cottages: PublicCottage[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [seed, setSeed] = useState<BookingSeed>({});
  const [lockCottage, setLockCottage] = useState(false);
  const [version, setVersion] = useState(0);

  const value = useMemo(
    () => ({
      openBooking: (nextSeed: BookingSeed = {}, options?: { lockCottage?: boolean }) => {
        setSeed(nextSeed);
        setLockCottage(Boolean(options?.lockCottage));
        setVersion((current) => current + 1);
        setIsOpen(true);
      },
    }),
    [],
  );

  return (
    <BookingFlowContext.Provider value={value}>
      {children}
      {isOpen ? (
  <div className="fixed inset-0 z-50">
    <button
      type="button"
      className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      onClick={() => setIsOpen(false)}
      aria-label="Close booking"
    />
    <div className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-auto rounded-t-[28px] border border-[#d8cebf] bg-[#f8f4ec] p-4 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(92vw,760px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[30px] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6f7f75]">La Ki Trep</p>
          <h3 className="font-serif text-2xl text-[#214531] sm:text-[2rem]">
            Complete your booking request
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full border border-[#d8cdbd] px-3 py-1.5 text-sm text-[#2d573b]"
        >
          Close
        </button>
      </div>
      <BookingRequestForm
        key={version}
        cottages={cottages}
        initialValues={seed}
        cottageLocked={lockCottage}
        compact
      />
    </div>
  </div>
) : null}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error("useBookingFlow must be used inside BookingFlowProvider");
  }
  return context;
}
