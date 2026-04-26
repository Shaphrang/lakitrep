import Link from "next/link";
import { REPORT_PAGE_LINKS } from "../reports.constants";

export function ReportsNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1">
      {REPORT_PAGE_LINKS.map((item) => (
        <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-[#d8cfbf] bg-white px-3 py-1.5 text-xs font-medium text-[#2d4838]">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
