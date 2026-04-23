//src\app\(public)\page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAttractions,
  getFirstImage,
  getPolicies,
  getPrimaryProperty,
  getPropertyGalleryByCategory,
  getPublicCottages,
  getSeoByPageKey,
  type PublicCottage,
} from "@/lib/public-site";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import { HeroBookingWidget } from "@/components/public/booking/HeroBookingWidget";

export const revalidate = 300;

type GalleryImage = {
  url: string;
  alt: string;
  caption?: string | null;
};

const QUICK_HIGHLIGHTS = [
  "Boutique resort in Umran, Ri Bhoi",
  "Swimming pool",
  "In-house restaurant",
  "4-acre outdoor setting",
  "Private group stays",
  "Near Umiam experiences",
] as const;

const FALLBACK_EXPERIENCES = [
  { name: "Umiam Lake / Barapani", note: "Lakeside sunsets and scenic pauses—pair this with your stay for an easy half-day outing." },
  {
    name: "Umiam Boating Point / Water Sports Complex",
    note: "Light adventure and calm water sessions—ideal after a relaxed breakfast at the resort.",
  },
  { name: "Lum Nehru Park", note: "Green walking trails and breezy viewpoints—great for a slow afternoon plan." },
  { name: "Lum Sohpetbneng", note: "A cultural hilltop experience with panoramic landscapes—pair this with your stay for sunrise." },
  {
    name: "Umden-Diwon Eri Silk Village",
    note: "Rural craftsmanship and Ri Bhoi countryside life—perfect for a meaningful local detour.",
  },
  { name: "Tea Garden & Mini Golf Course, Umran", note: "Leisure and open-air greens close to the property—easy to combine with check-in day." },
] as const;

const FAQ_ITEMS = [
  {
    title: "Check-in & check-out",
    points: ["Check-in: 2:00 PM", "Check-out: 11:00 AM", "Early check-in is subject to availability"],
  },
  {
    title: "Late check-out",
    points: ["₹1,000 until 12 PM", "₹2,000 until 1 PM", "Full night rate applies after 2 PM"],
  },
  {
    title: "Children & extra bedding",
    points: [
      "Children 2–12 years: ₹500 per child",
      "Infants below 2 years: no charge",
      "Children 15+ are treated as adults",
      "Extra bed on request for Cottage 4 and Family Cottage",
    ],
  },
  {
    title: "Food, beverages & dining rules",
    points: [
      "Outside food/catering and outside alcohol are not permitted",
      "Corkage charge ₹500 per room if found",
      "No room service; meals are served in the dining area",
      "Cooking on property is not allowed",
    ],
  },
  {
    title: "Property conduct & access",
    points: [
      "Valid government photo ID required for all adult guests",
      "Non-guest access, walk-in visitors, and property tours are not permitted",
      "Management can ask disruptive guests to vacate without refund",
      "No-show advance payment is non-refundable; rescheduling where possible",
    ],
  },
  {
    title: "Pool, pets & smoking",
    points: [
      "Appropriate swimwear required; shower before entering pool",
      "Children must be supervised in pool areas",
      "Pets are not permitted",
      "Smoking only in designated areas; ₹500 cleaning fee if smoking inside room",
    ],
  },
] as const;

function mapGalleryImage(item?: { public_url: string; alt_text: string | null; caption: string | null }): GalleryImage | null {
  if (!item) return null;
  return {
    url: item.public_url,
    alt: item.alt_text || item.caption || "La Ki Trep gallery image",
    caption: item.caption,
  };
}

function firstGalleryImage(images: Array<{ public_url: string; alt_text: string | null; caption: string | null }>): GalleryImage | null {
  return mapGalleryImage(images[0]);
}

function getCottageByKeywords(cottages: PublicCottage[], keywords: string[]): PublicCottage | null {
  return (
    cottages.find((cottage) => {
      const source = `${cottage.name} ${cottage.category} ${cottage.slug}`.toLowerCase();
      return keywords.some((keyword) => source.includes(keyword));
    }) ?? null
  );
}

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

  const [attractions, policies, cottages, groupedGallery] = await Promise.all([
    getAttractions(property.id),
    getPolicies(property.id),
    getPublicCottages(property.id),
    getPropertyGalleryByCategory(property.id),
  ]);

  const premiumCottage = getCottageByKeywords(cottages, ["premium"]);
  const standardCottage = getCottageByKeywords(cottages, ["standard"]);
  const familyCottage = getCottageByKeywords(cottages, ["family"]);

  const preferredStayCards = [premiumCottage, standardCottage, familyCottage].filter(Boolean) as PublicCottage[];
  const stayCards =
    preferredStayCards.length >= 3
      ? preferredStayCards.slice(0, 3)
      : [...preferredStayCards, ...cottages.filter((item) => !preferredStayCards.some((picked) => picked.id === item.id))].slice(0, 3);

  const aboutImagePrimary = firstGalleryImage(groupedGallery.exteriorView) || firstGalleryImage(groupedGallery.outdoorGarden);
  const aboutImageSecondary = firstGalleryImage(groupedGallery.interiorView) || firstGalleryImage(groupedGallery.premiumCottage);
  const aboutImageAccent = firstGalleryImage(groupedGallery.swimmingPool) || firstGalleryImage(groupedGallery.scenicViews);

  const diningImage = firstGalleryImage(groupedGallery.restaurantDining) || firstGalleryImage(groupedGallery.interiorView);
  const eventImage =
    firstGalleryImage(groupedGallery.activitiesExperiences) ||
    firstGalleryImage(groupedGallery.outdoorGarden) ||
    firstGalleryImage(groupedGallery.scenicViews);

  const galleryShowcase = [
    firstGalleryImage(groupedGallery.exteriorView),
    firstGalleryImage(groupedGallery.premiumCottage),
    firstGalleryImage(groupedGallery.standardCottage),
    firstGalleryImage(groupedGallery.swimmingPool),
    firstGalleryImage(groupedGallery.restaurantDining),
    firstGalleryImage(groupedGallery.outdoorGarden),
    firstGalleryImage(groupedGallery.scenicViews),
  ].filter(Boolean) as GalleryImage[];

  const topPolicies = policies.slice(0, 3);

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

            <div className="hidden lg:block">
              <HeroBookingWidget cottages={cottages} />
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-6 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:hidden">
        <HeroBookingWidget cottages={cottages} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="overflow-x-auto rounded-2xl border border-[#ddd2c2] bg-gradient-to-r from-[#f7f2e8] via-[#fbf8f2] to-[#f4ede1] p-3 shadow-sm">
          <div className="grid min-w-[720px] grid-cols-6 gap-2 sm:min-w-0 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK_HIGHLIGHTS.map((highlight) => (
              <div key={highlight} className="rounded-xl border border-[#e7dccb] bg-white/70 px-3 py-3 text-center text-xs font-medium text-[#39553f] sm:text-sm">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs uppercase tracking-[0.22em] text-[#6d7f70]">Our Story</p>
            <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl lg:text-5xl">Small by choice, private by design.</h2>
            <p className="mt-4 text-sm leading-7 text-[#4f5f54] sm:text-base">
              {property.full_description ||
                "La Ki Trep is a boutique retreat in Umran, Ri Bhoi—created for guests who prefer quiet spaces, thoughtful hosting, and slower days in nature."}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#4f5f54] sm:text-base">
              Ideal for couples, families, and close-knit groups, the property stays intentionally limited so every stay feels calm, personal, and unhurried—close enough to Umiam for day experiences, yet tucked away enough to truly switch off.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">Intimate boutique scale with only five cottages.</div>
              <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">Best suited for meaningful getaways and private group stays.</div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative grid gap-3 sm:grid-cols-2">
              {aboutImagePrimary ? (
                <img src={aboutImagePrimary.url} alt={aboutImagePrimary.alt} className="h-52 w-full rounded-2xl object-cover shadow-md sm:col-span-2 sm:h-64" loading="lazy" />
              ) : null}
              {aboutImageSecondary ? <img src={aboutImageSecondary.url} alt={aboutImageSecondary.alt} className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48" loading="lazy" /> : null}
              {aboutImageAccent ? <img src={aboutImageAccent.url} alt={aboutImageAccent.alt} className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48" loading="lazy" /> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Stay in Our Cottages</h2>
          <Link href="/cottages" className="text-sm font-semibold text-[#2d593b]">
            View all stays
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {stayCards.map((cottage) => {
            const fallbackByCategory = cottage.category.toLowerCase().includes("premium")
              ? groupedGallery.premiumCottage[0]?.public_url
              : cottage.category.toLowerCase().includes("standard")
                ? groupedGallery.standardCottage[0]?.public_url
                : groupedGallery.interiorView[0]?.public_url;

            const heroImage = getFirstImage(cottage.cover_image || fallbackByCategory || null, cottage.gallery_images);
            const supportOne = cottage.gallery_images[1] || groupedGallery.interiorView[0]?.public_url || heroImage;
            const supportTwo = cottage.gallery_images[2] || groupedGallery.outdoorGarden[0]?.public_url || heroImage;

            return (
              <article key={cottage.id} className="overflow-hidden rounded-3xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm transition hover:shadow-lg">
                <img src={heroImage} alt={`${cottage.name} cover`} className="h-52 w-full object-cover" loading="lazy" />
                <div className="grid grid-cols-2 gap-2 p-3">
                  <img src={supportOne} alt={`${cottage.name} interior`} className="h-24 w-full rounded-xl object-cover" loading="lazy" />
                  <img src={supportTwo} alt={`${cottage.name} sit-out and surroundings`} className="h-24 w-full rounded-xl object-cover" loading="lazy" />
                </div>
                <div className="space-y-3 px-4 pb-5">
                  <h3 className="font-serif text-2xl text-[#224331]">{cottage.name}</h3>
                  <p className="text-sm text-[#5b695f]">{cottage.short_description || cottage.full_description || "Comfortable, private cottage with resort amenities."}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#3a5441] sm:text-sm">
                    <p className="rounded-lg bg-[#f1ebe1] px-3 py-2">Occupancy: up to {cottage.max_total_guests}</p>
                    <p className="rounded-lg bg-[#f1ebe1] px-3 py-2">Bed: {cottage.bed_type || "On request"}</p>
                  </div>
                  <p className="text-sm text-[#3b5443]">Amenities: {cottage.amenities.slice(0, 4).join(" • ") || "Breakfast, private sit-out, and curated essentials"}</p>
                  <div className="rounded-xl border border-[#e7dece] bg-[#faf5eb] p-3 text-sm text-[#2f4e3a]">
                    <p>Weekday from ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night</p>
                    <p>Weekend from ₹{Number(cottage.weekend_price).toLocaleString("en-IN")}/night</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/cottages/${cottage.slug}`} className="flex-1 rounded-xl border border-[#2f5a3d] px-3 py-2 text-center text-sm font-semibold text-[#2f5a3d]">
                      View details
                    </Link>
                    <BookNowButton cottageSlug={cottage.slug} className="flex-1 rounded-xl bg-[#2f5a3d] px-3 py-2 text-sm font-semibold text-white" label="Enquire now" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <h2 className="mb-5 font-serif text-3xl text-[#214531] sm:text-4xl">Amenities & Facilities</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="grid gap-3 rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 sm:grid-cols-[150px_1fr] sm:p-5">
            {firstGalleryImage(groupedGallery.swimmingPool) ? (
              <img src={groupedGallery.swimmingPool[0].public_url} alt={groupedGallery.swimmingPool[0].alt_text || "Swimming pool at La Ki Trep"} className="h-28 w-full rounded-xl object-cover sm:h-full" loading="lazy" />
            ) : null}
            <div>
              <h3 className="font-serif text-2xl text-[#224331]">Comfort-focused essentials</h3>
              <ul className="mt-2 grid gap-2 text-sm text-[#4d5e53] sm:grid-cols-2">
                <li>Swimming pool access</li>
                <li>Breakfast included</li>
                <li>Parking on property</li>
                <li>Outdoor and garden spaces</li>
                <li>Balcony sit-outs</li>
                <li>Bonfire on request</li>
              </ul>
            </div>
          </article>
          <article className="grid gap-3 rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 sm:grid-cols-[150px_1fr] sm:p-5">
            {firstGalleryImage(groupedGallery.restaurantDining) ? (
              <img src={groupedGallery.restaurantDining[0].public_url} alt={groupedGallery.restaurantDining[0].alt_text || "Dining area"} className="h-28 w-full rounded-xl object-cover sm:h-full" loading="lazy" />
            ) : null}
            <div>
              <h3 className="font-serif text-2xl text-[#224331]">On-ground assistance</h3>
              <ul className="mt-2 grid gap-2 text-sm text-[#4d5e53] sm:grid-cols-2">
                <li>In-house restaurant timings</li>
                <li>Sightseeing guidance support</li>
                <li>Pickup / drop assistance on request</li>
                <li>Private group coordination</li>
                <li>Umiam day-experience recommendations</li>
                <li>Pre-booking support via WhatsApp</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <h2 className="mb-5 font-serif text-3xl text-[#214531] sm:text-4xl">Curated Property Gallery</h2>
        {galleryShowcase.length > 0 ? (
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
              {galleryShowcase[0] ? <img src={galleryShowcase[0].url} alt={galleryShowcase[0].alt} className="h-60 w-full rounded-2xl object-cover md:h-72" loading="lazy" /> : null}
              {galleryShowcase[1] ? <img src={galleryShowcase[1].url} alt={galleryShowcase[1].alt} className="h-60 w-full rounded-2xl object-cover md:h-72" loading="lazy" /> : null}
              {galleryShowcase[2] ? <img src={galleryShowcase[2].url} alt={galleryShowcase[2].alt} className="h-60 w-full rounded-2xl object-cover md:h-72" loading="lazy" /> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {galleryShowcase[3] ? <img src={galleryShowcase[3].url} alt={galleryShowcase[3].alt} className="h-48 w-full rounded-2xl object-cover" loading="lazy" /> : null}
              {galleryShowcase[4] ? <img src={galleryShowcase[4].url} alt={galleryShowcase[4].alt} className="h-48 w-full rounded-2xl object-cover" loading="lazy" /> : null}
              {galleryShowcase[5] ? <img src={galleryShowcase[5].url} alt={galleryShowcase[5].alt} className="h-48 w-full rounded-2xl object-cover" loading="lazy" /> : null}
            </div>
            {galleryShowcase[6] ? <img src={galleryShowcase[6].url} alt={galleryShowcase[6].alt} className="h-48 w-full rounded-2xl object-cover sm:h-56" loading="lazy" /> : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d8cdbd] bg-[#faf6ee] p-6 text-sm text-[#5a685e]">Gallery images will appear here once media is published.</div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Around La Ki Trep</h2>
        <p className="mt-2 text-sm text-[#5b675f] sm:text-base">Slow days, scenic drives, and local experiences near the resort.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(attractions.length > 0 ? attractions.slice(0, 6).map((item) => ({ name: item.name, note: item.description || "A nearby highlight to pair with your stay itinerary." })) : FALLBACK_EXPERIENCES).map((experience) => (
            <article key={experience.name} className="rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 shadow-sm">
              <h3 className="font-serif text-xl text-[#244532]">{experience.name}</h3>
              <p className="mt-2 text-sm text-[#55645a]">{experience.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div className="grid gap-4 rounded-3xl border border-[#ddd2c2] bg-gradient-to-br from-[#faf5eb] via-[#fdfaf3] to-[#f3ece0] p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {eventImage ? <img src={eventImage.url} alt={eventImage.alt} className="h-64 w-full rounded-2xl object-cover" loading="lazy" /> : null}
          </div>
          <article>
            <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Events & Group Bookings</h2>
            <p className="mt-2 text-sm text-[#536258]">Private celebrations and retreat-style gatherings coordinated directly on WhatsApp.</p>
            <ul className="mt-4 space-y-2 text-sm text-[#395142]">
              <li>• Birthday parties, anniversaries, bachelorettes, corporate retreats, and day events.</li>
              <li>• Full property booking available across all 5 cottages (up to 11 adults).</li>
              <li>• Day events without stay: up to 25 guests (venue + pool + restaurant).</li>
              <li>• Groups exceeding 10 persons must book all cottages.</li>
              <li>• Restaurant-only groups: up to 6 outside diners, subject to availability.</li>
              <li>• Outside food/catering and outside alcohol are not permitted.</li>
            </ul>
            <div className="mt-4 rounded-xl border border-[#d8ccb9] bg-white/75 p-3 text-sm text-[#2f4f3a]">Event enquiries on WhatsApp: <span className="font-semibold">6009044450</span></div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-5">
            <h2 className="font-serif text-3xl text-[#214531]">Dining at La Ki Trep</h2>
            <p className="mt-2 text-sm text-[#546359]">Warm in-house meals and pre-planned dining for guests and approved reservations.</p>
            <div className="mt-4 grid gap-2 text-sm text-[#3f5645] sm:grid-cols-3">
              <p className="rounded-xl bg-[#f2ecdf] px-3 py-2">Breakfast: 8:00 AM – 10:30 AM</p>
              <p className="rounded-xl bg-[#f2ecdf] px-3 py-2">Lunch: 12:30 PM – 3:00 PM</p>
              <p className="rounded-xl bg-[#f2ecdf] px-3 py-2">Dinner: 7:00 PM – 10:00 PM</p>
            </div>
            <p className="mt-4 text-sm text-[#4c5d52]">Restaurant reservations are required. Non-staying guests may request pool access with dining reservation, subject to availability and management approval.</p>
          </article>
          {diningImage ? <img src={diningImage.url} alt={diningImage.alt} className="h-60 w-full rounded-2xl object-cover sm:h-full" loading="lazy" /> : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Policies & Stay FAQs</h2>
        {topPolicies.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {topPolicies.map((policy) => (
              <article key={policy.id} className="rounded-2xl border border-[#e2d8c8] bg-[#faf6ef] p-4">
                <h3 className="font-semibold text-[#2f4f3a]">{policy.title}</h3>
                <p className="mt-2 text-sm text-[#58665c] line-clamp-4">{policy.content}</p>
              </article>
            ))}
          </div>
        ) : null}
        <div className="mt-4 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.title} className="group rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-4 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-[#274634]">{item.title}</summary>
              <ul className="mt-3 space-y-2 text-sm text-[#55645a]">
                {item.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

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
              <Link href="/policies" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white">Read policies</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
