import Link from "next/link";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import { HeroBookingWidget } from "@/components/public/booking/HeroBookingWidget";
import type { PublicCottage } from "@/lib/public-site";
import { getFirstImage } from "@/lib/public-site";

type HeroSectionProps = {
  property: {
    name: string;
    cover_image: string | null;
    gallery_images: string[];
    tagline: string | null;
    short_intro: string | null;
  };
  cottages: PublicCottage[];
};

export function HeroSection({ property, cottages }: HeroSectionProps) {
  return (
    <section className="relative min-h-[620px] overflow-hidden border-b border-[#d8d0c3] sm:min-h-[680px] lg:min-h-[720px]">
      <img
        src={getFirstImage(property.cover_image, property.gallery_images)}
        alt={property.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,27,19,0.72)_0%,rgba(14,27,19,0.42)_38%,rgba(14,27,19,0.20)_58%,rgba(14,27,19,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,12,0.30)_0%,rgba(10,18,12,0.05)_20%,rgba(10,18,12,0.35)_100%)]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-10 pt-24 sm:min-h-[680px] sm:px-6 sm:pb-12 sm:pt-28 lg:min-h-[720px] lg:pb-14 lg:pt-32">
        <div className="grid w-full items-end gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="max-w-3xl text-[#f8f4ec]">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#e4d6b0] sm:text-xs">La Ki Trep Resort</p>

            <h1 className="mt-3 max-w-2xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {property.tagline || "A quiet boutique escape in Meghalaya"}
            </h1>

            <p className="mt-5 hidden max-w-xl text-sm leading-7 text-[#ece4d6] sm:block sm:text-base">
              {property.short_intro ||
                "Private cottages, a swimming pool, in-house dining, and slow, peaceful stays in the hills of Umran."}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#f0dfbd]">
              <span className="inline-flex items-center gap-2">
                <span className="h-px w-8 bg-[#d9c596]" />
                Only 5 cottages
              </span>
              <span>•</span>
              <span>Pre-booking required</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <BookNowButton
                className="rounded-2xl border border-[#d6c497]/35 bg-[#335b39]/90 px-5 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-[#284a2d]"
                label="Book via WhatsApp"
                lockCottage={false}
              />
              <Link
                href="/cottages"
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Explore Cottages
              </Link>
            </div>
          </div>

          <div className="w-full max-w-[420px] justify-self-start lg:justify-self-end">
            <HeroBookingWidget cottages={cottages} />
          </div>
        </div>
      </div>
    </section>
  );
}
