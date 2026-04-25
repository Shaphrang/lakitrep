import Link from "next/link";
import { addBookingChargeAction, addBookingPaymentAction, generateInvoiceAction } from "@/actions/admin/resort-management";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DataTable } from "@/components/admin/shared/DataTable";
import { getAllBookings } from "@/features/admin/bookings/services/bookings-service";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function BillingPage() {
  const bookings = await getAllBookings({ pageSize: 50, status: "checked_in" });

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Billing" description="Track charges, discounts, pending dues, and invoice creation." />
      <DataTable
        rows={bookings.rows}
        columns={[
          { key: "booking_code", header: "Booking", render: (row) => <Link href={`/admin/bookings/${row.id}`}>{row.booking_code}</Link> },
          { key: "guest_name", header: "Guest" },
          { key: "final_total", header: "Final Total", render: (row) => `₹${row.final_total.toLocaleString("en-IN")}` },
          { key: "amount_paid", header: "Paid", render: (row) => `₹${row.amount_paid.toLocaleString("en-IN")}` },
          { key: "amount_pending", header: "Pending", render: (row) => `₹${row.amount_pending.toLocaleString("en-IN")}` },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <form action={addBookingChargeAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
          <h3 className="font-semibold">Add Charge</h3>
          <input name="booking_id" placeholder="Booking ID" className={inputClass} required />
          <input name="charge_type" placeholder="Charge type" className={inputClass} defaultValue="food" />
          <input name="description" placeholder="Description" className={inputClass} />
          <input type="number" min={1} name="quantity" className={inputClass} defaultValue={1} />
          <input type="number" min={0} step="0.01" name="unit_price" className={inputClass} defaultValue={0} />
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Save Charge</button>
        </form>

        <form action={addBookingPaymentAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
          <h3 className="font-semibold">Record Payment</h3>
          <input name="booking_id" placeholder="Booking ID" className={inputClass} required />
          <input type="number" min={0.01} step="0.01" name="amount" className={inputClass} placeholder="Amount" required />
          <select name="payment_mode" className={inputClass} defaultValue="cash">
            <option value="cash">cash</option><option value="upi">upi</option><option value="card">card</option><option value="bank_transfer">bank_transfer</option><option value="other">other</option>
          </select>
          <select name="payment_type" className={inputClass} defaultValue="part_payment">
            <option value="advance">advance</option><option value="part_payment">part_payment</option><option value="final_payment">final_payment</option><option value="refund">refund</option>
          </select>
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Record Payment</button>
        </form>

        <form action={generateInvoiceAction} className="rounded-2xl border border-[#ddd4c6] bg-white p-4 space-y-2">
          <h3 className="font-semibold">Generate Invoice</h3>
          <input name="booking_id" placeholder="Booking ID" className={inputClass} required />
          <button className="rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Generate</button>
          <p className="text-xs text-[#647267]">Use booking detail page for full bill breakdown.</p>
        </form>
      </section>
    </div>
  );
}
