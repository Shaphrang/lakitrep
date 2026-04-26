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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#d7cfbf]/30 bg-[#173024] p-3 text-[#f8f4ec] shadow-2xl lg:block">
        <SidebarBody pathname={pathname} onClose={onClose} />
      </aside>

      {isOpen ? (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#0f1f17]/55 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-xs border-r border-[#355744] bg-[#173024] p-3 text-[#f8f4ec] shadow-2xl transition-transform duration-300 lg:hidden ${
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
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,#214531_0%,#162f24_58%,#10251b_100%)] p-3 shadow-inner">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#dcbf7b]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#5b8b66]/20 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="absolute left-6 top-24 h-24 w-24 rounded-full border border-white" />
        <div className="absolute bottom-28 right-5 h-32 w-32 rounded-full border border-[#dcbf7b]" />
        <div className="absolute bottom-8 left-8 h-px w-44 rotate-[-18deg] bg-white" />
        <div className="absolute bottom-14 left-10 h-px w-36 rotate-[-18deg] bg-[#dcbf7b]" />
      </div>

      <div className="relative mb-3 rounded-2xl border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcbf7b] text-[#193025] shadow-lg shadow-black/10">
            <Icon name="cottage" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#e9d8ac]">
              La Ki Trep
            </p>
            <h2 className="truncate font-serif text-xl leading-tight text-white">
              Admin
            </h2>
          </div>
        </div>
      </div>

      <nav className="relative flex-1 space-y-1">
        {adminNavItems.map((item) => {
          const active = isNavActive(pathname, item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={[
                "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[0.82rem] font-medium transition",
                active
                  ? "bg-[#dcbf7b] text-[#182d22] shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]"
                  : "text-[#efe8d8] hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition",
                  active
                    ? "bg-[#f8edce]/70 text-[#182d22]"
                    : "bg-white/[0.08] text-[#e8dcc2] group-hover:bg-white/[0.14] group-hover:text-white",
                ].join(" ")}
              >
                <Icon name={item.icon} className="h-4 w-4" />
              </span>

              <span className="truncate">{item.label}</span>

              {active ? (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#182d22]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#dcbf7b]/20 text-[#e8d29b]">
            <Icon name="reports" className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#f8f4ec]">
              Resort Control
            </p>
            <p className="mt-0.5 text-[0.68rem] leading-4 text-[#d4c9b2]">
              Manage guests, bookings, billing and reports.
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

    default:
      return null;
  }
}