"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/cottages", label: "Cottages" },
  { href: "/attractions", label: "Attractions" },
  { href: "/policies", label: "Policies" },
  { href: "/book", label: "Book" },
];

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const useTransparent = isHome && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={[
          "transition-all duration-300",
          useTransparent
            ? "bg-transparent"
            : isHome
              ? "w-full bg-[#132116]/92 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              : "w-full border-b border-[#e2d8c8] bg-[#f8f3ea]/95 shadow-[0_8px_24px_rgba(29,45,33,0.08)] backdrop-blur-xl",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto flex items-center justify-between transition-all duration-300",
            !useTransparent
              ? "min-h-[78px] max-w-none px-4 sm:px-6 lg:px-10"
              : "min-h-[84px] max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8",
          ].join(" ")}
        >
          <Link href="/" className="min-w-0">
            <div className="flex flex-col">
              <span className={`font-serif text-[1.3rem] leading-none tracking-[0.01em] sm:text-[1.55rem] ${isHome ? "text-[#f7f1e7]" : "text-[#234432]"}`}>
                La Ki Trep
              </span>
              <span className={`mt-1 text-[0.62rem] font-medium uppercase tracking-[0.3em] sm:text-[0.68rem] ${isHome ? "text-[#dbcfae]" : "text-[#6f816f]"}`}>
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
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? isHome
                        ? "bg-white/12 text-white"
                        : "bg-[#214531] text-white"
                      : isHome
                        ? "text-[#f6efe3] hover:bg-white/10 hover:text-white"
                        : "text-[#2f4f3b] hover:bg-[#e9e2d7]",
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
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition lg:hidden ${
              isHome
                ? "border border-white/15 bg-white/10 text-[#fffaf0] hover:bg-white/15"
                : "border border-[#d8cdbb] bg-white text-[#214531] hover:bg-[#f7f2e8]"
            }`}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        <div
          className={[
            "overflow-hidden transition-all duration-300 lg:hidden",
            menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-[#132116]/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:mx-6">
            <nav className="flex flex-col gap-1">
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
                        ? "bg-white/12 text-white"
                        : "text-[#f7efe3] hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
