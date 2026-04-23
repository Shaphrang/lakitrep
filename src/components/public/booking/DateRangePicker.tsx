//src\components\public\booking\DateRangePicker.tsx
"use client";

import {
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
import { useMemo, useState } from "react";
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

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const months = [viewMonth, addMonths(viewMonth, 1)];

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full rounded-2xl border border-[#d7ccb9] bg-white px-3.5 py-3 text-left text-sm text-[#2e4c3a] shadow-sm transition hover:border-[#cbbb9f]"
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6d7f70]">
          Stay Dates
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1 text-sm font-medium text-[#274230]">
          <span>{formatDateLabel(checkInDate)}</span>
          <span className="text-[#849187]">→</span>
          <span>{formatDateLabel(checkOutDate)}</span>
        </div>
      </button>

      {open ? (
        <div
          className={`absolute z-40 mt-2 rounded-[24px] border border-[#d8cdbd] bg-[#fffdfa] p-3 shadow-[0_18px_45px_rgba(28,34,29,0.18)] ${
            compact ? "right-0 w-[min(96vw,560px)]" : "left-0 w-[min(96vw,650px)]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <button
              type="button"
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-[#2f5a3d] transition hover:bg-[#f3ede3]"
              onClick={() => setViewMonth((month) => addMonths(month, -1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded-xl px-3 py-1.5 text-sm font-medium text-[#2f5a3d] transition hover:bg-[#f3ede3]"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
            >
              Next
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {months.map((month) => {
              const monthStart = startOfMonth(month);
              const start = startOfWeek(monthStart, { weekStartsOn: 1 });
              const days = eachDayOfInterval({ start, end: addMonths(start, 1) });

              return (
                <div key={month.toISOString()}>
                  <p className="mb-2 text-center text-sm font-semibold text-[#214531]">
                    {format(month, "MMMM yyyy")}
                  </p>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#6f7f74]">
                    {"MTWTFSS".split("").map((d, i) => (
                      <span key={`${d}-${i}`}>{d}</span>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {days.slice(0, 42).map((day) => {
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
                          className={`h-9 rounded-xl text-xs transition ${
                            disabled
                              ? "text-[#c8bfb2]"
                              : isStart || isEnd
                                ? "bg-[#2f5a3d] font-semibold text-white"
                                : inRange
                                  ? "bg-[#e8f0ea] text-[#2f5a3d]"
                                  : "text-[#2f493b] hover:bg-[#f1ebe2]"
                          }`}
                        >
                          {format(day, "d")}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-[#849186]">
                    Weekend pricing applies Sat/Sun nights.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}