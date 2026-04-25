import Link from "next/link";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { BillingWorkspaceClient } from "@/components/admin/billing/BillingWorkspaceClient";
import { getBillingContext } from "@/features/admin/bookings/services/resort-management-service";
const cardClass = "rounded-2xl border border-[#ddd4c6] bg-white p-5 text-sm text-[#5e6f63]";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidBookingId(value: string) {
  return UUID_PATTERN.test(value);
}


export default async function BillingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { bookingId } = await params;
  const query = await searchParams;
  const success = typeof query.success === "string" ? decodeURIComponent(query.success) : "";
  const error = typeof query.error === "string" ? decodeURIComponent(query.error) : "";

  if (!isValidBookingId(bookingId)) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Billing & Final Amount" description="Manage charges, payments, invoice, and checkout for this booking." />
        <div className={cardClass}>
          Invalid booking reference.
          <div className="mt-3">
            <Link href="/admin/billing" className="rounded-xl border border-[#2e5a3d] px-3 py-2 font-semibold text-[#2e5a3d]">
              Back to Billing Search
            </Link>
          </div>
        </div>
        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  let billing: Awaited<ReturnType<typeof getBillingContext>> = { booking: null, charges: [], payments: [], invoices: [] };
  let loadFailed = false;

  try {
    billing = await getBillingContext(bookingId);
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Billing & Final Amount" description="Manage charges, payments, invoice, and checkout for this booking." />
        <div className={cardClass}>
          Unable to load billing details. Please refresh and try again.
          <div className="mt-3">
            <Link href="/admin/billing" className="rounded-xl border border-[#2e5a3d] px-3 py-2 font-semibold text-[#2e5a3d]">
              Back to Billing Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!billing.booking) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Billing & Final Amount" description="Manage charges, payments, invoice, and checkout for this booking." />
        <div className={cardClass}>
          Billing details could not be found for this booking.
          <div className="mt-3">
            <Link href="/admin/billing" className="rounded-xl border border-[#2e5a3d] px-3 py-2 font-semibold text-[#2e5a3d]">
              Back to Billing Search
            </Link>
          </div>
        </div>
        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Billing & Final Amount" description="Manage charges, payments, invoice, and checkout for this booking." />
      <BillingWorkspaceClient
        bookingId={bookingId}
        booking={(billing.booking ?? {}) as Record<string, unknown>}
        charges={(billing.charges ?? []) as Record<string, unknown>[]}
        payments={(billing.payments ?? []) as Record<string, unknown>[]}
        invoices={(billing.invoices ?? []) as Record<string, unknown>[]}
      />
      <ActionDialog success={success} error={error} />
    </div>
  );
}
