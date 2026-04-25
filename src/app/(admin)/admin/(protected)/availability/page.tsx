import { addDays, format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AvailabilityPage() {
  const supabase = await getSupabaseServerClient();
  const start = new Date();
  const end = addDays(start, 13);
  const startDate = format(start, "yyyy-MM-dd");
  const endDate = format(end, "yyyy-MM-dd");

  const [{ data: cottages }, { data: bookings }, { data: blocks }] = await Promise.all([
    supabase.from("cottages").select("id,name").order("name"),
    supabase
      .from("bookings")
      .select("id,cottage_id,check_in_date,check_out_date,status")
      .lt("check_in_date", endDate)
      .gt("check_out_date", startDate)
      .in("status", ["confirmed", "advance_paid", "checked_in"]),
    supabase.from("cottage_blocks").select("id,cottage_id,start_date,end_date,reason").lt("start_date", endDate).gt("end_date", startDate),
  ]);

  const dates = Array.from({ length: 14 }).map((_, index) => format(addDays(start, index), "yyyy-MM-dd"));

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Calendar / Availability" description="Simple 14-day occupancy grid with booking and maintenance blocks." />
      <div className="overflow-auto rounded-2xl border border-[#ddd4c6] bg-white p-3">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left">Cottage</th>
              {dates.map((date) => (
                <th key={date} className="p-2">{date.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(cottages ?? []).map((cottage) => (
              <tr key={String(cottage.id)} className="border-t border-[#eee6da]">
                <td className="p-2 font-medium">{String(cottage.name)}</td>
                {dates.map((date) => {
                  const isBooked = (bookings ?? []).some(
                    (booking) =>
                      String(booking.cottage_id) === String(cottage.id) &&
                      String(booking.check_in_date) <= date &&
                      String(booking.check_out_date) > date,
                  );
                  const isBlocked = (blocks ?? []).some(
                    (block) => String(block.cottage_id) === String(cottage.id) && String(block.start_date) <= date && String(block.end_date) >= date,
                  );

                  return (
                    <td key={`${cottage.id}-${date}`} className="p-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 ${isBlocked ? "bg-[#fde8bf]" : isBooked ? "bg-[#d5edd8]" : "bg-[#edf1ec]"}`}>
                        {isBlocked ? "Blocked" : isBooked ? "Booked" : "Free"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
