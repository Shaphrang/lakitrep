import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getResortDashboardMetrics } from "@/features/admin/bookings/services/resort-management-service";
import { requireAdmin } from "@/lib/auth/admin";

type IconName =
  | "calendar"
  | "doorIn"
  | "doorOut"
  | "bell"
  | "home"
  | "bill"
  | "chart"
  | "block"
  | "wallet"
  | "reports"
  | "booking"
  | "customer"
  | "cottage"
  | "arrow"
  | "rupee";

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function currency(value: unknown) {
  return `₹${numberValue(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function compactCurrency(value: unknown) {
  const amount = numberValue(value);

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  return currency(amount);
}

function percent(value: unknown) {
  return `${numberValue(value).toFixed(0)}%`;
}

function safeProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "calendar":
      return (
        <svg {...common}>
          <path d="M7 4v3" />
          <path d="M17 4v3" />
          <path d="M4 9h16" />
          <path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
        </svg>
      );

    case "doorIn":
      return (
        <svg {...common}>
          <path d="M14 3h5v18h-5" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </svg>
      );

    case "doorOut":
      return (
        <svg {...common}>
          <path d="M10 3H5v18h5" />
          <path d="M14 17l5-5-5-5" />
          <path d="M19 12H7" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "home":
      return (
        <svg {...common}>
          <path d="M3 12 12 4l9 8" />
          <path d="M5 10.5V20h14v-9.5" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "bill":
      return (
        <svg {...common}>
          <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-3 2V5a2 2 0 0 1 2-2z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-5" />
          <path d="M12 16V8" />
          <path d="M16 16v-3" />
        </svg>
      );

    case "block":
      return (
        <svg {...common}>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path d="m5.7 5.7 12.6 12.6" />
        </svg>
      );

    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z" />
          <path d="M4 7V5a2 2 0 0 1 2-2h11" />
          <path d="M16 13h.01" />
        </svg>
      );

    case "rupee":
      return (
        <svg {...common}>
          <path d="M7 5h10" />
          <path d="M7 9h10" />
          <path d="M8 5c6 0 6 8 0 8l7 6" />
        </svg>
      );

    case "reports":
      return (
        <svg {...common}>
          <path d="M4 4h16v16H4z" />
          <path d="M8 16v-4" />
          <path d="M12 16V8" />
          <path d="M16 16v-2" />
        </svg>
      );

    case "booking":
      return (
        <svg {...common}>
          <path d="M7 4v3" />
          <path d="M17 4v3" />
          <path d="M4 9h16" />
          <path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
          <path d="m9 14 2 2 4-5" />
        </svg>
      );

    case "customer":
      return (
        <svg {...common}>
          <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      );

    case "cottage":
      return (
        <svg {...common}>
          <path d="M3 12 12 4l9 8" />
          <path d="M5 10.5V20h14v-9.5" />
          <path d="M9 20v-6h6v6" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    default:
      return null;
  }
}

function MetricCard({
  title,
  value,
  hint,
  href,
  icon,
  tone = "default",
}: {
  title: string;
  value: string | number;
  hint: string;
  href: string;
  icon: IconName;
  tone?: "default" | "gold" | "green" | "warning";
}) {
  const toneClass =
    tone === "gold"
      ? "border-[#ead49b] bg-[#fff8e8]"
      : tone === "green"
        ? "border-[#c8dec9] bg-[#f1f8f1]"
        : tone === "warning"
          ? "border-[#f0c99e] bg-[#fff4e8]"
          : "border-[#ddd4c6] bg-white";

  const iconClass =
    tone === "gold"
      ? "bg-[#efdca5] text-[#7a4b12]"
      : tone === "green"
        ? "bg-[#dceee0] text-[#23583a]"
        : tone === "warning"
          ? "bg-[#ffe0bd] text-[#9a520b]"
          : "bg-[#edf2ec] text-[#2e5a3d]";

  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}>
          <Icon name={icon} className="h-5 w-5" />
        </div>

        <span className="rounded-full bg-white/70 px-2 py-1 text-[0.65rem] font-semibold text-[#557061] opacity-0 transition group-hover:opacity-100">
          Open
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-[#21392c]">{value}</p>
      <h3 className="mt-1 text-sm font-semibold text-[#21392c]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#6f7d74]">{hint}</p>
    </Link>
  );
}

function ActionItem({
  title,
  description,
  href,
  icon,
  tone = "default",
}: {
  title: string;
  description: string;
  href: string;
  icon: IconName;
  tone?: "default" | "warning" | "green";
}) {
  const iconClass =
    tone === "warning"
      ? "bg-[#fff0d8] text-[#9a520b]"
      : tone === "green"
        ? "bg-[#e7f3e7] text-[#2e5a3d]"
        : "bg-[#f4efe4] text-[#3f5348]";

  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-2xl border border-[#eee6da] bg-[#fffdf8] p-3 transition hover:border-[#d5c6ad] hover:bg-[#fbf8f2]"
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconClass}`}>
        <Icon name={icon} className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#21392c]">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-[#6f7d74]">
          {description}
        </span>
      </span>

      <Icon
        name="arrow"
        className="mt-2 h-4 w-4 text-[#9aa99e] transition group-hover:translate-x-0.5 group-hover:text-[#2e5a3d]"
      />
    </Link>
  );
}

function ProgressBlock({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  const safe = safeProgress(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#21392c]">{label}</p>
        <p className="text-sm font-bold text-[#2e5a3d]">{safe.toFixed(0)}%</p>
      </div>

      <div className="h-3 rounded-full bg-[#edf2ec]">
        <div
          className="h-3 rounded-full bg-[linear-gradient(90deg,#2e5a3d,#d6b66a)]"
          style={{ width: `${safe}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-[#6f7d74]">{helper}</p>
    </div>
  );
}

function TrendChart({
  rows,
}: {
  rows: { key: string; label: string; revenue: number; collection: number; bookings: number }[];
}) {
  const maxValue = Math.max(
    1,
    ...rows.map((row) => Math.max(row.revenue, row.collection)),
  );

  return (
    <div className="mt-5 space-y-4">
      {rows.map((row) => {
        const revenueWidth = safeProgress((row.revenue / maxValue) * 100);
        const collectionWidth = safeProgress((row.collection / maxValue) * 100);

        return (
          <div
            key={row.key}
            className="grid grid-cols-[44px_1fr] gap-3 text-xs sm:grid-cols-[54px_1fr_90px_90px]"
          >
            <span className="font-medium text-[#536458]">{row.label}</span>

            <div className="space-y-1.5">
              <div className="h-2.5 rounded-full bg-[#edf2ec]">
                <div
                  className="h-2.5 rounded-full bg-[#2e5a3d]"
                  style={{ width: `${revenueWidth}%` }}
                />
              </div>
              <div className="h-2.5 rounded-full bg-[#f4efe4]">
                <div
                  className="h-2.5 rounded-full bg-[#d6b66a]"
                  style={{ width: `${collectionWidth}%` }}
                />
              </div>
            </div>

            <span className="hidden text-right font-semibold text-[#21392c] sm:block">
              {compactCurrency(row.revenue)}
            </span>

            <span className="hidden text-right font-semibold text-[#9a6a1f] sm:block">
              {compactCurrency(row.collection)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MiniBreakdown({
  title,
  rows,
  valueLabel,
}: {
  title: string;
  rows: { label: string; value: number; helper?: string }[];
  valueLabel: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#21392c]">{title}</h3>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#c7baa1] bg-[#fbf8f2] p-4 text-sm text-[#6f7d74]">
            No data available.
          </p>
        ) : (
          rows.map((row) => {
            const width = safeProgress((row.value / max) * 100);

            return (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium capitalize text-[#21392c]">
                    {row.label.replaceAll("_", " ")}
                  </p>
                  <p className="text-sm font-semibold text-[#2e5a3d]">
                    {valueLabel === "currency"
                      ? compactCurrency(row.value)
                      : row.value}
                  </p>
                </div>

                <div className="h-2 rounded-full bg-[#edf2ec]">
                  <div
                    className="h-2 rounded-full bg-[#2e5a3d]"
                    style={{ width: `${width}%` }}
                  />
                </div>

                {row.helper ? (
                  <p className="mt-1 text-xs text-[#6f7d74]">{row.helper}</p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  if (admin.role === "staff") {
    redirect("/admin/bookings");
  }

  const metrics = await getResortDashboardMetrics();

  const todayCheckins = numberValue(metrics.todayCheckins);
  const todayCheckouts = numberValue(metrics.todayCheckouts);
  const newRequests = numberValue(metrics.newRequests);
  const upcomingConfirmed = numberValue(metrics.upcomingConfirmed);
  const inHouse = numberValue(metrics.inHouse);
  const pendingBills = numberValue(metrics.pendingBills);
  const pendingAmount = numberValue(metrics.pendingAmount);
  const arrivalsWithDue = numberValue(metrics.arrivalsWithDue);
  const occupancy = numberValue(metrics.occupancy);
  const blockedCottages = numberValue(metrics.blockedCottages);
  const todayCollection = numberValue(metrics.todayCollection);
  const monthRevenue = numberValue(metrics.monthRevenue);
  const monthCollection = numberValue(metrics.monthCollection);
  const monthOutstanding = numberValue(metrics.monthOutstanding);
  const monthBookings = numberValue(metrics.monthBookings);
  const avgBookingValue = numberValue(metrics.avgBookingValue);
  const collectionRateValue = numberValue(metrics.collectionRate);

  const trend = metrics.trend ?? [];
  const sourceBreakdown = metrics.sourceBreakdown ?? [];
  const statusBreakdown = metrics.statusBreakdown ?? [];

  const bookingPipelineTotal = Math.max(1, newRequests + upcomingConfirmed);
  const confirmedRatio = safeProgress(
    (upcomingConfirmed / bookingPipelineTotal) * 100,
  );
  const pendingRatio = safeProgress((newRequests / bookingPipelineTotal) * 100);

  const todayMovement = todayCheckins + todayCheckouts;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Dashboard"
        description="Business overview for bookings, guest movement, revenue, collection, pending dues and cottage utilization."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl bg-[#2e5a3d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#244832]"
            >
              Open Reports
            </Link>

            <Link
              href="/admin/bookings/new"
              className="inline-flex items-center justify-center rounded-xl border border-[#d8cfbf] bg-white px-4 py-2 text-sm font-semibold text-[#2e5a3d] shadow-sm transition hover:bg-[#f4efe4]"
            >
              Add Booking
            </Link>
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-3xl border border-[#ddd4c6] bg-[linear-gradient(135deg,#1f3f2f_0%,#244d37_52%,#173024_100%)] p-5 text-[#f8f4ec] shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#dcbf7b]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#7eb485]/20 blur-3xl" />

        <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7d6a8]">
              Today · {todayLabel()}
            </p>
            <h2 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
              Resort operations and business health
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#e6ecdf]">
              Track revenue, collections, outstanding dues, guest movement,
              bookings and cottage utilization from one clean dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-[#d7e5d8]">Month Revenue</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {currency(monthRevenue)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-[#d7e5d8]">Month Collection</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {currency(monthCollection)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-[#d7e5d8]">Pending Amount</p>
              <p className="mt-1 text-2xl font-bold text-[#ffe7aa]">
                {currency(pendingAmount)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs text-[#d7e5d8]">Occupancy</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {percent(occupancy)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Today Check-ins"
          value={todayCheckins}
          href="/admin/checkin-checkout"
          hint="Arrivals due today"
          icon="doorIn"
          tone="green"
        />

        <MetricCard
          title="Today Check-outs"
          value={todayCheckouts}
          href="/admin/checkin-checkout"
          hint="Departures due today"
          icon="doorOut"
          tone="gold"
        />

        <MetricCard
          title="New Requests"
          value={newRequests}
          href="/admin/bookings?status=new_request"
          hint="Need follow-up"
          icon="bell"
          tone={newRequests > 0 ? "warning" : "default"}
        />

        <MetricCard
          title="Pending Bills"
          value={pendingBills}
          href="/admin/billing"
          hint="Need collection"
          icon="bill"
          tone={pendingBills > 0 ? "warning" : "default"}
        />

        <MetricCard
          title="Arrivals With Due"
          value={arrivalsWithDue}
          href="/admin/checkin-checkout"
          hint="Guests arriving with pending payment"
          icon="wallet"
          tone={arrivalsWithDue > 0 ? "warning" : "green"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f72]">
                Business Trend
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[#21392c]">
                Revenue vs Collection
              </h3>
              <p className="mt-1 text-xs text-[#6f7d74]">
                Last 6 months based on created records and payment collection.
              </p>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-[#2e5a3d]">
                <span className="h-2 w-2 rounded-full bg-[#2e5a3d]" />
                Revenue
              </span>
              <span className="flex items-center gap-1 text-[#9a6a1f]">
                <span className="h-2 w-2 rounded-full bg-[#d6b66a]" />
                Collection
              </span>
            </div>
          </div>

          <TrendChart rows={trend} />
        </article>

        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f72]">
            Month Summary
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#21392c]">
            Revenue quality
          </h3>

          <div className="mt-5 space-y-5">
            <ProgressBlock
              label="Collection Rate"
              value={collectionRateValue}
              helper={`${currency(monthCollection)} collected from ${currency(monthRevenue)} revenue.`}
            />

            <ProgressBlock
              label="Occupancy"
              value={occupancy}
              helper="Higher occupancy means better cottage utilization."
            />

            <ProgressBlock
              label="Confirmed Booking Share"
              value={confirmedRatio}
              helper={`${upcomingConfirmed} confirmed out of active booking pipeline.`}
            />
          </div>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Month Bookings"
          value={monthBookings}
          href="/admin/bookings"
          hint="Bookings created this month"
          icon="booking"
          tone="default"
        />

        <MetricCard
          title="Avg Booking Value"
          value={currency(avgBookingValue)}
          href="/admin/reports/revenue"
          hint="Month revenue divided by bookings"
          icon="rupee"
          tone="green"
        />

        <MetricCard
          title="Month Outstanding"
          value={currency(monthOutstanding)}
          href="/admin/billing"
          hint="Unpaid amount from this month's bookings"
          icon="bill"
          tone={monthOutstanding > 0 ? "warning" : "green"}
        />

        <MetricCard
          title="Current In-house"
          value={inHouse}
          href="/admin/checkin-checkout"
          hint="Guests currently checked-in"
          icon="home"
          tone="green"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f72]">
            Action Required
          </p>
          <h3 className="mt-1 text-lg font-semibold text-[#21392c]">
            What needs attention
          </h3>

          <div className="mt-4 space-y-3">
            <ActionItem
              title={`${newRequests} new booking request${newRequests === 1 ? "" : "s"}`}
              description="Follow up and confirm or reject new booking requests."
              href="/admin/bookings?status=new_request"
              icon="bell"
              tone={newRequests > 0 ? "warning" : "default"}
            />

            <ActionItem
              title={`${pendingBills} pending bill${pendingBills === 1 ? "" : "s"}`}
              description={`Pending amount to be collected: ${currency(pendingAmount)}.`}
              href="/admin/billing"
              icon="bill"
              tone={pendingBills > 0 ? "warning" : "default"}
            />

            <ActionItem
              title={`${arrivalsWithDue} arrival${arrivalsWithDue === 1 ? "" : "s"} with due payment`}
              description="Collect payment before or during check-in."
              href="/admin/checkin-checkout"
              icon="wallet"
              tone={arrivalsWithDue > 0 ? "warning" : "green"}
            />

            <ActionItem
              title={`${blockedCottages} cottage${blockedCottages === 1 ? "" : "s"} blocked`}
              description="Review blocked cottages and availability calendar."
              href="/admin/availability"
              icon="block"
              tone={blockedCottages > 0 ? "warning" : "default"}
            />
          </div>
        </article>

        <section className="grid gap-4 md:grid-cols-2">
          <MiniBreakdown
            title="Top Booking Sources"
            valueLabel="currency"
            rows={sourceBreakdown.map((item) => ({
              label: item.source,
              value: item.revenue,
              helper: `${item.bookings} booking${item.bookings === 1 ? "" : "s"} · Outstanding ${compactCurrency(item.outstanding)}`,
            }))}
          />

          <MiniBreakdown
            title="Booking Status"
            valueLabel="number"
            rows={statusBreakdown.map((item) => ({
              label: item.status,
              value: item.count,
            }))}
          />
        </section>
      </section>

      <section className="rounded-2xl border border-[#ddd4c6] bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f72]">
          Quick Navigation
        </p>
        <h3 className="mt-1 text-lg font-semibold text-[#21392c]">
          Common admin actions
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ActionItem
            title="Create manual booking"
            description="Add a booking received by phone, walk-in or WhatsApp."
            href="/admin/bookings/new"
            icon="booking"
            tone="green"
          />

          <ActionItem
            title="Manage billing"
            description="Open pending bills, record payment and print bill."
            href="/admin/billing"
            icon="bill"
          />

          <ActionItem
            title="Today check-in/out"
            description={`${todayCheckins} arrivals and ${todayCheckouts} departures today.`}
            href="/admin/checkin-checkout"
            icon="calendar"
          />

          <ActionItem
            title="Customers"
            description="Search guests and view booking history."
            href="/admin/customers"
            icon="customer"
          />

          <ActionItem
            title="Cottages"
            description="Manage cottage information and availability."
            href="/admin/cottages"
            icon="cottage"
          />

          <ActionItem
            title="Reports"
            description="Analyze revenue, bookings and cottage performance."
            href="/admin/reports"
            icon="reports"
          />
        </div>
      </section>
    </div>
  );
}
