import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCottageBySlug, getFirstImage, getPrimaryProperty, getPublicCottages, getSeoByPageKey } from "@/lib/public-site";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPrimaryProperty();
  if (!property) return { title: "Cottage" };
  const cottage = await getCottageBySlug(property.id, slug);
  const seo = await getSeoByPageKey(property.id, `cottage:${slug}`);

  return {
    title: seo?.meta_title || `${cottage?.name || "Cottage"} | ${property.name}`,
    description: seo?.meta_description || cottage?.short_description || "Cottage details",
  };
}

export default async function CottageDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPrimaryProperty();
  if (!property) notFound();

  const cottage = await getCottageBySlug(property.id, slug);
  if (!cottage) notFound();

  const gallery = [getFirstImage(cottage.cover_image, cottage.gallery_images), ...cottage.gallery_images].slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/cottages" className="text-sm text-amber-200">← Back to cottages</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <img src={gallery[0]} alt={cottage.name} className="h-72 w-full rounded-2xl object-cover sm:h-96" />
          <div className="grid grid-cols-3 gap-3">
            {gallery.slice(1).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${cottage.name} ${index + 2}`} className="h-24 w-full rounded-xl object-cover sm:h-28" />
            ))}
          </div>
        </div>

        <article className="rounded-2xl bg-white p-5 text-emerald-950 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">{cottage.name}</h1>
          <p className="mt-1 text-sm uppercase tracking-wide text-emerald-700">{cottage.category}</p>
          <p className="mt-3 text-sm text-stone-700 sm:text-base">{cottage.full_description || cottage.short_description || "Comfortable stay in a peaceful setting."}</p>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>Capacity</dt><dd className="font-medium">{cottage.max_total_guests} guests</dd></div>
            <div className="flex justify-between gap-4"><dt>Adults</dt><dd className="font-medium">{cottage.max_adults}</dd></div>
            <div className="flex justify-between gap-4"><dt>Children</dt><dd className="font-medium">{cottage.max_children}</dd></div>
            <div className="flex justify-between gap-4"><dt>Weekday price</dt><dd className="font-medium">₹{Number(cottage.weekday_price).toLocaleString("en-IN")}</dd></div>
            <div className="flex justify-between gap-4"><dt>Weekend price</dt><dd className="font-medium">₹{Number(cottage.weekend_price).toLocaleString("en-IN")}</dd></div>
          </dl>

          {cottage.amenities.length ? (
            <div className="mt-5">
              <h2 className="font-medium">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-stone-700">
                {cottage.amenities.map((item) => (
                  <li key={item} className="rounded-lg bg-stone-100 px-3 py-2">{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link href="/book" className="mt-6 inline-flex rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white">Request booking</Link>
        </article>
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  const property = await getPrimaryProperty();
  if (!property) return [];
  const cottages = await getPublicCottages(property.id);
  return cottages.map((cottage) => ({ slug: cottage.slug }));
}
