import { createManualBookingAction } from "@/actions/admin/resort-management";
import { ManualBookingForm } from "@/components/admin/bookings/ManualBookingForm";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getManualBookingMeta } from "@/features/admin/bookings/services/resort-management-service";
import { getPrimaryProperty } from "@/lib/public-site";

export default async function ManualBookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const [meta, property] = await Promise.all([getManualBookingMeta(), getPrimaryProperty()]);
  const success = typeof params.success === "string" ? decodeURIComponent(params.success) : "";
  const error = typeof params.error === "string" ? decodeURIComponent(params.error) : "";

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Add Manual Booking" description="Create bookings from phone, WhatsApp, walk-in, or agent enquiries." />
      <form action={createManualBookingAction} className="grid gap-3 rounded-2xl border border-[#ddd4c6] bg-white p-4 sm:grid-cols-3">
        <input type="hidden" name="return_path" value="/admin/bookings/new" />
        <ManualBookingForm
          propertyId={property?.id ?? ""}
          cottages={meta.cottages.map((row) => ({ id: String(row.id), name: String(row.name), code: String(row.code), slug: String(row.slug), max_total_guests: Number(row.max_total_guests ?? 0) }))}
          customers={meta.customers.map((row) => ({ id: String(row.id), full_name: String(row.full_name), phone: String(row.phone), source: String(row.source ?? "other") }))}
        />
      </form>
      <ActionDialog success={success} error={error} />
    </div>
  );
}
