"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REPORT_PAGE_LINKS } from "../reports.constants";

export function ReportsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {REPORT_PAGE_LINKS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
              active
                ? "border-[#2d4e3b] bg-[#2d4e3b] text-[#f8f4ec]"
                : "border-[#d8cfbf] bg-white text-[#2d4838]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
