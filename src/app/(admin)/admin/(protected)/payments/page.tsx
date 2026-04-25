import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function PaymentsPage() {
  const supabase = await getSupabaseServerClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data } = await supabase
    .from("booking_payments")
    .select("id,payment_date,amount,payment_mode,payment_type,reference_number,bookings(booking_code)")
    .order("payment_date", { ascending: false })
    .limit(200);

  const rows = (data ?? []).map((row) => ({
    id: String(row.id),
    payment_date: String(row.payment_date ?? "-"),
    amount: Number(row.amount ?? 0),
    payment_mode: String(row.payment_mode ?? "-"),
    payment_type: String(row.payment_type ?? "-"),
    reference_number: String(row.reference_number ?? "-"),
    booking_code: ((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-") as string,
  }));

  const todaysCollection = rows.filter((row) => row.payment_date === today).reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Payments / Collection" description={`Today's collection: ₹${todaysCollection.toLocaleString("en-IN")}`} />
      <DataTable
        rows={rows}
        columns={[
          { key: "payment_date", header: "Date" },
          { key: "booking_code", header: "Booking" },
          { key: "amount", header: "Amount", render: (row) => `₹${row.amount.toLocaleString("en-IN")}` },
          { key: "payment_mode", header: "Mode" },
          { key: "payment_type", header: "Type" },
          { key: "reference_number", header: "Reference" },
        ]}
      />
    </div>
  );
}
