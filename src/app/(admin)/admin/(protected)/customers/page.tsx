import Link from "next/link";
import { createOrUpdateCustomerAction } from "@/actions/admin/resort-management";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { BOOKING_SOURCE_OPTIONS } from "@/features/admin/bookings/constants";
import { getCustomers } from "@/features/admin/bookings/services/resort-management-service";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const source = typeof params.source === "string" ? params.source : "";
  const customerType = typeof params.customer_type === "string" ? params.customer_type : "";
  const success = typeof params.success === "string" ? decodeURIComponent(params.success) : "";
  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : "";

  const customers = await getCustomers({ query, source, customerType });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Customers" description="Manage guest profiles, contact details, and booking history." />
      <form className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-4">
        <h3 className="sm:col-span-4 text-sm font-semibold text-[#2b4a38]">Search &amp; Filter Customers</h3>
        <input name="query" className={inputClass} placeholder="Search by guest name, phone or WhatsApp" defaultValue={query} />
        <select name="source" className={inputClass} defaultValue={source}>
          <option value="">All sources</option>
          {BOOKING_SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input name="customer_type" className={inputClass} placeholder="Guest type (Family, Couple, Group...)" defaultValue={customerType} />
        <SubmitButton pendingText="Applying..." className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Apply</SubmitButton>
      </form>

      <div className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#2b4a38]">Add Customer</h3>
        <form action={createOrUpdateCustomerAction} className="grid gap-3 sm:grid-cols-3">
          <input type="hidden" name="return_path" value="/admin/customers" />
          <label className="text-sm">Full Name *<input name="full_name" placeholder="Enter customer full name" className={`${inputClass} mt-1 w-full`} minLength={2} maxLength={100} required /></label>
          <label className="text-sm">Phone Number *<input name="phone" placeholder="Enter 10 digit mobile number" className={`${inputClass} mt-1 w-full`} inputMode="numeric" pattern="\d{10}" maxLength={10} required /></label>
          <label className="text-sm">WhatsApp Number<input name="whatsapp_number" placeholder="Optional 10 digit WhatsApp number" className={`${inputClass} mt-1 w-full`} inputMode="numeric" pattern="\d{10}" maxLength={10} /></label>
          <label className="text-sm">Email Address<input name="email" placeholder="Optional email for invoice sharing" className={`${inputClass} mt-1 w-full`} type="email" /></label>
          <label className="text-sm">City<input name="city" placeholder="City" className={`${inputClass} mt-1 w-full`} /></label>
          <label className="text-sm">State<input name="state" placeholder="State" className={`${inputClass} mt-1 w-full`} /></label>
          <label className="text-sm">Customer Type<input name="customer_type" placeholder="Family, Couple, Group, Corporate" className={`${inputClass} mt-1 w-full`} /></label>
          <label className="text-sm">Booking Source
            <select name="source" className={`${inputClass} mt-1 w-full`} defaultValue="other">
              {BOOKING_SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton pendingText="Saving..." className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save Customer</SubmitButton>
        </form>
      </div>

      <DataTable
        rows={customers.map((row) => ({ ...(row as Record<string, unknown>), id: String(row.id) })) as Array<{ id: string; [key: string]: unknown }>}
        columns={[
          { key: "full_name", header: "Customer", render: (row: { id: string; [key: string]: unknown }) => <Link href={`/admin/customers/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">{String(row.full_name ?? "-")}</Link> },
          { key: "phone", header: "Phone" },
          { key: "whatsapp_number", header: "WhatsApp" },
          { key: "email", header: "Email" },
          { key: "customer_type", header: "Type" },
          { key: "source", header: "Source" },
        ]}
      />
      <ActionDialog success={success} error={error} />
    </div>
  );
}
