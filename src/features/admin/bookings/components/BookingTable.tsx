"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateBookingStatusInlineAction } from "@/actions/admin/bookings";
import { DataTable } from "@/components/admin/shared/DataTable";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";
import { BOOKING_STATUS_OPTIONS } from "@/features/admin/bookings/constants";
import type { Booking } from "@/features/admin/bookings/types";

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    bookings.reduce<Record<string, string>>((acc, row) => {
      acc[row.id] = row.status;
      return acc;
    }, {}),
  );
  const [rowState, setRowState] = useState<Record<string, { saving: boolean; message: string; error: boolean }>>({});

  function onStatusChange(booking: Booking, nextStatus: string) {
    const previous = statuses[booking.id] ?? booking.status;
    setStatuses((prev) => ({ ...prev, [booking.id]: nextStatus }));
    setRowState((prev) => ({ ...prev, [booking.id]: { saving: true, message: "Saving…", error: false } }));

    startTransition(async () => {
      const result = await updateBookingStatusInlineAction(booking.id, nextStatus);
      if (result.ok) {
        setRowState((prev) => ({ ...prev, [booking.id]: { saving: false, message: "Saved", error: false } }));
        router.refresh();
        return;
      }

      setStatuses((prev) => ({ ...prev, [booking.id]: previous }));
      setRowState((prev) => ({ ...prev, [booking.id]: { saving: false, message: result.error || "Update failed", error: true } }));
    });
  }

  return (
    <DataTable
      rows={bookings}
      columns={[
        {
          key: "booking_code",
          header: "Code",
          render: (row) => (
            <Link href={`/admin/bookings/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
              {row.booking_code}
            </Link>
          ),
        },
        { key: "guest_name", header: "Guest" },
        { key: "guest_phone", header: "Phone" },
        { key: "cottage_name", header: "Cottage" },
        { key: "check_in_date", header: "Check-in" },
        { key: "check_out_date", header: "Check-out" },
        {
          key: "guests",
          header: "Guests",
          render: (row) => row.adults + row.children + row.infants,
        },
        {
          key: "status",
          header: "Status",
          render: (row) => {
            const feedback = rowState[row.id];
            return (
              <div className="min-w-[150px]">
                <select
                  value={statuses[row.id] ?? row.status}
                  onChange={(event) => onStatusChange(row, event.target.value)}
                  className="w-full rounded-lg border border-[#d8cfbf] bg-[#fdfbf7] px-2 py-1.5 text-sm"
                  disabled={Boolean(feedback?.saving) || isPending}
                >
                  {BOOKING_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <p className={`mt-1 inline-flex items-center gap-1 text-xs ${feedback?.error ? "text-rose-700" : "text-[#5f6f64]"}`}>{feedback?.saving ? <LoadingSpinner className="h-3 w-3 border-[1.5px]" /> : null}{feedback?.message ?? ""}</p>
              </div>
            );
          },
        },
        { key: "source", header: "Source" },
      ]}
    />
  );
}
