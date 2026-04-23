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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={[
          "transition-all duration-300",
          scrolled
            ? "w-full bg-[#132116]/92 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
            : "bg-transparent",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto flex items-center justify-between transition-all duration-300",
            scrolled
              ? "min-h-[78px] max-w-none px-4 sm:px-6 lg:px-10"
              : "min-h-[84px] max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8",
          ].join(" ")}
        >
          <Link href="/" className="min-w-0">
            <div className="flex flex-col">
              <span className="font-serif text-[1.3rem] leading-none tracking-[0.01em] text-[#f7f1e7] sm:text-[1.55rem]">
                La Ki Trep
              </span>
              <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#dbcfae] sm:text-[0.68rem]">
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
                      ? "bg-white/12 text-white"
                      : "text-[#f6efe3] hover:bg-white/10 hover:text-white",
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#fffaf0] backdrop-blur-md transition hover:bg-white/15 lg:hidden"
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