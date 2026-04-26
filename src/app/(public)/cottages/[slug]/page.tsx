import type { Metadata } from "next";
import Link from "next/link";
import { BookNowButton } from "@/components/public/booking/BookNowButton";
import { notFound } from "next/navigation";
import { getCottageBySlug, getFirstImage, getPrimaryProperty, getSeoByPageKey, resolveMediaUrl } from "@/lib/public-site";

export const revalidate = 300;
export const dynamic = "force-dynamic";

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

  const gallery = [getFirstImage(cottage.cover_image, cottage.gallery_images), ...cottage.gallery_images]
    .map((item) => resolveMediaUrl(item))
    .filter((item): item is string => Boolean(item))
    .slice(0, 6);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/cottages" className="text-sm font-medium text-[#2f5a3d]">← Back to cottages</Link>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-3">
          {gallery[0] ? (
            <img src={gallery[0]} alt={cottage.name} className="h-72 w-full rounded-2xl border border-[#dfd6c9] object-cover sm:h-96" />
          ) : (
            <div className="flex h-72 w-full items-center justify-center rounded-2xl border border-[#dfd6c9] bg-[#efe7d9] text-sm text-[#5d6b63] sm:h-96">Image unavailable</div>
          )}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {gallery.slice(1, 6).map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${cottage.name} ${index + 2}`}
                className="h-24 w-full rounded-xl border border-[#dfd6c9] object-cover sm:h-28"
              />
            ))}
          </div>
        </section>

        <article className="rounded-2xl border border-[#dfd6c9] bg-[#fdfbf7] p-5 sm:p-6">
          <h1 className="font-serif text-4xl text-[#224432]">{cottage.name}</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-[#5f7a68]">{cottage.category}</p>
          <p className="mt-3 text-sm text-[#59675e] sm:text-base">
            {cottage.full_description || cottage.short_description || "Comfortable stay in a peaceful setting."}
          </p>

          <dl className="mt-5 space-y-2 rounded-xl border border-[#e4dacd] bg-white p-4 text-sm text-[#3e4d44]">
            <div className="flex justify-between gap-4"><dt>Capacity</dt><dd className="font-medium">{cottage.max_total_guests} guests</dd></div>
            <div className="flex justify-between gap-4"><dt>Adults</dt><dd className="font-medium">{cottage.max_adults}</dd></div>
            {cottage.max_children > 0 ? <div className="flex justify-between gap-4"><dt>Children</dt><dd className="font-medium">{cottage.max_children}</dd></div> : null}
            {cottage.max_infants > 0 ? <div className="flex justify-between gap-4"><dt>Infants</dt><dd className="font-medium">Up to {cottage.max_infants} (below 2 years)</dd></div> : null}
            <div className="flex justify-between gap-4"><dt>Weekday</dt><dd className="font-medium">₹{Number(cottage.weekday_price).toLocaleString("en-IN")}</dd></div>
            <div className="flex justify-between gap-4"><dt>Weekend</dt><dd className="font-medium">₹{Number(cottage.weekend_price).toLocaleString("en-IN")}</dd></div>
          </dl>

          {cottage.amenities.length ? (
            <div className="mt-5">
              <h2 className="font-semibold text-[#2f503b]">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#4f5f55]">
                {cottage.amenities.map((item) => (
                  <li key={item} className="rounded-lg border border-[#e6ddcf] bg-white px-3 py-2">{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <BookNowButton cottageSlug={cottage.slug} className="inline-flex rounded-full bg-[#2f5a3d] px-5 py-2.5 text-sm font-semibold text-white" label="Book Now" />
            <Link href="/book" className="inline-flex rounded-full border border-[#2f5a3d] px-5 py-2.5 text-sm font-semibold text-[#2f5a3d]">
              Full booking form
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
