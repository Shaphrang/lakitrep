import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function InvoicesPage() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("invoices")
    .select("id,invoice_number,invoice_date,total_amount,amount_paid,amount_pending,status,bookings(booking_code)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []).map((row) => ({
    id: String(row.id),
    invoice_number: String(row.invoice_number ?? "-"),
    invoice_date: String(row.invoice_date ?? "-"),
    total_amount: Number(row.total_amount ?? 0),
    amount_paid: Number(row.amount_paid ?? 0),
    amount_pending: Number(row.amount_pending ?? 0),
    status: String(row.status ?? "draft"),
    booking_code: ((row.bookings as { booking_code?: string } | null)?.booking_code ?? "-") as string,
  }));

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Invoices" description="Generated invoices with paid and pending amount overview." />
      <DataTable
        rows={rows}
        columns={[
          { key: "invoice_number", header: "Invoice" },
          { key: "invoice_date", header: "Date" },
          { key: "booking_code", header: "Booking" },
          { key: "total_amount", header: "Total", render: (row) => `₹${row.total_amount.toLocaleString("en-IN")}` },
          { key: "amount_paid", header: "Paid", render: (row) => `₹${row.amount_paid.toLocaleString("en-IN")}` },
          { key: "amount_pending", header: "Pending", render: (row) => `₹${row.amount_pending.toLocaleString("en-IN")}` },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />
    </div>
  );
}
