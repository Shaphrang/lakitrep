import Link from "next/link";
import { ActionDialog } from "@/components/admin/shared/ActionDialog";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { BillingWorkspaceClient } from "@/components/admin/billing/BillingWorkspaceClient";
import { getBillingContext } from "@/features/admin/bookings/services/resort-management-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidBookingId(value: string) {
  return UUID_PATTERN.test(value);
}

function getText(row: Record<string, unknown>, keys: string[], fallback = "—") {
  for (const key of keys) {
    const value = row[key];

    if (value !== null && value !== undefined && value !== "") {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];

    if (value !== null && value !== undefined && value !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function currency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  if (!value || value === "—") return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MessageCard({
  title,
  description,
  tone = "default",
}: {
  title: string;
  description: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-[#ddd4c6] bg-white text-[#5e6f63]"
      }`}
    >
      <h2 className="text-base font-semibold text-[#21392c]">{title}</h2>
      <p className="mt-1 text-sm leading-6">{description}</p>

      <div className="mt-4">
        <Link
          href="/admin/billing"
          className="inline-flex items-center justify-center rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
        >
          Back to Billing Search
        </Link>
      </div>
    </div>
  );
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

  const success =
    typeof query.success === "string" ? decodeURIComponent(query.success) : "";
  const error =
    typeof query.error === "string" ? decodeURIComponent(query.error) : "";

  if (!isValidBookingId(bookingId)) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Billing"
          description="Manage final amount, payments and checkout."
          actions={
            <Link
              href="/admin/billing"
              className="rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
            >
              Back to Search
            </Link>
          }
        />

        <MessageCard
          title="Invalid booking reference"
          description="The billing link is not valid. Please open the correct booking from Billing Search."
          tone="error"
        />

        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  let billing: Awaited<ReturnType<typeof getBillingContext>> = {
    booking: null,
    charges: [],
    payments: [],
    invoices: [],
  };

  let loadFailed = false;

  try {
    billing = await getBillingContext(bookingId);
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Billing"
          description="Manage final amount, payments and checkout."
          actions={
            <Link
              href="/admin/billing"
              className="rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
            >
              Back to Search
            </Link>
          }
        />

        <MessageCard
          title="Unable to load billing"
          description="Please refresh and try again. If the issue continues, open the booking again from Billing Search."
          tone="error"
        />

        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  if (!billing.booking) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Billing"
          description="Manage final amount, payments and checkout."
          actions={
            <Link
              href="/admin/billing"
              className="rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
            >
              Back to Search
            </Link>
          }
        />

        <MessageCard
          title="Billing not found"
          description="Billing details could not be found for this booking."
        />

        <ActionDialog success={success} error={error} />
      </div>
    );
  }

  const booking = (billing.booking ?? {}) as Record<string, unknown>;
  const charges = (billing.charges ?? []) as Record<string, unknown>[];
  const payments = (billing.payments ?? []) as Record<string, unknown>[];
  const invoices = (billing.invoices ?? []) as Record<string, unknown>[];

  const bookingCode = getText(booking, ["booking_code", "bookingCode"]);
  const guestName = getText(booking, [
    "guest_name",
    "guestName",
    "full_name",
  ]);
  const guestPhone = getText(booking, ["guest_phone", "phone"]);
  const cottageName = getText(booking, ["cottage_name", "cottageName"]);
  const checkIn = getText(booking, ["check_in_date", "checkIn"]);
  const checkOut = getText(booking, ["check_out_date", "checkOut"]);
  const status = getText(booking, ["status"], "pending");
  const paymentStatus = getText(
    booking,
    ["payment_status", "paymentStatus"],
    "unpaid",
  );

  const finalTotal = getNumber(booking, [
    "final_total",
    "finalTotal",
    "final_amount",
    "total_amount",
  ]);

  const paidAmount = getNumber(booking, [
    "amount_paid",
    "paid_amount",
    "paidAmount",
  ]);

  const pendingAmount =
    getNumber(booking, ["amount_pending", "pending_amount", "amountPending"]) ||
    Math.max(0, finalTotal - paidAmount);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Billing"
        description="Simple billing workspace for final amount, payment collection and checkout."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/billing"
              className="rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
            >
              Back
            </Link>

            <Link
              href={`/admin/bookings/${bookingId}`}
              className="rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
            >
              Booking
            </Link>
          </div>
        }
      />

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-[#21392c]">
                {bookingCode}
              </h2>
              <StatusBadge status={status} />
              <StatusBadge status={paymentStatus} />
            </div>

            <p className="mt-1 text-sm text-[#5f6f64]">
              {guestName} · {guestPhone}
            </p>

            <p className="mt-1 text-sm text-[#5f6f64]">
              {cottageName} · {formatDate(checkIn)} → {formatDate(checkOut)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#eee6da] bg-[#fbf8f2] p-3">
              <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#6f7d74]">
                Final
              </p>
              <p className="mt-1 text-sm font-bold text-[#21392c] sm:text-base">
                {currency(finalTotal)}
              </p>
            </div>

            <div className="rounded-xl border border-[#eee6da] bg-[#fbf8f2] p-3">
              <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#6f7d74]">
                Paid
              </p>
              <p className="mt-1 text-sm font-bold text-[#21392c] sm:text-base">
                {currency(paidAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-[#e8cf9d] bg-[#fff8eb] p-3">
              <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#8a6b42]">
                Due
              </p>
              <p className="mt-1 text-sm font-bold text-[#7a4b12] sm:text-base">
                {currency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <BillingWorkspaceClient
        bookingId={bookingId}
        booking={booking}
        charges={charges}
        payments={payments}
        invoices={invoices}
      />

      <ActionDialog success={success} error={error} />
    </div>
  );
}