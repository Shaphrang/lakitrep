"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { REPORT_PAGE_LINKS } from "@/features/admin/reports/reports.constants";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/bookings/new", label: "Add Manual Booking" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/availability", label: "Calendar / Availability" },
  { href: "/admin/checkin-checkout", label: "Check-in / Checkout" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/payments", label: "Payments / Collection" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/cottages", label: "Cottages" },
  { href: "/admin/attractions", label: "Attractions" },
  { href: "/admin/policies", label: "Policies" },
  { href: "/admin/seo", label: "SEO" },
];

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[#d7cfbf] bg-[linear-gradient(180deg,#203f2e_0%,#173024_100%)] p-4 text-[#f8f4ec] shadow-2xl lg:block">
        <SidebarBody pathname={pathname} onClose={onClose} />
      </aside>

      {isOpen ? <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-40 bg-[#0f1f17]/50 lg:hidden" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs border-r border-[#355744] bg-[linear-gradient(180deg,#1f3f2f_0%,#162f24_100%)] p-4 text-[#f8f4ec] shadow-2xl transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBody pathname={pathname} onClose={onClose} />
      </aside>
    </>
  );
}

function SidebarBody({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const reportsActive = pathname.startsWith("/admin/reports");
  const [reportsOpen, setReportsOpen] = useState(reportsActive);

  const reportItems = useMemo(
    () => REPORT_PAGE_LINKS.map((item) => ({ href: item.href, label: item.label })),
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 rounded-2xl border border-[#3d614d] bg-white/10 p-4 backdrop-blur-sm">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#e4d6b0]">La Ki Trep Resort</p>
        <h2 className="mt-2 font-serif text-2xl leading-tight">Admin Panel</h2>
      </div>

      <nav className="space-y-1.5 overflow-y-auto pr-1">
        {adminNavItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[#dcbf7b] text-[#1f3529] shadow-[0_8px_20px_-12px_rgba(0,0,0,0.8)]"
                  : "text-[#f2ece2] hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setReportsOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
            reportsActive ? "bg-[#dcbf7b] text-[#1f3529]" : "text-[#f2ece2] hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>Reports</span>
          <span className={`text-xs transition ${reportsOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>

        {reportsOpen ? (
          <div className="max-h-72 space-y-1 overflow-y-auto pl-3 pr-1">
            {reportItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-[#f4ebd5] font-semibold text-[#1f3529]" : "text-[#d6e3d8] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>

      <div className="mt-auto rounded-xl border border-[#3b5a49] bg-white/5 p-3 text-xs text-[#d4c9b2]">
        Manage inventory, guests, billing, and reporting.
      </div>
    </div>
  );
}
