import Link from "next/link";
import { BookNowButton } from "@/components/public/booking/BookNowButton";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16">
      <div className="relative overflow-hidden rounded-3xl border border-[#d9cfbf] bg-[#1f3b2a] p-6 text-[#f5efdf] sm:p-8">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,231,199,0.08),rgba(22,44,30,0.7))]" />
        <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#e7d6b2]">Plan your stay</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Reserve directly with the resort team.</h2>
            <p className="mt-3 max-w-2xl text-sm text-[#efe6d4] sm:text-base">
              Pre-booking is required and walk-ins are not permitted. Exact location details are shared after booking confirmation.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-white/30 px-3 py-1">WhatsApp: 6009044450</span>
              <span className="rounded-full border border-white/30 px-3 py-1">Instagram: @lakitrep</span>
            </div>
          </div>
          <div className="flex gap-2">
            <BookNowButton className="rounded-xl bg-[#d5bf91] px-4 py-2 text-sm font-semibold text-[#1f3528]" label="Book via WhatsApp" lockCottage={false} />
            <Link href="/policies" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white">
              Read policies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
