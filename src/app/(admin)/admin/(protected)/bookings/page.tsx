import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { BookingTable } from "@/features/admin/bookings/components/BookingTable";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const status = typeof params.status === "string" ? params.status : "";
  const source = typeof params.source === "string" ? params.source : "";
  const page = Number(typeof params.page === "string" ? params.page : "1");

  const bookings = await getAllBookings({ query, status, source, page, pageSize: 20 });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Bookings" description="Search, filter, and manage booking requests and active stays." />

      <form className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm sm:grid-cols-5">
        <input className={inputClass} name="query" placeholder="Search code / guest / phone" defaultValue={query} />
        <select className={inputClass} name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {[
            "new_request",
            "contacted",
            "confirmed",
            "advance_paid",
            "checked_in",
            "checked_out",
            "cancelled",
            "no_show",
            "rejected",
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select className={inputClass} name="source" defaultValue={source}>
          <option value="">All sources</option>
          {[
            "website",
            "phone",
            "whatsapp",
            "walk_in",
            "instagram",
            "facebook",
            "agent",
            "repeat_guest",
            "other",
          ].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">
          Apply Filters
        </button>
        <Link href="/admin/bookings/new" className="rounded-xl border border-[#2e5a3d] px-3 py-2 text-center text-sm font-semibold text-[#2e5a3d]">
          Add Manual Booking
        </Link>
      </form>

      <BookingTable bookings={bookings.rows} />

      <div className="flex items-center justify-between text-sm text-[#4d5e53]">
        <p>
          Page {bookings.page} of {bookings.totalPages} · {bookings.total} records
        </p>
        <div className="flex gap-2">
          <Link
            href={`/admin/bookings?query=${encodeURIComponent(query)}&status=${status}&source=${source}&page=${Math.max(1, bookings.page - 1)}`}
            className="rounded-lg border border-[#d8cfbf] px-3 py-1.5"
          >
            Previous
          </Link>
          <Link
            href={`/admin/bookings?query=${encodeURIComponent(query)}&status=${status}&source=${source}&page=${Math.min(bookings.totalPages, bookings.page + 1)}`}
            className="rounded-lg border border-[#d8cfbf] px-3 py-1.5"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
