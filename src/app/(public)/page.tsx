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
    getFeaturedCottages(property.id, 3),
    getAttractions(property.id),
    getPolicies(property.id),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <img
          src={getFirstImage(property.cover_image, property.gallery_images)}
          alt={property.name}
          className="h-[60vh] min-h-[400px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 sm:px-6 sm:pb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200">La Ki Trep Resort</p>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
            {property.tagline || "A quiet resort stay in the hills of Meghalaya."}
          </h1>
          <p className="max-w-xl text-sm text-stone-100 sm:text-base">
            {property.short_intro || "Private cottages, clean mountain air, and a relaxed stay designed for slow travel."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-emerald-950">
              Book your stay
            </Link>
            <Link href="/cottages" className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-semibold text-white">
              Explore cottages
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/95 p-5 text-emerald-950">
            <p className="text-sm text-stone-600">Location</p>
            <p className="mt-1 font-medium">{[property.district, property.state, property.country].filter(Boolean).join(", ")}</p>
          </div>
          <div className="rounded-2xl bg-white/95 p-5 text-emerald-950">
            <p className="text-sm text-stone-600">Check-in / Check-out</p>
            <p className="mt-1 font-medium">{property.check_in_time || "Flexible"} • {property.check_out_time || "Flexible"}</p>
          </div>
          <div className="rounded-2xl bg-white/95 p-5 text-emerald-950">
            <p className="text-sm text-stone-600">Contact</p>
            <p className="mt-1 font-medium">{property.whatsapp_number || property.phone_number || property.email || "Available on request"}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Featured cottages</h2>
          <Link href="/cottages" className="text-sm text-amber-200">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCottages.map((cottage) => (
            <article key={cottage.id} className="overflow-hidden rounded-2xl bg-white text-emerald-950 shadow-sm">
              <img src={getFirstImage(cottage.cover_image, cottage.gallery_images)} alt={cottage.name} className="h-44 w-full object-cover" />
              <div className="space-y-2 p-4">
                <h3 className="text-lg font-semibold">{cottage.name}</h3>
                <p className="line-clamp-2 text-sm text-stone-600">{cottage.short_description || cottage.full_description || "Comfortable stay with curated amenities."}</p>
                <p className="text-sm font-medium text-emerald-800">From ₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night</p>
                <Link href={`/cottages/${cottage.slug}`} className="inline-flex text-sm font-semibold text-emerald-900">View details →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Nearby attractions</h2>
          <Link href="/attractions" className="text-sm text-amber-200">See all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.slice(0, 3).map((attraction) => (
            <article key={attraction.id} className="overflow-hidden rounded-2xl bg-white text-emerald-950">
              <img src={getFirstImage(attraction.cover_image, attraction.gallery_images)} alt={attraction.name} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h3 className="font-semibold">{attraction.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{attraction.distance_text || attraction.description || "Short drive from the resort."}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="rounded-3xl bg-white p-6 text-emerald-950 sm:p-8">
          <h2 className="text-2xl font-semibold sm:text-3xl">Stay information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {policies.slice(0, 4).map((policy) => (
              <div key={policy.id} className="rounded-xl border border-stone-200 p-4">
                <h3 className="font-medium">{policy.title}</h3>
                <p className="mt-1 text-sm text-stone-600 line-clamp-3">{policy.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/policies" className="rounded-full border border-emerald-900 px-4 py-2 text-sm font-semibold">Read all policies</Link>
            <Link href="/book" className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white">Send booking request</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
