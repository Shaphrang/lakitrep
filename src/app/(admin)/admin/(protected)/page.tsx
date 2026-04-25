import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { getResortDashboardMetrics } from "@/features/admin/bookings/services/resort-management-service";

export default async function AdminDashboardPage() {
  const metrics = await getResortDashboardMetrics();

  const cards = [
    { name: "Today's check-ins", count: metrics.todayCheckins, href: "/admin/checkin-checkout", hint: "Arrivals due today" },
    { name: "Today's check-outs", count: metrics.todayCheckouts, href: "/admin/checkin-checkout", hint: "Departures due today" },
    { name: "New booking requests", count: metrics.newRequests, href: "/admin/bookings?status=new_request", hint: "Need follow-up" },
    { name: "Confirmed upcoming", count: metrics.upcomingConfirmed, href: "/admin/bookings?status=confirmed", hint: "Future confirmed stays" },
    { name: "Current in-house", count: metrics.inHouse, href: "/admin/checkin-checkout", hint: "Checked-in guests" },
    { name: "Pending bills", count: metrics.pendingBills, href: "/admin/billing", hint: "Need collection" },
    { name: "Current occupancy", count: `${metrics.occupancy}%`, href: "/admin/reports", hint: "Active cottage utilization" },
    { name: "Cottages blocked", count: metrics.blockedCottages, href: "/admin/availability", hint: "Maintenance / private block" },
    { name: "Today's collection", count: `₹${metrics.todayCollection.toLocaleString("en-IN")}`, href: "/admin/payments", hint: "Payments received today" },
    { name: "This month revenue", count: `₹${metrics.monthRevenue.toLocaleString("en-IN")}`, href: "/admin/reports", hint: "Collections in current month" },
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Quick resort operations snapshot for front-office and billing teams." />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <article
            key={item.name}
            className="rounded-2xl border border-[#ddd4c6] bg-[linear-gradient(145deg,#fffdfa_0%,#f4efe4_100%)] p-5 shadow-[0_18px_32px_-28px_rgba(18,30,22,0.9)]"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#758478]">{item.hint}</p>
            <h2 className="mt-2 font-serif text-3xl text-[#244633]">{item.count}</h2>
            <p className="mt-1 text-sm font-medium text-[#3f5348]">{item.name}</p>
            <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-[#2d5c3d] hover:text-[#214531]">
              Open section →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
