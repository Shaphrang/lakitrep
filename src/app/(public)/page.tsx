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
  resolveMediaUrl,
  getSeoByPageKey,
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
  {
    title: "Boutique Stay",
    note: "Five private cottages for quiet and restful stays.",
    icon: "stay",
  },
  {
    title: "Swimming Pool",
    note: "Relax and unwind with refreshing pool access.",
    icon: "pool",
  },
  {
    title: "In-house Dining",
    note: "Warm meals and pre-planned reservations.",
    icon: "dining",
  },
  {
    title: "4-Acre Setting",
    note: "Open greens and slow mornings in nature.",
    icon: "nature",
  },
  {
    title: "Near Umiam",
    note: "Easy access to scenic drives and day plans.",
    icon: "scenic",
  },
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
  const url = resolveMediaUrl(item.public_url);
  if (!url) return null;
  return {
    url,
    alt: item.alt_text || item.caption || "La Ki Trep gallery image",
    caption: item.caption,
  };
}

function firstGalleryImage(images: Array<{ public_url: string; alt_text: string | null; caption: string | null }>): GalleryImage | null {
  return mapGalleryImage(images[0]);
}

function getGalleryUrl(items?: Array<{ public_url: string; alt_text: string | null; caption: string | null }>): string | null {
  return resolveMediaUrl(items?.[0]?.public_url);
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

type HighlightIconType = (typeof QUICK_HIGHLIGHTS)[number]["icon"];

function QuickHighlightIcon({ type }: { type: HighlightIconType }) {
  const baseClass = "h-12 w-12 text-[#c49a56]";

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

  const aboutImagePrimary = firstGalleryImage(groupedGallery.exteriorView) || firstGalleryImage(groupedGallery.outdoorGarden);
  const aboutImageSecondary = firstGalleryImage(groupedGallery.interiorView) || firstGalleryImage(groupedGallery.premiumCottage);
  const aboutImageAccent = firstGalleryImage(groupedGallery.swimmingPool) || firstGalleryImage(groupedGallery.scenicViews);

  const eventImage =
    firstGalleryImage(groupedGallery.activitiesExperiences) ||
    firstGalleryImage(groupedGallery.outdoorGarden) ||
    firstGalleryImage(groupedGallery.scenicViews);
  const whatsappNumber = (property.whatsapp_number || property.phone_number || "6009044450").replace(/\D/g, "");
  const whatsappMsisdn = whatsappNumber.startsWith("91") ? whatsappNumber : `91${whatsappNumber}`;
  const whatsappEventLink = `https://wa.me/${whatsappMsisdn}`;

const galleryPreviewCards = [
  {
    key: "exterior-view",
    label: "Hero exterior / aerial photo",
    image:
      firstGalleryImage(groupedGallery.exteriorView) ||
      firstGalleryImage(groupedGallery.outdoorGarden),
    className: "md:col-span-6 min-h-[320px]",
  },
  {
    key: "premium-cottage",
    label: "Premium cottage balcony / sit-out",
    image:
      firstGalleryImage(groupedGallery.premiumCottage) ||
      firstGalleryImage(groupedGallery.interiorView),
    className: "md:col-span-3 min-h-[320px]",
  },
  {
    key: "swimming-pool",
    label: "Swimming pool during golden hour",
    image: firstGalleryImage(groupedGallery.swimmingPool),
    className: "md:col-span-3 min-h-[320px]",
  },
  {
    key: "restaurant-dining",
    label: "Restaurant dining ambience",
    image: firstGalleryImage(groupedGallery.restaurantDining),
    className: "md:col-span-4 min-h-[240px]",
  },
  {
    key: "outdoor-garden",
    label: "Garden & outdoor spaces",
    image: firstGalleryImage(groupedGallery.outdoorGarden),
    className: "md:col-span-4 min-h-[240px]",
  },
  {
    key: "scenic-views",
    label: "Scenic surroundings / hills / trees",
    image: firstGalleryImage(groupedGallery.scenicViews),
    className: "md:col-span-4 min-h-[240px]",
  },
].filter(
  (
    item,
  ): item is {
    key: string;
    label: string;
    image: GalleryImage;
    className: string;
  } => Boolean(item.image),
);

const totalGalleryImages = [
  groupedGallery.exteriorView,
  groupedGallery.interiorView,
  groupedGallery.premiumCottage,
  groupedGallery.standardCottage,
  groupedGallery.swimmingPool,
  groupedGallery.restaurantDining,
  groupedGallery.outdoorGarden,
  groupedGallery.scenicViews,
  groupedGallery.activitiesExperiences,
].reduce((sum, items) => sum + items.length, 0);

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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[#dcc8a2] bg-[#fcf8f0] px-5 py-6 shadow-[0_12px_30px_rgba(35,57,42,0.06)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,163,92,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(44,84,58,0.05),transparent_24%)]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#b8893e]">
                    Quick Highlights
                  </p>
                  <span className="h-px w-12 bg-[#cda863]" />
                </div>

                <h2 className="mt-3 font-serif text-[2rem] leading-tight text-[#214531] sm:text-[2.35rem] lg:text-[2.6rem]">
                  Why guests love La Ki Trep
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a665e] sm:text-[15px]">
                  Boutique hospitality, nature-led spaces, and stays designed for calm and connection.
                </p>
              </div>

              <QuickHighlightsOrnament />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {QUICK_HIGHLIGHTS.map((highlight) => (
                <article
                  key={highlight.title}
                  className="rounded-[24px] border border-[#e2d4b8] bg-[#fffdf8] px-5 py-6 text-center shadow-[0_8px_20px_rgba(39,70,52,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(39,70,52,0.08)]"
                >
                  <div className="flex justify-center">
                    <QuickHighlightIcon type={highlight.icon} />
                  </div>

                  <h3 className="mt-4 font-serif text-[1.6rem] leading-tight text-[#234331]">
                    {highlight.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#5d695f]">
                    {highlight.note}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

<section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
  <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
    <div className="order-2 flex h-full flex-col justify-between lg:order-1">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#6d7f70]">Our Story</p>
        <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl lg:text-5xl">
          Small by choice, private by design.
        </h2>
        <p
          className="mt-4 text-sm leading-7 text-[#4f5f54] sm:text-base"
          style={{ textAlign: "justify" }}
        >
          {property.full_description ||
            "La Ki Trep is a boutique retreat in Umran, Ri Bhoi—created for guests who prefer quiet spaces, thoughtful hosting, and slower days in nature."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">
          Intimate boutique scale with only five cottages.
        </div>
        <div className="rounded-xl border border-[#e5dbc9] bg-[#fcf8f0] px-4 py-3 text-sm text-[#31513d]">
          Best suited for meaningful getaways and private group stays.
        </div>
      </div>
    </div>

    <div className="order-1 lg:order-2">
      <div className="relative grid gap-3 sm:grid-cols-2">
        {aboutImagePrimary ? (
          <img
            src={aboutImagePrimary.url}
            alt={aboutImagePrimary.alt}
            className="h-52 w-full rounded-2xl object-cover shadow-md sm:col-span-2 sm:h-64"
            loading="lazy"
          />
        ) : null}

        {aboutImageSecondary ? (
          <img
            src={aboutImageSecondary.url}
            alt={aboutImageSecondary.alt}
            className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48"
            loading="lazy"
          />
        ) : null}

        {aboutImageAccent ? (
          <img
            src={aboutImageAccent.url}
            alt={aboutImageAccent.alt}
            className="h-40 w-full rounded-2xl object-cover shadow-sm sm:h-48"
            loading="lazy"
          />
        ) : null}
      </div>
    </div>
  </div>
</section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6c7d70]">
              Stay with us
            </p>
            <h2 className="mt-1 font-serif text-3xl text-[#214531] sm:text-4xl">
              Stay in Our Cottages
            </h2>
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
      const category = String(cottage.category || "").toLowerCase();

      const fallbackByCategory = category.includes("premium")
        ? getGalleryUrl(groupedGallery.premiumCottage)
        : category.includes("standard")
          ? getGalleryUrl(groupedGallery.standardCottage)
          : getGalleryUrl(groupedGallery.interiorView);

      const heroImage = resolveMediaUrl(getFirstImage(
        cottage.cover_image || fallbackByCategory || null,
        cottage.gallery_images
      ));

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
            <h3 className="font-serif text-[1.7rem] leading-tight text-[#224331]">
              {cottage.name}
            </h3>

            <p className="line-clamp-2 text-sm text-[#5c6a61]">
              {cottage.short_description ||
                cottage.full_description ||
                "Comfortable stay with curated amenities."}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#47624f]">
              <span className="rounded-full bg-[#f2ecdf] px-2.5 py-1">Up to {cottage.max_total_guests} guests</span>
              <span className="rounded-full bg-[#f2ecdf] px-2.5 py-1">{cottage.category}</span>
            </div>

            <div className="space-y-2 border-t border-[#e6ddcf] pt-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#234a34]">
                  From ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night
                </p>

                <Link
                  href={`/cottages/${cottage.slug}`}
                  className="text-sm font-semibold text-[#2e5f3e]"
                >
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

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#0f7c69]">
          Moments at La Ki Trep
        </p>
        <h2 className="mt-2 font-serif text-3xl text-[#214531] sm:text-4xl lg:text-5xl">
          Explore the spaces, views, and experiences that shape the stay.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a685e] sm:text-base">
          From cottage corners and poolside afternoons to dining spaces and scenic
          surroundings, take a closer look at the atmosphere of La Ki Trep.
        </p>
      </div>

      {galleryPreviewCards.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-12">
            {galleryPreviewCards.map((item) => (
              <Link
                key={item.key}
                href={`/gallery#${item.key}`}
                className={`group relative overflow-hidden rounded-[28px] shadow-[0_12px_30px_rgba(34,67,49,0.10)] transition-transform duration-300 hover:-translate-y-0.5 ${item.className}`}
              >
                <img
                  src={item.image.url}
                  alt={item.image.alt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,41,31,0.08)_0%,rgba(26,74,54,0.22)_38%,rgba(22,70,49,0.78)_100%)]" />

                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/80">
                    View gallery
                  </p>
                  <h3 className="mt-1 max-w-[85%] font-serif text-lg leading-6 sm:text-xl sm:leading-7">
                    {item.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-[#6b776f] sm:text-sm">
            <p>
              {totalGalleryImages} published images across cottage and property
              categories
            </p>
            <Link href="/gallery" className="font-semibold text-[#2e5f3e]">
              View all images →
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[#d8cdbd] bg-[#faf6ee] p-6 text-sm text-[#5a685e]">
          Gallery images will appear here once media is published.
        </div>
      )}
    </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:pb-16">
        <h2 className="font-serif text-3xl text-[#214531] sm:text-4xl">Around La Ki Trep</h2>
        <p className="mt-2 text-sm text-[#5b675f] sm:text-base">Slow days, scenic drives, and local experiences near the resort.</p>
        <div className="mt-5 grid gap-3 grid-cols-2 lg:grid-cols-3">
          {(attractions.length > 0
            ? attractions.slice(0, 6).map((item) => ({
                name: item.name,
                note: item.description || "A nearby highlight to pair with your stay itinerary.",
                distance: item.distance_text || "Near La Ki Trep",
                image: resolveMediaUrl(getFirstImage(item.cover_image, item.gallery_images)),
              }))
            : FALLBACK_EXPERIENCES.map((item) => ({ ...item, distance: "Nearby", image: null }))
          ).map((experience, index) => (
            <article key={experience.name} className="overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm">
              <div className="relative aspect-[4/3] bg-[#efe6d8]">
                {experience.image ? (
                  <img
                    src={experience.image}
                    alt={experience.name}
                    className="h-full w-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#647369]">Attraction image unavailable</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#6a7a70]">{experience.distance}</p>
                <h3 className="mt-1 font-serif text-xl text-[#244532]">{experience.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[#55645a]">{experience.note}</p>
              </div>
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
            <a
              href={whatsappEventLink}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2c7a59] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(26,89,67,0.22)] transition hover:bg-[#24684c]"
            >
              Enquire for Events on WhatsApp
            </a>
          </article>
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
