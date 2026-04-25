//src\components\public\booking\DateRangePicker.tsx
"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { formatDateLabel } from "@/lib/booking";

type DateRangePickerProps = {
  checkInDate?: string;
  checkOutDate?: string;
  onChange: (value: { checkInDate?: string; checkOutDate?: string }) => void;
  compact?: boolean;
};

function toIso(day: Date) {
  return format(day, "yyyy-MM-dd");
}

export function DateRangePicker({
  checkInDate,
  checkOutDate,
  onChange,
  compact = false,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(startOfMonth(new Date()));
  const [isMobile, setIsMobile] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");

    function syncViewport() {
      setIsMobile(media.matches);
    }

    syncViewport();
    media.addEventListener("change", syncViewport);

    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const months = useMemo(
    () => (isMobile ? [viewMonth] : [viewMonth, addMonths(viewMonth, 1)]),
    [isMobile, viewMonth],
  );

  function isInSelectedRange(day: Date) {
    if (!checkInDate || !checkOutDate) return false;

    const start = parseISO(checkInDate);
    const end = parseISO(checkOutDate);

    return isAfter(day, start) && isBefore(day, end);
  }

  function handleSelect(day: Date) {
    const selected = toIso(day);

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onChange({ checkInDate: selected, checkOutDate: undefined });
      return;
    }

    if (selected <= checkInDate) {
      onChange({ checkInDate: selected, checkOutDate: undefined });
      return;
    }

    onChange({ checkInDate, checkOutDate: selected });
    setOpen(false);
  }

  const triggerHeight = compact ? "py-2.5" : "py-3";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`w-full rounded-2xl border border-[#d7ccb9] bg-white px-3.5 ${triggerHeight} text-left text-sm text-[#2e4c3a] shadow-sm transition hover:border-[#cbbb9f] focus:outline-none focus:ring-2 focus:ring-[#2f5a3d]/10`}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6d7f70]">
          Stay Dates
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm font-semibold text-[#274230]">
          <span>{formatDateLabel(checkInDate)}</span>
          <span className="text-[#849187]">→</span>
          <span>{formatDateLabel(checkOutDate)}</span>
        </div>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/25 sm:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close date picker"
          />

          <div
            className={
              isMobile
                ? "fixed inset-x-3 top-[72px] bottom-3 z-[70] overflow-y-auto rounded-[24px] border border-[#d8cdbd] bg-[#fffdfa] p-3 shadow-2xl"
                : `absolute z-40 mt-2 rounded-[24px] border border-[#d8cdbd] bg-[#fffdfa] p-3 shadow-[0_18px_45px_rgba(28,34,29,0.18)] ${
                    compact ? "right-0 w-[min(96vw,560px)]" : "left-0 w-[min(96vw,650px)]"
                  }`
            }
          >
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                className="rounded-xl border border-[#e1d7c8] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f5a3d] transition hover:bg-[#f3ede3]"
                onClick={() => setViewMonth((month) => addMonths(month, -1))}
              >
                Prev
              </button>

              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6d7f70]">
                  Select stay dates
                </p>
                <p className="text-[11px] text-[#839187]">Tap check-in, then check-out</p>
              </div>

              <button
                type="button"
                className="rounded-xl border border-[#e1d7c8] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f5a3d] transition hover:bg-[#f3ede3]"
                onClick={() => setViewMonth((month) => addMonths(month, 1))}
              >
                Next
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {months.map((month) => {
                const monthStart = startOfMonth(month);
                const start = startOfWeek(monthStart, { weekStartsOn: 1 });
                const days = eachDayOfInterval({ start, end: addDays(start, 41) });

                return (
                  <div key={month.toISOString()} className="rounded-2xl bg-[#fffdfa]">
                    <p className="mb-2 text-center text-sm font-bold text-[#214531]">
                      {format(month, "MMMM yyyy")}
                    </p>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-[#6f7f74]">
                      {"MTWTFSS".split("").map((dayLabel, index) => (
                        <span key={`${dayLabel}-${index}`}>{dayLabel}</span>
                      ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {days.map((day) => {
                        const iso = toIso(day);
                        const disabled = !isSameMonth(day, month) || isBefore(day, today);
                        const isStart = Boolean(checkInDate && isSameDay(day, parseISO(checkInDate)));
                        const isEnd = Boolean(checkOutDate && isSameDay(day, parseISO(checkOutDate)));
                        const inRange = isInSelectedRange(day);

                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleSelect(day)}
                            className={`h-8 rounded-xl text-xs transition sm:h-9 ${
                              disabled
                                ? "cursor-not-allowed text-[#c8bfb2]"
                                : isStart || isEnd
                                  ? "bg-[#2f5a3d] font-bold text-white shadow-sm"
                                  : inRange
                                    ? "bg-[#e8f0ea] font-semibold text-[#2f5a3d]"
                                    : "text-[#2f493b] hover:bg-[#f1ebe2]"
                            }`}
                          >
                            {format(day, "d")}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-2 text-center text-[10px] text-[#849186]">
                      Weekend pricing applies Sat/Sun nights.
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 h-10 w-full rounded-xl border border-[#d8cdbd] bg-white text-sm font-semibold text-[#2f5a3d] shadow-sm sm:hidden"
            >
              Done
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}