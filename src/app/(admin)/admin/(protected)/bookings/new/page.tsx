import { createManualBookingAction } from "@/actions/admin/resort-management";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getManualBookingMeta } from "@/features/admin/bookings/services/resort-management-service";
import { getPrimaryProperty } from "@/lib/public-site";

const inputClass = "rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm text-[#21392c]";

export default async function ManualBookingPage() {
  const [meta, property] = await Promise.all([getManualBookingMeta(), getPrimaryProperty()]);

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Add Manual Booking" description="Create bookings from phone, WhatsApp, walk-in, or agent enquiries." />
      <form action={createManualBookingAction} className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-3">
        <input type="hidden" name="property_id" value={property?.id ?? ""} />

        <label className="text-sm text-[#32483a]">
          Customer
          <select name="customer_id" className={`${inputClass} mt-1`} required>
            <option value="">Select customer</option>
            {meta.customers.map((customer) => (
              <option key={String(customer.id)} value={String(customer.id)}>{String(customer.full_name)} ({String(customer.phone)})</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[#32483a]">
          Cottage
          <select name="cottage_id" className={`${inputClass} mt-1`} required>
            <option value="">Select cottage</option>
            {meta.cottages.map((cottage) => (
              <option key={String(cottage.id)} value={String(cottage.id)}>{String(cottage.name)} ({String(cottage.code)})</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[#32483a]">
          Source
          <select name="source" className={`${inputClass} mt-1`} defaultValue="phone">
            <option value="phone">phone</option>
            <option value="whatsapp">whatsapp</option>
            <option value="walk_in">walk_in</option>
            <option value="agent">agent</option>
            <option value="repeat_guest">repeat_guest</option>
            <option value="website">website</option>
            <option value="other">other</option>
          </select>
        </label>

        <input name="check_in_date" type="date" className={inputClass} required />
        <input name="check_out_date" type="date" className={inputClass} required />
        <select name="status" className={inputClass} defaultValue="confirmed">
          <option value="new_request">new_request</option>
          <option value="contacted">contacted</option>
          <option value="confirmed">confirmed</option>
          <option value="advance_paid">advance_paid</option>
        </select>

        <input name="adults" type="number" min={1} defaultValue={1} className={inputClass} required />
        <input name="children" type="number" min={0} defaultValue={0} className={inputClass} />
        <input name="infants" type="number" min={0} defaultValue={0} className={inputClass} />

        <input name="discount_amount" type="number" min={0} step="0.01" defaultValue={0} className={inputClass} placeholder="Discount" />
        <input name="advance_amount" type="number" min={0} step="0.01" defaultValue={0} className={inputClass} placeholder="Advance amount" />
        <select name="payment_mode" className={inputClass} defaultValue="cash">
          <option value="cash">cash</option>
          <option value="upi">upi</option>
          <option value="card">card</option>
          <option value="bank_transfer">bank_transfer</option>
          <option value="other">other</option>
        </select>

        <input name="special_requests" className="sm:col-span-2 rounded-xl border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-sm" placeholder="Special request" />
        <input name="internal_notes" className={inputClass} placeholder="Internal notes" />

        <button type="submit" className="sm:col-span-3 rounded-xl bg-[#2e5a3d] px-3 py-2 text-sm font-semibold text-white">Create Manual Booking</button>
      </form>
    </div>
  );
}
