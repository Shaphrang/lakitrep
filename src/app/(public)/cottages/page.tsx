import type { Metadata } from "next";
import Link from "next/link";
import { getFirstImage, getPrimaryProperty, getPublicCottages, getSeoByPageKey } from "@/lib/public-site";
import { BookNowButton } from "@/components/public/booking/BookNowButton";

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
      <h1 className="font-serif text-4xl text-[#214531] sm:text-5xl">Our cottages</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#53645a] sm:text-base">
        Quiet, private cottages designed for restful stays with thoughtful comfort.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cottages.map((cottage) => (
          <article key={cottage.id} className="overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] shadow-sm">
            <img src={getFirstImage(cottage.cover_image, cottage.gallery_images)} alt={cottage.name} className="h-48 w-full object-cover" />
            <div className="space-y-2 p-4">
              <h2 className="font-serif text-2xl text-[#214531]">{cottage.name}</h2>
              <p className="text-xs uppercase tracking-wide text-[#567360]">{cottage.category}</p>
              <p className="line-clamp-3 text-sm text-[#58665d]">
                {cottage.short_description || cottage.full_description || "Comfortable and practical stay option."}
              </p>
              <p className="text-sm text-[#31533d]">Up to {cottage.max_total_guests} guests</p>
              <div className="space-y-2 border-t border-[#e5dccf] pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#244734]">₹{Number(cottage.weekday_price).toLocaleString("en-IN")}/night</p>
                  <Link href={`/cottages/${cottage.slug}`} className="text-sm font-semibold text-[#2c5c3c]">
                    Details →
                  </Link>
                </div>
                <div className="rounded-xl bg-[#f4efe6] p-2">
                  <BookNowButton cottageSlug={cottage.slug} className="w-full rounded-lg bg-[#2f5a3d] px-3 py-2 text-sm font-semibold text-white" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
