import Link from "next/link";
import type { PublicGroupedGallery } from "@/features/gallery/types";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import type { HomeCottage } from "../home.types";
import { getCottageHeroImage } from "../home.utils";

type CottagesSectionProps = {
  cottages: HomeCottage[];
  groupedGallery: PublicGroupedGallery;
};

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getCapacityLabel(cottage: HomeCottage) {
  const parts: string[] = [];

  if (cottage.max_adults > 0) {
    parts.push(`${cottage.max_adults} adult${cottage.max_adults > 1 ? "s" : ""}`);
  }

  if (cottage.max_children > 0) {
    parts.push(`${cottage.max_children} child${cottage.max_children > 1 ? "ren" : ""}`);
  }

  if (cottage.max_infants > 0) {
    parts.push(`${cottage.max_infants} infant${cottage.max_infants > 1 ? "s" : ""}`);
  }

  return parts.length ? `Up to ${parts.join(" + ")}` : `Up to ${cottage.max_total_guests} guests`;
}

function pickFeatureChips(cottage: HomeCottage) {
  const chips: string[] = [];
  const amenityText = cottage.amenities.map((amenity) => amenity.toLowerCase());

  chips.push(cottage.has_ac ? "AC" : "Non-AC");

  if (cottage.breakfast_included) {
    chips.push("Breakfast included");
  }

  if (amenityText.some((item) => item.includes("pool"))) {
    chips.push("Pool access");
  }

  if (amenityText.some((item) => item.includes("sit-out") || item.includes("terrace") || item.includes("compound"))) {
    chips.push("Private sit-out");
  }

  if (amenityText.some((item) => item.includes("parking"))) {
    chips.push("Parking");
  }

  if (cottage.is_combined_unit || cottage.code === "FC45") {
    chips.push("C4 + C5 combined");
  }

  if (cottage.extra_bed_allowed && chips.length < 4) {
    chips.push("Extra bed on request");
  }

  for (const amenity of cottage.amenities) {
    if (chips.length >= 4) break;
    if (!chips.some((item) => item.toLowerCase() === amenity.toLowerCase())) {
      chips.push(amenity);
    }
  }

  return chips.slice(0, 4);
}

function normalizeCategory(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes("family")) return "Family Cottage";
  if (lower.includes("premium")) return "Premium Cottage";
  if (lower.includes("standard")) return "Standard Cottage";
  return category;
}

export function CottagesSection({ cottages, groupedGallery }: CottagesSectionProps) {
  if (!cottages.length) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-3xl border border-[#ddd3c3] bg-[#fffaf1] p-6 text-center text-[#4f5f56] sm:p-8">
          Cottage details are being updated. Please contact us for availability.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-[2rem] border border-[#e0d6c7] bg-gradient-to-b from-[#fffdf8] to-[#f8f2e8] p-5 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c7d70]">Cottage Stays</p>
          <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl">Stay in Our Cottages</h2>
          <p className="mt-3 text-sm leading-6 text-[#59665d] sm:text-base">
            Choose from premium, standard and family cottage stays designed for a peaceful resort experience near Umran, Ri Bhoi.
          </p>
          <p className="mt-2 text-sm font-medium text-[#2f5a3d]">All stays include complimentary breakfast.</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cottages.map((cottage) => {
            const heroImage = getCottageHeroImage(cottage, groupedGallery);
            const chips = pickFeatureChips(cottage);

            return (
              <article
                key={cottage.id}
                className="overflow-hidden rounded-3xl border border-[#d9cfbf] bg-[#fffdf8] shadow-sm transition md:hover:-translate-y-1 md:hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#eee6da]">
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={`${cottage.name} at La Ki Trep`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f6eddc_0%,_#e8dccb_65%)] px-4 text-center text-sm text-[#5f6e64]">
                      Resort cottage image coming soon
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#1f3b2a] px-3 py-1 text-xs font-semibold text-[#f5efdf]">
                      {normalizeCategory(cottage.category)}
                    </span>
                    {cottage.is_combined_unit || cottage.code === "FC45" ? (
                      <span className="rounded-full bg-[#efe7d7] px-3 py-1 text-xs font-semibold text-[#4f5f56]">Shared private compound</span>
                    ) : null}
                  </div>

                  <h3 className="font-serif text-2xl leading-tight text-[#224331]">{cottage.name}</h3>

                  <p className="line-clamp-2 text-sm text-[#5c6a61]">
                    {cottage.short_description || cottage.full_description || "Comfortable stay with curated amenities."}
                  </p>

                  <p className="text-sm font-medium text-[#2b5139]">{getCapacityLabel(cottage)}</p>

                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <span key={`${cottage.id}-${chip}`} className="rounded-full border border-[#e3d9ca] bg-[#f7f1e5] px-2.5 py-1 text-xs text-[#4f5f56]">
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[#e7dece] bg-[#fcf7ee] p-3">
                    <div className="flex flex-wrap items-end justify-between gap-1 text-sm">
                      <p className="font-semibold text-[#244734]">Weekday from {formatMoney(cottage.weekday_price)}/night</p>
                      <p className="text-[#506057]">Weekend {formatMoney(cottage.weekend_price)}/night</p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      href={`/cottages/${cottage.slug}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#d8cfbf] bg-[#f9f2e4] px-4 py-2.5 text-sm font-semibold text-[#2f553c] transition hover:bg-[#f2e9d8]"
                    >
                      View Details
                    </Link>
                    <BookNowButton
                      cottageSlug={cottage.slug}
                      className="inline-flex items-center justify-center rounded-xl bg-[#2e5a3d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#254b33]"
                      label="Book Now"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
