import type { Metadata } from "next";
import { BookingRequestForm } from "@/components/public/BookingRequestForm";
import { getPrimaryProperty, getPublicCottages, getSeoByPageKey } from "@/lib/public-site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();
  if (!property) return { title: "Book" };
  const seo = await getSeoByPageKey(property.id, "book");

  return {
    title: seo?.meta_title || `Book your stay | ${property.name}`,
    description: seo?.meta_description || "Submit a booking request directly from the official website.",
  };
}

export default async function BookPage() {
  const property = await getPrimaryProperty();
  if (!property) return <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">No property found.</main>;

  const cottages = await getPublicCottages(property.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-semibold text-white sm:text-4xl">Request a booking</h1>
      <p className="mt-2 text-sm text-stone-200 sm:text-base">
        {property.booking_note || "Submit your preferred dates and cottage. Our team confirms availability shortly."}
      </p>

      <div className="mt-6">
        <BookingRequestForm cottages={cottages} />
      </div>
    </main>
  );
}
