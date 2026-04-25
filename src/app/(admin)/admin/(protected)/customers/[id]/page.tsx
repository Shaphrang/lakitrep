import { notFound } from "next/navigation";
import { createOrUpdateCustomerAction } from "@/actions/admin/resort-management";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { getCustomerById } from "@/features/admin/bookings/services/resort-management-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getCustomerById(id);
  if (!context.customer) notFound();

  return (
    <div className="space-y-4">
      <AdminPageHeader title={String(context.customer.full_name)} description="Customer profile and stay history." />

      <form action={createOrUpdateCustomerAction} className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-3">
        <input type="hidden" name="id" value={id} />
        <input name="full_name" defaultValue={String(context.customer.full_name ?? "")} className={inputClass} required />
        <input name="phone" defaultValue={String(context.customer.phone ?? "")} className={inputClass} pattern="\d{10}" required />
        <input name="whatsapp_number" defaultValue={String(context.customer.whatsapp_number ?? "")} className={inputClass} pattern="\d{10}" />
        <input name="email" defaultValue={String(context.customer.email ?? "")} className={inputClass} />
        <input name="city" defaultValue={String(context.customer.city ?? "")} className={inputClass} />
        <input name="state" defaultValue={String(context.customer.state ?? "")} className={inputClass} />
        <input name="customer_type" defaultValue={String(context.customer.customer_type ?? "")} className={inputClass} />
        <input name="source" defaultValue={String(context.customer.source ?? "")} className={inputClass} />
        <input name="country" defaultValue={String(context.customer.country ?? "India")} className={inputClass} />
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Update Customer</button>
      </form>

      <DataTable
        rows={context.bookings.map((booking) => ({ ...booking, id: String(booking.id) }))}
        columns={[
          { key: "booking_code", header: "Booking" },
          { key: "check_in_date", header: "Check-in" },
          { key: "check_out_date", header: "Check-out" },
          { key: "status", header: "Status", render: (row) => <StatusBadge status={String(row.status)} /> },
          { key: "amount_pending", header: "Pending", render: (row) => `₹${Number(row.amount_pending ?? 0).toLocaleString("en-IN")}` },
        ]}
      />
    </div>
  );
}
