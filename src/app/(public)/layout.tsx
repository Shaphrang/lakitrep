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
    <div className="min-h-screen bg-[#f6f3ec] text-[#1f3529]">
      <header className="sticky top-0 z-30 border-b border-[#d9d1c4] bg-[#f6f3ec]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="font-serif text-xl tracking-wide text-[#214431] sm:text-2xl">
              La Ki Trep Resort
            </Link>
            <Link
              href="/book"
              className="hidden rounded-full bg-[#275437] px-4 py-2 text-sm font-semibold text-[#f8f5ee] transition hover:bg-[#1f452e] sm:inline-flex"
            >
              Book on WhatsApp
            </Link>
          </div>
          <nav className="mt-3 flex flex-wrap items-center gap-1 text-sm text-[#244331] sm:mt-2 sm:gap-2">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-3 py-1.5 transition hover:bg-[#e8e1d6]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#d9d1c4] bg-[#244331] text-[#f4efe6]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 sm:py-10">
          <div>
            <p className="font-serif text-2xl">La Ki Trep Resort</p>
            <p className="mt-2 text-sm text-[#e2d8c8]">A quiet boutique resort in Meghalaya.</p>
          </div>
          <div className="text-sm text-[#e2d8c8]">
            <p className="font-semibold text-[#f4efe6]">Quick links</p>
            <ul className="mt-2 space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm text-[#e2d8c8]">
            <p className="font-semibold text-[#f4efe6]">Contact</p>
            <p className="mt-2">Umran, Ri Bhoi District, Meghalaya</p>
            <p className="mt-1">Precise location shared after booking confirmation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
