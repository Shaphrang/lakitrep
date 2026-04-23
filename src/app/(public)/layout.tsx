//src\app\(public)\layout.tsx
import Link from "next/link";
import { BookingFlowProvider } from "@/components/public/booking/BookingFlowProvider";
import { getPrimaryProperty, getPublicCottages } from "@/lib/public-site";

const nav = [
  { href: "/", label: "Home" },
  { href: "/cottages", label: "Cottages" },
  { href: "/attractions", label: "Attractions" },
  { href: "/policies", label: "Policies" },
  { href: "/book", label: "Book" },
];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const property = await getPrimaryProperty();
  const cottages = property ? await getPublicCottages(property.id) : [];

  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#1f3529]">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="rounded-2xl border border-white/15 bg-[#132116]/45 shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="flex min-h-[68px] items-center justify-between px-4 sm:px-5">
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

              <div className="hidden items-center gap-2 lg:flex">
                <nav className="flex items-center gap-1">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-4 py-2 text-sm font-medium text-[#f6efe3] transition hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <Link
                  href="/book"
                  className="inline-flex items-center rounded-full border border-[#d8cda8]/50 bg-[#335c38]/90 px-5 py-2.5 text-sm font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#284b2d]"
                >
                  Book on WhatsApp
                </Link>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/book"
                  className="inline-flex items-center rounded-full border border-[#d8cda8]/40 bg-[#335c38]/90 px-4 py-2 text-sm font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#284b2d]"
                >
                  Book
                </Link>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:hidden">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-[#f7efe3] transition hover:bg-white/15"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <BookingFlowProvider cottages={cottages}>
        <main>{children}</main>
      </BookingFlowProvider>

      <footer className="relative mt-16 overflow-hidden border-t border-[#d8d0c3] bg-[#1f3529] text-[#f5efe4]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.05),_transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_0.9fr_1fr]">
            <div className="max-w-md">
              <p className="font-serif text-3xl leading-tight">La Ki Trep Resort</p>
              <p className="mt-3 text-sm leading-7 text-[#d9d1c4]">
                A quiet boutique resort in Meghalaya, designed for peaceful stays,
                nature, privacy, and memorable slow escapes.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e7dfd2]">
                  Boutique Stay
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e7dfd2]">
                  Private Cottages
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#e7dfd2]">
                  Meghalaya
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f5efe4]">
                Explore
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#d9d1c4]">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="inline-flex transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f5efe4]">
                Contact
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[#d9d1c4]">
                <p>Umran, Ri Bhoi District, Meghalaya</p>
                <p>Precise location shared after booking confirmation.</p>
                <p>WhatsApp booking available for direct reservations and stay enquiries.</p>
              </div>

              <div className="mt-5">
                <Link
                  href="/book"
                  className="inline-flex items-center rounded-full bg-[#f3eadb] px-5 py-2.5 text-sm font-semibold text-[#1f3529] transition hover:bg-white"
                >
                  Plan Your Stay
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-xs text-[#cfc5b6] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} La Ki Trep Resort. All rights reserved.</p>
            <p>Crafted for a calm and modern booking experience.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}