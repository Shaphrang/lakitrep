import Link from "next/link";
import type { PublicGroupedGallery } from "@/features/gallery/types";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import type { HomeCottage } from "../home.types";
import { getCottageHeroImage } from "../home.utils";

type CottagesSectionProps = {
  cottages: HomeCottage[];
  groupedGallery: PublicGroupedGallery;
};

export function CottagesSection({ cottages, groupedGallery }: CottagesSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c7d70]">Stay with us</p>
          <h2 className="mt-1 font-serif text-3xl text-[#214531] sm:text-4xl">Stay in Our Cottages</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59665d] sm:text-base">
            Thoughtfully designed private stays with breakfast, curated amenities, and a calm resort setting.
          </p>
        </div>

        <Link href="/cottages" className="text-sm font-semibold text-[#2d593b]">
          View all stays
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cottages.slice(0, 5).map((cottage, index) => {
          const heroImage = getCottageHeroImage(cottage, groupedGallery);

          return (
            <article
              key={cottage.id}
              className="overflow-hidden rounded-[24px] border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-[#efe6d8]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={`${cottage.name} cover`}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#647369]">Image unavailable</div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,28,20,0.02)_0%,rgba(16,28,20,0.12)_45%,rgba(16,28,20,0.35)_100%)]" />
              </div>

              <div className="space-y-2.5 p-4">
                <h3 className="font-serif text-[1.7rem] leading-tight text-[#224331]">{cottage.name}</h3>

                <p className="line-clamp-2 text-sm text-[#5c6a61]">
                  {cottage.short_description || cottage.full_description || "Comfortable stay with curated amenities."}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#47624f]">
                  <span className="rounded-full bg-[#f2ecdf] px-2.5 py-1">Up to {cottage.max_total_guests} guests</span>
                  <span className="rounded-full bg-[#f2ecdf] px-2.5 py-1">{cottage.category}</span>
                </div>

                <div className="space-y-2 border-t border-[#e6ddcf] pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#234a34]">From ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night</p>

                    <Link href={`/cottages/${cottage.slug}`} className="text-sm font-semibold text-[#2e5f3e]">
                      Details →
                    </Link>
                  </div>

                  <div className="rounded-xl bg-[#f4efe6] p-2">
                    <BookNowButton
                      cottageSlug={cottage.slug}
                      className="w-full rounded-lg bg-[#2f5a3d] px-3 py-2.5 text-sm font-semibold text-white"
                      label="Book now"
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
