import type { Metadata } from "next";
import { getAttractions, getFirstImage, getPrimaryProperty, getSeoByPageKey } from "@/lib/public-site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();
  if (!property) return { title: "Attractions" };
  const seo = await getSeoByPageKey(property.id, "attractions");

  return {
    title: seo?.meta_title || `Attractions | ${property.name}`,
    description: seo?.meta_description || "Nearby attractions and experiences around the resort.",
  };
}

export default async function AttractionsPage() {
  const property = await getPrimaryProperty();
  if (!property) return <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">No property found.</main>;

  const attractions = await getAttractions(property.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Nearby attractions</h1>
      <p className="mt-2 max-w-2xl text-sm text-stone-200 sm:text-base">Popular places and quick escapes near {property.name}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((attraction) => (
          <article key={attraction.id} className="overflow-hidden rounded-2xl bg-white text-emerald-950">
            <img src={getFirstImage(attraction.cover_image, attraction.gallery_images)} alt={attraction.name} className="h-44 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-semibold">{attraction.name}</h2>
              <p className="mt-1 text-sm text-emerald-700">{attraction.distance_text || "Near the resort"}</p>
              <p className="mt-2 text-sm text-stone-600">{attraction.description || "Great for short nature outings and day trips."}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
