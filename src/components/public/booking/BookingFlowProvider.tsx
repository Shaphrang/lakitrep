//src\components\public\booking\BookingFlowProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
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

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 639px)").matches;
}

export function BookingFlowProvider({
  children,
  cottages,
}: {
  children: React.ReactNode;
  cottages: PublicCottage[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [seed, setSeed] = useState<BookingSeed>({});
  const [lockCottage, setLockCottage] = useState(false);
  const [version, setVersion] = useState(0);
  const pushedMobileHistoryRef = useRef(false);

  const closeBooking = useCallback(
    (options?: { navigateHome?: boolean }) => {
      setIsOpen(false);

      if (
        typeof window !== "undefined" &&
        pushedMobileHistoryRef.current &&
        (window.location.hash === "#booking" || window.location.hash === "#booking-date")
      ) {
        window.history.replaceState(
          { ...(window.history.state ?? {}), bookingFlow: false },
          "",
          `${window.location.pathname}${window.location.search}`,
        );

        pushedMobileHistoryRef.current = false;
      }

      if (options?.navigateHome) {
        router.push("/");
      }
    },
    [router],
  );

  const value = useMemo(
    () => ({
      openBooking: (
        nextSeed: BookingSeed = {},
        options?: { lockCottage?: boolean },
      ) => {
        setSeed(nextSeed);
        setLockCottage(Boolean(options?.lockCottage));
        setVersion((current) => current + 1);

        if (
          typeof window !== "undefined" &&
          isMobileViewport() &&
          !pushedMobileHistoryRef.current
        ) {
          const nextUrl = `${window.location.pathname}${window.location.search}#booking`;

          window.history.pushState(
            { ...(window.history.state ?? {}), bookingFlow: true },
            "",
            nextUrl,
          );

          pushedMobileHistoryRef.current = true;
        }

        setIsOpen(true);
      },
    }),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    function handlePopState() {
      if (!pushedMobileHistoryRef.current) return;

      /*
        Important mobile behavior:

        Booking form URL: #booking
        Date picker URL: #booking-date

        When the user presses Back while the date picker is open,
        the browser moves from #booking-date back to #booking.
        In that case, only the date picker should close.
        The booking form must remain open so the user does not lose typed data.
      */
      if (window.location.hash === "#booking") {
        return;
      }

      pushedMobileHistoryRef.current = false;
      setIsOpen(false);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <BookingFlowContext.Provider value={value}>
      {children}

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-[#f8f4ec] sm:bg-black/55 sm:backdrop-blur-[2px]">
          <button
            type="button"
            className="hidden sm:absolute sm:inset-0 sm:block"
            onClick={() => closeBooking()}
            aria-label="Close booking"
          />

          <section
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 flex min-h-0 flex-col bg-[#f8f4ec] text-[#264330] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(94vw,920px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px] sm:border sm:border-[#d8cebf] sm:bg-[#f8f4ec] sm:p-5 sm:shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ded4c6] bg-[#f8f4ec]/95 px-4 py-3 backdrop-blur sm:mb-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6f7f75]">
                  La Ki Trep
                </p>

                <h3 className="mt-0.5 truncate font-serif text-sm leading-tight text-[#214531] sm:text-[1.8rem]">
                  Complete your booking request
                </h3>
              </div>

              <button
                type="button"
                onClick={() => closeBooking()}
                className="rounded-full border border-[#d8cdbd] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d573b] shadow-sm transition hover:bg-[#f1eadf] sm:px-4 sm:py-2 sm:text-sm"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 px-3 py-3 sm:px-0 sm:py-0">
              <BookingRequestForm
                key={version}
                cottages={cottages}
                initialValues={seed}
                cottageLocked={lockCottage}
                compact
                onCancel={() => closeBooking()}
                onSuccessAcknowledged={() => closeBooking({ navigateHome: true })}
              />
            </div>
          </section>
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