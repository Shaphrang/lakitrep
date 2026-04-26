"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const reportLinks = [
  {
    href: "/admin/reports",
    label: "Dashboard",
    helper: "Overview",
  },
  {
    href: "/admin/reports/bookings",
    label: "Bookings",
    helper: "Booking data",
  },
  {
    href: "/admin/reports/revenue",
    label: "Revenue",
    helper: "Money & dues",
  },
  {
    href: "/admin/reports/cottages",
    label: "Cottages",
    helper: "Performance",
  },
  {
    href: "/admin/reports/checkin-checkout",
    label: "Check-in / Check-out",
    helper: "Daily ops",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin/reports") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <section className="rounded-2xl border border-[#ddd4c6] bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center justify-between px-2 pt-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f7f72]">
            Reports
          </p>
          <p className="text-xs text-[#7b877f]">
            Simple business reports for quick decisions
          </p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {reportLinks.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "min-w-[145px] rounded-2xl border px-4 py-3 transition",
                "focus:outline-none focus:ring-2 focus:ring-[#2e5a3d]/20",
                active
                  ? "border-[#2e5a3d] bg-[#2e5a3d] text-white shadow-sm"
                  : "border-[#e3dacb] bg-[#fbf8f2] text-[#2b4637] hover:border-[#c9bfae] hover:bg-[#f4efe4]",
              ].join(" ")}
            >
              <span className="block text-sm font-semibold leading-tight">
                {item.label}
              </span>
              <span
                className={[
                  "mt-1 block text-[0.72rem] leading-tight",
                  active ? "text-[#e9f2e9]" : "text-[#748176]",
                ].join(" ")}
              >
                {item.helper}
              </span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}