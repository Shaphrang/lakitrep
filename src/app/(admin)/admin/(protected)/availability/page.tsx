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
    supabase.from("cottages").select("id,name,code,is_combined_unit,component_codes").eq("status", "active").eq("is_bookable", true).order("name"),
    supabase
      .from("bookings")
      .select("id,cottage_id,check_in_date,check_out_date,status")
      .lt("check_in_date", endDate)
      .gt("check_out_date", startDate)
      .in("status", ["confirmed", "advance_paid", "checked_in"]),
    supabase.from("cottage_blocks").select("id,cottage_id,start_date,end_date,reason").lt("start_date", endDate).gt("end_date", startDate),
  ]);

  const dates = Array.from({ length: 14 }).map((_, index) => format(addDays(start, index), "yyyy-MM-dd"));
  const cottageRows = (cottages ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? "-"),
    code: String((row as { code?: string }).code ?? ""),
    componentCodes: Array.isArray((row as { component_codes?: string[] }).component_codes)
      ? ((row as { component_codes?: string[] }).component_codes ?? []).map((code) => String(code))
      : [],
  }));

  function getConflictIds(cottageId: string) {
    const selected = cottageRows.find((row) => row.id === cottageId);
    if (!selected) return [cottageId];

    const relatedCodes = new Set<string>([selected.code, ...selected.componentCodes].filter(Boolean));
    for (const row of cottageRows) {
      if (row.componentCodes.some((code) => relatedCodes.has(code))) {
        relatedCodes.add(row.code);
      }
    }

    const ids = cottageRows
      .filter((row) => relatedCodes.has(row.code) || row.componentCodes.some((code) => relatedCodes.has(code)))
      .map((row) => row.id);

    return ids.length ? ids : [cottageId];
  }

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
            {cottageRows.map((cottage) => (
              <tr key={cottage.id} className="border-t border-[#eee6da]">
                <td className="p-2 font-medium">{cottage.name}</td>
                {dates.map((date) => {
                  const conflictIds = getConflictIds(cottage.id);
                  const isBooked = (bookings ?? []).some(
                    (booking) =>
                      conflictIds.includes(String(booking.cottage_id)) &&
                      String(booking.check_in_date) <= date &&
                      String(booking.check_out_date) > date,
                  );
                  const isBlocked = (blocks ?? []).some(
                    (block) => conflictIds.includes(String(block.cottage_id)) && String(block.start_date) <= date && String(block.end_date) >= date,
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
