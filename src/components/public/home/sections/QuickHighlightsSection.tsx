import { QUICK_HIGHLIGHTS } from "../home.constants";
import type { QuickHighlightIconType } from "../home.types";

function QuickHighlightIcon({ type }: { type: QuickHighlightIconType }) {
const baseClass =
  "h-6 w-6 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-[#c49a56]";

  switch (type) {
    case "stay":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={baseClass}>
          <path d="M10 30.5L32 13l22 17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 27v22h32V27" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 49V37h12v12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 33h.01M44 33h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 45c2-5 1-11-3-15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M55 51c4-2 6-5 7-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "pool":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={baseClass}>
          <path d="M23 14v24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M35 14v24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M23 18c0-2.2 1.8-4 4-4h4c2.2 0 4 1.8 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M23 26h12M23 34h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10 46c3 2 5 3 9 3s6-1 9-3c3 2 5 3 9 3s6-1 9-3c3 2 5 3 9 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 54c3 2 5 3 9 3s6-1 9-3c3 2 5 3 9 3s6-1 9-3c3 2 5 3 9 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "dining":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={baseClass}>
          <path d="M18 44h28" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 44c0-9 7-16 16-16s16 7 16 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M26 49h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M30 22c0-3 2-5 2-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M38 22c0-3 2-5 2-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M34 20c0-3 2-5 2-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "nature":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={baseClass}>
          <path d="M8 48c8-8 16-12 24-12 7 0 14 2 24 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 42V24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 24c4 1 7 4 8 8-5 1-9-1-11-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 29c-4 1-7 4-8 8 5 1 9-1 11-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 42V20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M42 20c4 1 7 4 8 8-5 1-9-1-11-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M42 25c-4 1-7 4-8 8 5 1 9-1 11-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scenic":
      return (
        <svg viewBox="0 0 64 64" fill="none" className={baseClass}>
          <path d="M10 46c10-10 20-14 30-14 5 0 9 1 14 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M16 52c7-7 15-11 24-11 6 0 11 1 18 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M22 56c4-9 8-15 14-21 4-4 8-7 14-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="18" r="3.5" stroke="currentColor" strokeWidth="2.2" />
        </svg>
      );
    default:
      return null;
  }
}

function QuickHighlightsOrnament() {
  return (
    <div className="hidden sm:flex items-center justify-center text-[#c49a56]">
      <svg viewBox="0 0 40 40" fill="none" className="h-10 w-10">
        <path d="M20 7c0 5-3 8-8 8 5 0 8 3 8 8 0-5 3-8 8-8-5 0-8-3-8-8Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M20 17c0 5-3 8-8 8 5 0 8 3 8 8 0-5 3-8 8-8-5 0-8-3-8-8Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

export function QuickHighlightsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="relative overflow-hidden rounded-[32px] border border-[#dcc8a2] bg-[#fcf8f0] px-5 py-6 shadow-[0_12px_30px_rgba(35,57,42,0.06)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,163,92,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(44,84,58,0.05),transparent_24%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8893e]">Quick Highlights</p>
                <span className="h-px w-12 bg-[#cda863]" />
              </div>

              <h2 className="mt-2 font-serif text-[1.6rem] leading-tight text-[#214531] sm:mt-3 sm:text-[2.35rem] lg:text-[2.6rem]">
                Why guests love La Ki Trep
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a665e] sm:text-[15px]">
                Boutique hospitality, nature-led spaces, and stays designed for calm and connection.
              </p>
            </div>

            <QuickHighlightsOrnament />
          </div>

          <div className="mt-5">
  <div className="grid grid-cols-5 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
    {QUICK_HIGHLIGHTS.map((highlight) => (
      <article
        key={highlight.title}
        className="rounded-xl border border-[#e2d4b8] bg-[#fffdf8] px-1.5 py-2 text-center shadow-[0_6px_14px_rgba(39,70,52,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(39,70,52,0.08)] sm:rounded-[24px] sm:px-5 sm:py-6"
      >
        <div className="flex justify-center">
          <QuickHighlightIcon type={highlight.icon} />
        </div>

        <h3 className="mt-1.5 font-serif text-[0.62rem] leading-tight text-[#234331] sm:mt-4 sm:text-[1.35rem] lg:text-[1.6rem]">
          {highlight.title}
        </h3>

        <p className="hidden sm:mt-3 sm:block sm:text-sm sm:leading-6 sm:text-[#5d695f]">
          {highlight.note}
        </p>
      </article>
    ))}
  </div>
</div>
        </div>
      </div>
    </section>
  );
}
