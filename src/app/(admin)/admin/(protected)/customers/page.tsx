import Link from "next/link";
import { createOrUpdateCustomerAction } from "@/actions/admin/resort-management";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { getCustomers } from "@/features/admin/bookings/services/resort-management-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = typeof params.query === "string" ? params.query : "";
  const source = typeof params.source === "string" ? params.source : "";
  const customerType = typeof params.customer_type === "string" ? params.customer_type : "";

  const customers = await getCustomers({ query, source, customerType });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Customers" description="Manage guest profiles, contact details, and booking history." />
      <form className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-4">
        <input name="query" className={inputClass} placeholder="Name / phone / WhatsApp" defaultValue={query} />
        <input name="source" className={inputClass} placeholder="Source (website, phone...)" defaultValue={source} />
        <input name="customer_type" className={inputClass} placeholder="Type (family, group...)" defaultValue={customerType} />
        <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Apply</button>
      </form>

      <div className="rounded-2xl border border-[#ddd4c6] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#2b4a38]">Add Customer</h3>
        <form action={createOrUpdateCustomerAction} className="grid gap-3 sm:grid-cols-3">
          <input name="full_name" placeholder="Full name" className={inputClass} required />
          <input name="phone" placeholder="Phone (10 digits)" className={inputClass} pattern="\d{10}" required />
          <input name="whatsapp_number" placeholder="WhatsApp (optional)" className={inputClass} pattern="\d{10}" />
          <input name="email" placeholder="Email (optional)" className={inputClass} />
          <input name="city" placeholder="City" className={inputClass} />
          <input name="state" placeholder="State" className={inputClass} />
          <input name="customer_type" placeholder="Type" className={inputClass} />
          <input name="source" placeholder="Source" className={inputClass} />
          <button type="submit" className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save</button>
        </form>
      </div>

      <DataTable
        rows={customers.map((row) => ({ ...(row as Record<string, unknown>), id: String(row.id) })) as Array<{ id: string; [key: string]: unknown }>}
        columns={[
          {
            key: "full_name",
            header: "Customer",
            render: (row: { id: string; [key: string]: unknown }) => (
              <Link href={`/admin/customers/${row.id}`} className="font-medium text-[#2b5a3b] underline-offset-4 hover:underline">
                {String(row.full_name ?? "-")}
              </Link>
            ),
          },
          { key: "phone", header: "Phone" },
          { key: "whatsapp_number", header: "WhatsApp" },
          { key: "email", header: "Email" },
          { key: "customer_type", header: "Type" },
          { key: "source", header: "Source" },
        ]}
      />
    </div>
  );
}
