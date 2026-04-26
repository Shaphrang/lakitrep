import { notFound } from "next/navigation";
import { createOrUpdateCustomerAction } from "@/actions/admin/resort-management";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { BOOKING_SOURCE_OPTIONS } from "@/features/admin/bookings/constants";
import { getCustomerById } from "@/features/admin/bookings/services/resort-management-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function CustomerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const q = await searchParams;
  const success = typeof q.success === "string" ? decodeURIComponent(q.success) : "";
  const error = typeof q.error === "string" ? decodeURIComponent(q.error) : "";
  const context = await getCustomerById(id);
  if (!context.customer) notFound();

  return (
    <div className="space-y-4">
      <AdminPageHeader title={String(context.customer.full_name)} description="Customer profile and stay history." />

      <form action={createOrUpdateCustomerAction} className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-3">
        <input type="hidden" name="return_path" value={`/admin/customers/${id}`} />
        <input type="hidden" name="id" value={id} />
        <label className="text-sm">Full Name *<input name="full_name" defaultValue={String(context.customer.full_name ?? "")} className={`${inputClass} mt-1 w-full`} minLength={2} maxLength={100} required /></label>
        <label className="text-sm">Phone Number *<input name="phone" defaultValue={String(context.customer.phone ?? "")} className={`${inputClass} mt-1 w-full`} pattern="\d{10}" inputMode="numeric" maxLength={10} required /></label>
        <label className="text-sm">WhatsApp Number<input name="whatsapp_number" defaultValue={String(context.customer.whatsapp_number ?? "")} className={`${inputClass} mt-1 w-full`} pattern="\d{10}" inputMode="numeric" maxLength={10} /></label>
        <label className="text-sm">Email Address<input name="email" defaultValue={String(context.customer.email ?? "")} className={`${inputClass} mt-1 w-full`} type="email" /></label>
        <label className="text-sm">City<input name="city" defaultValue={String(context.customer.city ?? "")} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">State<input name="state" defaultValue={String(context.customer.state ?? "")} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">Customer Type<input name="customer_type" defaultValue={String(context.customer.customer_type ?? "")} className={`${inputClass} mt-1 w-full`} /></label>
        <label className="text-sm">Booking Source
          <select name="source" defaultValue={String(context.customer.source ?? "other")} className={`${inputClass} mt-1 w-full`}>
            {BOOKING_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">Country<input name="country" defaultValue={String(context.customer.country ?? "India")} className={`${inputClass} mt-1 w-full`} /></label>
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Update Customer</button>
      </form>

      <DataTable
        rows={context.bookings.map((booking) => ({ ...booking, id: String(booking.id) }))}
        columns={[
          { key: "booking_id", header: "Booking ID", render: (row) => String(row.booking_code ?? row.id ?? "-") },
          { key: "check_in_date", header: "Check-in" },
          { key: "check_out_date", header: "Check-out" },
          { key: "total_bill", header: "Total Bill", render: (row) => row.final_total == null ? "Not generated" : `₹${Number(row.final_total ?? 0).toLocaleString("en-IN")}` },
          { key: "payment_status", header: "Payment Status", render: (row) => row.final_total == null ? "Not generated" : String(row.payment_status ?? "unpaid").replaceAll("_", " ") },
        ]}
      />
      <ActionDialog success={success} error={error} />
    </div>
  );
}
