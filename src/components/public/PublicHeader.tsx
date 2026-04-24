"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/cottages", label: "Cottages" },
  { href: "/attractions", label: "Attractions" },
  { href: "/policies", label: "Policies" },
  { href: "/book", label: "Book" },
];

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-[#d9cfbf] bg-[linear-gradient(135deg,#203d2b_0%,#2f5a3d_58%,#b8965d_100%)] shadow-[0_10px_28px_rgba(31,59,42,0.18)]">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-4 sm:min-h-[76px] sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <div className="flex flex-col">
            <span className="font-serif text-[1.35rem] leading-none text-white sm:text-[1.6rem]">
              La Ki Trep
            </span>
            <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#ead9b8]">
              Resort
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white text-[#214531]"
                    : "text-[#fff7e8] hover:bg-white/14 hover:text-white",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-md transition hover:bg-white/18 lg:hidden"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[380px] opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="mx-4 mb-4 grid gap-1 rounded-2xl border border-white/15 bg-[#17311f]/95 p-2 shadow-xl backdrop-blur-xl sm:mx-6">
          {nav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-white text-[#214531]"
                    : "text-[#fff7e8] hover:bg-white/12",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}