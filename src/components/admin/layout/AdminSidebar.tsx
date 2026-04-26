"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIcon =
  | "dashboard"
  | "bookings"
  | "customers"
  | "calendar"
  | "check"
  | "billing"
  | "reports"
  | "property"
  | "cottage"
  | "attractions"
  | "policies";

const adminNavItems: {
  href: string;
  label: string;
  icon: NavIcon;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: "bookings" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/availability", label: "Availability", icon: "calendar" },
  { href: "/admin/checkin-checkout", label: "Check-in / Out", icon: "check" },
  { href: "/admin/billing", label: "Billing", icon: "billing" },
  { href: "/admin/reports", label: "Reports", icon: "reports" },
  { href: "/admin/properties", label: "Properties", icon: "property" },
  { href: "/admin/cottages", label: "Cottages", icon: "cottage" },
  { href: "/admin/attractions", label: "Attractions", icon: "attractions" },
  { href: "/admin/policies", label: "Policies", icon: "policies" },
];

export function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#284a36] bg-[#163023] text-[#f8f4ec] shadow-xl lg:block">
        <SidebarBody pathname={pathname} onClose={onClose} />
      </aside>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0f1f17]/50 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[84vw] max-w-xs border-r border-[#284a36] bg-[#163023] text-[#f8f4ec] shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBody pathname={pathname} onClose={onClose} />
      </aside>
    </>
  );
}

function SidebarBody({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-16 top-24 h-44 w-44 rounded-full bg-[#dcbf7b]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-52 w-52 rounded-full bg-[#6fa177]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-3 top-28 h-24 w-24 rounded-full border border-white/[0.05]" />
      <div className="pointer-events-none absolute -right-8 top-44 h-28 w-28 rounded-full border border-[#dcbf7b]/[0.06]" />

      <div className="relative z-10 border-b border-white/10 bg-[linear-gradient(135deg,#244b36_0%,#163023_70%,#10251b_100%)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#dcbf7b] text-[#163023] shadow-sm">
            <Icon name="cottage" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[#e9d8ac]">
              La Ki Trep
            </p>
            <h2 className="truncate font-serif text-xl leading-tight text-white">
              Admin Panel
            </h2>
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1 px-2.5 py-2.5">
        <p className="mb-1.5 px-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#aebfaf]">
          Menu
        </p>

        <nav className="space-y-0.5">
          {adminNavItems.map((item) => {
            const active = isNavActive(pathname, item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.9rem] font-medium transition",
                  active
                    ? "bg-[#f0d28a] text-[#172d22] shadow-sm"
                    : "text-[#e9efe8] hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition",
                    active
                      ? "bg-white/45 text-[#172d22]"
                      : "bg-white/[0.07] text-[#d7e2d9] group-hover:bg-white/[0.14] group-hover:text-white",
                  ].join(" ")}
                >
                  <Icon name={item.icon} className="h-3.5 w-3.5" />
                </span>

                <span className="truncate">{item.label}</span>

                {active ? (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#172d22]" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="relative z-10 border-t border-white/10 px-3 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-2.5 py-2">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#dcbf7b]/20 text-[#e9d8ac]">
            <Icon name="reports" className="h-3.5 w-3.5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[0.72rem] font-semibold text-[#f8f4ec]">
              Resort Workspace
            </p>
            <p className="truncate text-[0.64rem] text-[#c9d5ca]">
              Bookings · Billing · Reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;

  if (href === "/admin/bookings") {
    return pathname === "/admin/bookings" || pathname.startsWith("/admin/bookings/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Icon({
  name,
  className,
}: {
  name: NavIcon;
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
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M4 13h6V4H4z" />
          <path d="M14 20h6v-9h-6z" />
          <path d="M4 20h6v-3H4z" />
          <path d="M14 7h6V4h-6z" />
        </svg>
      );

    case "bookings":
      return (
        <svg {...common}>
          <path d="M7 4v3" />
          <path d="M17 4v3" />
          <path d="M4 9h16" />
          <path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
          <path d="m9 14 2 2 4-5" />
        </svg>
      );

    case "customers":
      return (
        <svg {...common}>
          <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
          <path d="M20 19c0-1.7-1-3.1-2.5-3.7" />
          <path d="M17 5.2a3 3 0 0 1 0 5.6" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <path d="M7 4v3" />
          <path d="M17 4v3" />
          <path d="M4 9h16" />
          <path d="M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
          <path d="M8 13h3" />
          <path d="M13 13h3" />
          <path d="M8 17h3" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="M9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );

    case "billing":
      return (
        <svg {...common}>
          <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5a2 2 0 0 1 2-2z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      );

    case "reports":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 16v-5" />
          <path d="M12 16V8" />
          <path d="M16 16v-3" />
        </svg>
      );

    case "property":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-7h6v7" />
          <path d="M9 9h.01" />
          <path d="M15 9h.01" />
        </svg>
      );

    case "cottage":
      return (
        <svg {...common}>
          <path d="M3 12 12 4l9 8" />
          <path d="M5 10.5V20h14v-9.5" />
          <path d="M9 20v-6h6v6" />
          <path d="M7 8l5-4 5 4" />
        </svg>
      );

    case "attractions":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
          <path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path d="M9 15h6" />
        </svg>
      );

    case "policies":
      return (
        <svg {...common}>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
          <path d="M9 8h2" />
        </svg>
      );

    default:
      return null;
  }
}