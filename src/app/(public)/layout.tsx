import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/cottages", label: "Cottages" },
  { href: "/attractions", label: "Attractions" },
  { href: "/policies", label: "Policies" },
  { href: "/book", label: "Book" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-emerald-950/95 text-stone-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-emerald-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="text-base font-semibold tracking-wide text-amber-200">
            La Ki Trep Resort
          </Link>
          <nav className="flex items-center gap-2 text-sm text-stone-200 sm:gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 transition hover:bg-white/10">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/10 bg-emerald-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-300 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>La Ki Trep Resort, Umran • Meghalaya</p>
          <Link href="/book" className="inline-flex w-fit rounded-full bg-amber-300 px-4 py-2 font-medium text-emerald-950">
            Plan your stay
          </Link>
        </div>
      </footer>
    </div>
  );
}
