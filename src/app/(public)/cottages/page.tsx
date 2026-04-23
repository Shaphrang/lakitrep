import type { Metadata } from "next";
import Link from "next/link";
import { getFirstImage, getPrimaryProperty, getPublicCottages, getSeoByPageKey } from "@/lib/public-site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();
  if (!property) return { title: "Cottages" };
  const seo = await getSeoByPageKey(property.id, "cottages");

  return {
    title: seo?.meta_title || `Cottages | ${property.name}`,
    description: seo?.meta_description || "Browse all cottages and stay options.",
  };
}

export default async function CottagesPage() {
  const property = await getPrimaryProperty();
  if (!property) return <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">No property found.</main>;

  const cottages = await getPublicCottages(property.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Our cottages</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-200 sm:text-base">Choose from our available cottages. Every stay includes quiet surroundings and personalized support.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cottages.map((cottage) => (
          <article key={cottage.id} className="overflow-hidden rounded-2xl bg-white text-emerald-950">
            <img src={getFirstImage(cottage.cover_image, cottage.gallery_images)} alt={cottage.name} className="h-44 w-full object-cover" />
            <div className="space-y-2 p-4">
              <h2 className="text-lg font-semibold">{cottage.name}</h2>
              <p className="text-xs uppercase tracking-wide text-emerald-700">{cottage.category}</p>
              <p className="line-clamp-3 text-sm text-stone-600">{cottage.short_description || cottage.full_description || "Comfortable and practical stay option."}</p>
              <p className="text-sm font-medium">Up to {cottage.max_total_guests} guests</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-800">₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night</p>
                <Link href={`/cottages/${cottage.slug}`} className="text-sm font-semibold text-emerald-900">Details →</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
