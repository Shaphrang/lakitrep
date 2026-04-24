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

      <div className="grid grid-cols-6 gap-2 sm:gap-4">
  {cottages.slice(0, 5).map((cottage, index) => {
    const heroImage = getCottageHeroImage(cottage, groupedGallery);

    return (
      <article
        key={cottage.id}
        className={`col-span-2 overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
          index >= 3 ? "col-span-3" : ""
        }`}
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
            <div className="flex h-full items-center justify-center text-[0.6rem] text-[#647369] sm:text-sm">
              Image unavailable
            </div>
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,28,20,0.02)_0%,rgba(16,28,20,0.12)_45%,rgba(16,28,20,0.35)_100%)]" />
        </div>

        <div className="space-y-1.5 p-2 sm:space-y-2.5 sm:p-4">
          <h3 className="line-clamp-2 font-serif text-[0.8rem] leading-tight text-[#224331] sm:text-[1.7rem]">
            {cottage.name}
          </h3>

          <p className="hidden text-sm text-[#5c6a61] sm:line-clamp-2 sm:block">
            {cottage.short_description ||
              cottage.full_description ||
              "Comfortable stay with curated amenities."}
          </p>

          <div className="flex flex-wrap items-center gap-1 text-[0.55rem] text-[#47624f] sm:gap-2 sm:text-xs">
            <span className="rounded-full bg-[#f2ecdf] px-1.5 py-0.5 sm:px-2.5 sm:py-1">
              {cottage.max_total_guests} guests
            </span>

            <span className="hidden rounded-full bg-[#f2ecdf] px-2.5 py-1 sm:inline-flex">
              {cottage.category}
            </span>
          </div>

          <div className="space-y-1 border-t border-[#e6ddcf] pt-1.5 sm:space-y-2 sm:pt-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-[0.6rem] font-semibold leading-tight text-[#234a34] sm:text-sm">
                ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night
              </p>

              <Link
                href={`/cottages/${cottage.slug}`}
                className="text-[0.6rem] font-semibold text-[#2e5f3e] sm:text-sm"
              >
                Details →
              </Link>
            </div>

            <div className="rounded-lg bg-[#f4efe6] p-1 sm:rounded-xl sm:p-2">
              <BookNowButton
  cottageSlug={cottage.slug}
  className="w-full rounded-md bg-[#2f5a3d] px-2 py-1.5 text-[0.6rem] font-semibold text-white sm:rounded-lg sm:px-3 sm:py-2.5 sm:text-sm"
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
