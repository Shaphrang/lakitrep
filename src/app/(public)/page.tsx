import Link from "next/link";
import type { Metadata } from "next";
import {
  getAttractions,
  getFeaturedCottages,
  getFirstImage,
  getPolicies,
  getPrimaryProperty,
  getSeoByPageKey,
} from "@/lib/public-site";

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

  const [featuredCottages, attractions, policies] = await Promise.all([
    getFeaturedCottages(property.id, 4),
    getAttractions(property.id),
    getPolicies(property.id),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-[#d8d0c3]">
        <img
          src={getFirstImage(property.cover_image, property.gallery_images)}
          alt={property.name}
          className="h-[68vh] min-h-[440px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d3327]/90 via-[#1d3327]/45 to-[#1d3327]/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10">
          <div className="max-w-2xl space-y-4 text-[#f8f4ec]">
            <p className="text-xs uppercase tracking-[0.28em] text-[#f0debc]">La Ki Trep Resort</p>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              {property.tagline || "A quiet boutique escape in Meghalaya"}
            </h1>
            <p className="max-w-xl text-sm text-[#ece6d8] sm:text-base">
              {property.short_intro || "Private cottages, peaceful views, and intentionally limited stays in the hills of Umran."}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/book" className="rounded-full bg-[#2c5a3b] px-5 py-2.5 text-sm font-semibold text-white">
                Book via WhatsApp
              </Link>
              <Link href="/cottages" className="rounded-full border border-[#ece6d8]/70 px-5 py-2.5 text-sm font-semibold text-white">
                Explore cottages
              </Link>
            </div>
          </div>
        </div>
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
                <p className="text-sm text-[#5c6a61] line-clamp-3">{cottage.short_description || cottage.full_description || "Comfortable stay with curated amenities."}</p>
                <p className="text-sm text-[#355740]">Up to {cottage.max_total_guests} guests</p>
                <div className="flex items-center justify-between border-t border-[#e6ddcf] pt-2">
                  <p className="text-sm font-semibold text-[#234a34]">₹{Number(cottage.weekday_price).toLocaleString("en-IN")}</p>
                  <Link href={`/cottages/${cottage.slug}`} className="text-sm font-semibold text-[#2e5f3e]">
                    Details →
                  </Link>
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
            <Link href="/book" className="rounded-full bg-[#2f5a3d] px-4 py-2 text-sm font-semibold text-white">
              Send booking request
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
