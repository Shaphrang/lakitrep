import Link from "next/link";
import { BookNowButton } from "@/components/public/booking/BookNowButton";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 sm:pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-[#d9cfbf] bg-[linear-gradient(135deg,#203d2b_0%,#2f5a3d_48%,#b8965d_100%)] p-2.5 text-[#f5efdf] shadow-[0_18px_45px_rgba(31,59,42,0.18)] sm:rounded-3xl sm:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,244,211,0.18),transparent_42%),linear-gradient(135deg,rgba(245,231,199,0.08),rgba(22,44,30,0.55))]" />

        <div className="relative grid grid-cols-[1fr_auto] items-center gap-2 sm:gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="min-w-0">
            <p className="text-[0.55rem] uppercase tracking-[0.16em] text-[#e7d6b2] sm:text-xs sm:tracking-[0.2em]">
              Plan your stay
            </p>

            <h2 className="mt-0.5 font-serif text-[1.05rem] leading-tight text-white sm:mt-1 sm:text-4xl">
              Reserve directly with the resort team.
            </h2>

            <p className="mt-0.5 line-clamp-2 text-[0.65rem] leading-4 text-[#efe6d4] sm:mt-2 sm:line-clamp-none sm:max-w-2xl sm:text-base sm:leading-7">
              Pre-booking is required and walk-ins are not permitted. Exact
              location details are shared after booking confirmation.
            </p>

            <div className="mt-2 hidden flex-wrap gap-2 text-sm sm:flex">
              <span className="rounded-full border border-white/30 px-3 py-1">
                WhatsApp: 6009044450
              </span>
              <span className="rounded-full border border-white/30 px-3 py-1">
                Instagram: @lakitrep
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row sm:justify-end sm:gap-2">
            <BookNowButton
              className="rounded-lg bg-[#25D366] px-3 py-2 text-[0.65rem] font-bold text-white shadow-[0_10px_24px_rgba(37,211,102,0.28)] sm:rounded-xl sm:bg-[#d5bf91] sm:px-4 sm:text-sm sm:text-[#1f3528]"
              label="Book"
              lockCottage={false}
            />

            <Link
              href="/policies"
              className="rounded-lg border border-white/30 px-3 py-2 text-center text-[0.65rem] font-semibold text-white sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Policies
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}