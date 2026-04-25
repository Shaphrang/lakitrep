import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  const sourceFilter = typeof params.source === "string" ? params.source : "";

  const dateRangeInvalid = Boolean(from && to && from > to);

  const supabase = await getSupabaseServerClient();

  const [{ data: payments }, { data: pending }, { data: bookings }, { data: customers }] = await Promise.all([
    supabase.from("booking_payments").select("id,payment_date,amount,payment_mode,payment_type").order("payment_date", { ascending: false }).limit(2000),
    supabase.from("bookings").select("id,booking_code,amount_pending,final_total,amount_paid,status,check_out_date,guest:booking_guests!bookings_booking_guest_id_fkey(full_name,phone),cottages(name)").gt("amount_pending", 0).order("check_out_date", { ascending: true }).limit(500),
    (sourceFilter ? supabase.from("bookings").select("id,source,status,final_total").eq("source", sourceFilter) : supabase.from("bookings").select("id,source,status,final_total")).limit(5000),
    supabase.from("booking_guests").select("id,source,customer_type,created_at").limit(5000),
  ]);

  const paymentRows = (payments ?? []).filter((row) => {
    const paymentDate = String(row.payment_date ?? "");
    if (from && paymentDate < from) return false;
    if (to && paymentDate > to) return false;
    return true;
  }).map((row) => ({ id: String(row.id), payment_date: String(row.payment_date ?? "-"), amount: Number(row.amount ?? 0), payment_mode: String(row.payment_mode ?? "other"), payment_type: String(row.payment_type ?? "part_payment") }));

  const totalCollection = paymentRows.reduce((sum, row) => sum + row.amount, 0);
  const modeSummary = paymentRows.reduce<Record<string, number>>((acc, row) => { acc[row.payment_mode] = (acc[row.payment_mode] ?? 0) + row.amount; return acc; }, {});

  const sourceSummary = (bookings ?? []).reduce<Record<string, { count: number; confirmed: number; cancelled: number; revenue: number }>>((acc, booking) => {
    const source = String(booking.source ?? "other");
    if (!acc[source]) acc[source] = { count: 0, confirmed: 0, cancelled: 0, revenue: 0 };
    acc[source].count += 1;
    if (["confirmed", "advance_paid", "checked_in", "checked_out"].includes(String(booking.status ?? ""))) acc[source].confirmed += 1;
    if (["cancelled", "rejected", "no_show"].includes(String(booking.status ?? ""))) acc[source].cancelled += 1;
    acc[source].revenue += Number(booking.final_total ?? 0);
    return acc;
  }, {});

  const pendingRows = (pending ?? []).map((row) => ({ id: String(row.id), booking_code: String(row.booking_code ?? "-"), guest: ((row.guest as { full_name?: string } | null)?.full_name ?? "-") as string, phone: ((row.guest as { phone?: string } | null)?.phone ?? "-") as string, cottage: ((row.cottages as { name?: string } | null)?.name ?? "-") as string, check_out_date: String(row.check_out_date ?? "-"), final_total: Number(row.final_total ?? 0), amount_paid: Number(row.amount_paid ?? 0), amount_pending: Number(row.amount_pending ?? 0), status: String(row.status ?? "-") }));

  const sourceRows = Object.entries(sourceSummary).map(([source, summary]) => ({ id: source, source, bookings: summary.count, confirmed: summary.confirmed, cancelled: summary.cancelled, revenue: summary.revenue, average: summary.count > 0 ? summary.revenue / summary.count : 0 }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Reports" description="Collection, pending bills, source performance, and customer analytics." />

      <form className="grid gap-2 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-5">
        <label className="text-sm">From Date<input type="date" name="from" defaultValue={from} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">To Date<input type="date" name="to" defaultValue={to} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">Booking Source<select name="source" defaultValue={sourceFilter} className={`${inputClass} mt-1 w-full`}><option value="">All sources</option><option value="website">Website</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="walk_in">Walk-in</option><option value="agent">Agent</option><option value="repeat_guest">Repeat Guest</option><option value="other">Other</option></select></label>
        <button type="submit" className="self-end rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Apply Filters</button>
      </form>

      {dateRangeInvalid ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">From date cannot be after To date.</p> : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4"><p className="text-xs text-[#6e7f72]">Total collection</p><p className="text-xl font-semibold">₹{totalCollection.toLocaleString("en-IN")}</p></article>
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4"><p className="text-xs text-[#6e7f72]">Pending bills</p><p className="text-xl font-semibold">{pendingRows.length}</p></article>
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-4"><p className="text-xs text-[#6e7f72]">Customers tracked</p><p className="text-xl font-semibold">{(customers ?? []).length}</p></article>
      </section>

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4"><h3 className="mb-3 font-semibold">Collection by payment mode</h3>
        {Object.keys(modeSummary).length === 0 ? <p className="text-sm text-[#647267]">No records found for the selected filters.</p> : <ul className="grid gap-2 sm:grid-cols-3 text-sm">{Object.entries(modeSummary).map(([mode, value]) => <li key={mode} className="rounded-xl bg-[#f7f3eb] px-3 py-2">{mode}: ₹{value.toLocaleString("en-IN")}</li>)}</ul>}
      </section>

      <section><h3 className="mb-2 font-semibold">Pending Bills Report</h3>{pendingRows.length === 0 ? <p className="rounded-xl border border-[#ddd4c6] bg-white p-3 text-sm text-[#647267]">No records found for the selected filters.</p> : <DataTable rows={pendingRows} columns={[{ key: "booking_code", header: "Booking" }, { key: "guest", header: "Guest" }, { key: "phone", header: "Phone" }, { key: "cottage", header: "Cottage" }, { key: "check_out_date", header: "Checkout" }, { key: "final_total", header: "Final", render: (row) => `₹${row.final_total.toLocaleString("en-IN")}` }, { key: "amount_paid", header: "Paid", render: (row) => `₹${row.amount_paid.toLocaleString("en-IN")}` }, { key: "amount_pending", header: "Pending", render: (row) => `₹${row.amount_pending.toLocaleString("en-IN")}` }, { key: "status", header: "Status" }]} />}</section>
      <section><h3 className="mb-2 font-semibold">Booking Source Report</h3>{sourceRows.length === 0 ? <p className="rounded-xl border border-[#ddd4c6] bg-white p-3 text-sm text-[#647267]">No records found for the selected filters.</p> : <DataTable rows={sourceRows} columns={[{ key: "source", header: "Source" }, { key: "bookings", header: "Bookings" }, { key: "confirmed", header: "Confirmed" }, { key: "cancelled", header: "Cancelled" }, { key: "revenue", header: "Revenue", render: (row) => `₹${row.revenue.toLocaleString("en-IN")}` }, { key: "average", header: "Avg value", render: (row) => `₹${row.average.toLocaleString("en-IN")}` }]} />}</section>
    </div>
  );
}
