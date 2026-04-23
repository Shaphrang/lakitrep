//src\app\(public)\page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAttractions,
  getFeaturedCottages,
  getFirstImage,
  getPolicies,
  getPrimaryProperty,
  getPublicCottages,
  getSeoByPageKey,
} from "@/lib/public-site";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import { HeroBookingWidget } from "@/components/public/booking/HeroBookingWidget";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();
  if (!property) {
    return {
      title: "La Ki Trep Resort",
      description: "Boutique resort in Meghalaya.",
    };
  }

  const seo = await getSeoByPageKey(property.id, "home");
  return {
    title: seo?.meta_title || `${property.name} | Boutique Resort`,
    description: seo?.meta_description || property.short_intro || "Quiet cottage stay in Meghalaya.",
  };
}

export default async function HomePage() {
  const property = await getPrimaryProperty();

  if (!property) {
    return <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">Property details are not available yet.</main>;
  }

  const [featuredCottages, attractions, policies, cottages] = await Promise.all([
    getFeaturedCottages(property.id, 4),
    getAttractions(property.id),
    getPolicies(property.id),
    getPublicCottages(property.id),
  ]);

  return (
    <main>
      <section className="relative min-h-[620px] overflow-hidden border-b border-[#d8d0c3] sm:min-h-[680px] lg:min-h-[720px]">
        <img
          src={getFirstImage(property.cover_image, property.gallery_images)}
          alt={property.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,27,19,0.72)_0%,rgba(14,27,19,0.42)_38%,rgba(14,27,19,0.20)_58%,rgba(14,27,19,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,12,0.30)_0%,rgba(10,18,12,0.05)_20%,rgba(10,18,12,0.35)_100%)]" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-4 pb-10 pt-24 sm:min-h-[680px] sm:px-6 sm:pb-12 sm:pt-28 lg:min-h-[720px] lg:pb-14 lg:pt-32">
          <div className="grid w-full items-end gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
            <div className="max-w-3xl text-[#f8f4ec]">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#e4d6b0] sm:text-xs">
                La Ki Trep Resort
              </p>

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

            <div className="hidden lg:block">
              <HeroBookingWidget cottages={cottages} />
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-6 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:hidden">
        <HeroBookingWidget cottages={cottages} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <img
          src={getFirstImage(property.gallery_images[1] || null, property.gallery_images)}
          alt={`${property.name} view`}
          className="h-60 w-full rounded-2xl object-cover sm:h-80"
        />
        <article className="rounded-2xl border border-[#dfd6c9] bg-[#fbf8f2] p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6d7f70]">About La Ki Trep</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[#214531] sm:text-4xl">
            Private, Peaceful, Intentionally Limited
          </h2>
          <p className="mt-3 text-sm text-[#4f5f54] sm:text-base">
            {property.full_description ||
              "La Ki Trep is a private cottage stay made for calm, personal, and uncrowded getaways. We host a small number of guests so your stay feels restful and intentional."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#31533d]">
            <p className="rounded-xl bg-[#f1ebe1] px-3 py-2">5 Private Cottages</p>
            <p className="rounded-xl bg-[#f1ebe1] px-3 py-2">Swimming Pool</p>
            <p className="rounded-xl bg-[#f1ebe1] px-3 py-2">In-house Dining</p>
            <p className="rounded-xl bg-[#f1ebe1] px-3 py-2">Outdoor Spaces</p>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Stay in Our Cottages</h2>
          <Link href="/cottages" className="text-sm font-semibold text-[#2d593b]">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCottages.map((cottage) => (
            <article key={cottage.id} className="overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm">
              <img src={getFirstImage(cottage.cover_image, cottage.gallery_images)} alt={cottage.name} className="h-44 w-full object-cover" />
              <div className="space-y-2 p-4">
                <h3 className="font-serif text-2xl text-[#224331]">{cottage.name}</h3>
                <p className="line-clamp-3 text-sm text-[#5c6a61]">
                  {cottage.short_description || cottage.full_description || "Comfortable stay with curated amenities."}
                </p>
                <p className="text-sm text-[#355740]">Up to {cottage.max_total_guests} guests</p>
                <div className="space-y-2 border-t border-[#e6ddcf] pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#234a34]">
                      From ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night
                    </p>
                    <Link href={`/cottages/${cottage.slug}`} className="text-sm font-semibold text-[#2e5f3e]">
                      Details →
                    </Link>
                  </div>
                  <div className="rounded-xl bg-[#f4efe6] p-2">
                    <BookNowButton
                      cottageSlug={cottage.slug}
                      className="w-full rounded-lg bg-[#2f5a3d] px-3 py-2 text-sm font-semibold text-white"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-12">
        <h2 className="mb-5 font-serif text-3xl text-[#214531] sm:text-4xl">Amenities & Experiences</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["Breakfast", "In-house Dining", "Swimming Pool", "Parking", "Bonfire", "Sightseeing Help"].map((item) => (
            <div key={item} className="rounded-2xl border border-[#dfd6c9] bg-[#fbf7ef] px-3 py-4 text-center text-sm text-[#31513d]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:px-6 sm:pb-12 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-5">
          <h2 className="font-serif text-3xl text-[#214531]">Explore Nearby</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {attractions.slice(0, 6).map((attraction) => (
              <div key={attraction.id} className="overflow-hidden rounded-xl border border-[#e5dccf] bg-white">
                <img src={getFirstImage(attraction.cover_image, attraction.gallery_images)} alt={attraction.name} className="h-20 w-full object-cover" />
                <p className="p-2 text-xs text-[#415247]">{attraction.name}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-5">
          <h2 className="font-serif text-3xl text-[#214531]">Stay Information</h2>
          <div className="mt-4 space-y-3">
            {policies.slice(0, 3).map((policy) => (
              <div key={policy.id} className="rounded-xl border border-[#e5dccf] bg-white px-3 py-2">
                <p className="text-sm font-semibold text-[#2f503b]">{policy.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[#55645a]">{policy.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/policies" className="rounded-full border border-[#2f5a3d] px-4 py-2 text-sm font-semibold text-[#2f5a3d]">
              Read policies
            </Link>
            <BookNowButton
              className="rounded-full bg-[#2f5a3d] px-4 py-2 text-sm font-semibold text-white"
              label="Send booking request"
              lockCottage={false}
            />
          </div>
        </article>
      </section>
    </main>
  );
}