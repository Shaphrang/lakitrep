import Link from "next/link";
import type { Metadata } from "next";
import {
  getPrimaryProperty,
  getPropertyGalleryByCategory,
  resolveMediaUrl,
  getSeoByPageKey,
} from "@/lib/public-site";

export const revalidate = 300;

type RawGalleryItem = {
  public_url: string;
  alt_text: string | null;
  caption: string | null;
};

type GalleryImage = {
  url: string;
  alt: string;
  caption?: string | null;
};

type GallerySection = {
  key: string;
  title: string;
  note: string;
  items: GalleryImage[];
};

function mapGalleryImage(item?: RawGalleryItem): GalleryImage | null {
  if (!item) return null;
  const url = resolveMediaUrl(item.public_url);
  if (!url) return null;

  return {
    url,
    alt: item.alt_text || item.caption || "La Ki Trep gallery image",
    caption: item.caption,
  };
}

function mapGalleryList(items: RawGalleryItem[] = []): GalleryImage[] {
  return items
    .map((item) => mapGalleryImage(item))
    .filter(Boolean) as GalleryImage[];
}

export async function generateMetadata(): Promise<Metadata> {
  const property = await getPrimaryProperty();

  if (!property) {
    return {
      title: "Gallery | La Ki Trep Resort",
      description: "Gallery images from La Ki Trep Resort.",
    };
  }

  const seo = await getSeoByPageKey(property.id, "gallery");

  return {
    title: seo?.meta_title || `Gallery | ${property.name}`,
    description:
      seo?.meta_description ||
      "Browse cottages, pool, dining, outdoor spaces, and scenic views at La Ki Trep Resort.",
  };
}

export default async function GalleryPage() {
  const property = await getPrimaryProperty();

  if (!property) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        Gallery is not available yet.
      </main>
    );
  }

  const groupedGallery = await getPropertyGalleryByCategory(property.id);

  const sections: GallerySection[] = [
    {
      key: "exterior-view",
      title: "Exterior View",
      note: "First impressions of the property and its arrival atmosphere.",
      items: mapGalleryList(groupedGallery.exteriorView),
    },
    {
      key: "interior-view",
      title: "Interior View",
      note: "Inside the resort spaces and selected room details.",
      items: mapGalleryList(groupedGallery.interiorView),
    },
    {
      key: "premium-cottage",
      title: "Premium Cottage",
      note: "Premium cottage visuals, sit-outs, and room details.",
      items: mapGalleryList(groupedGallery.premiumCottage),
    },
    {
      key: "standard-cottage",
      title: "Standard Cottage",
      note: "Standard cottage visuals and practical stay moments.",
      items: mapGalleryList(groupedGallery.standardCottage),
    },
    {
      key: "swimming-pool",
      title: "Swimming Pool",
      note: "Poolside ambience and leisure moments on the property.",
      items: mapGalleryList(groupedGallery.swimmingPool),
    },
    {
      key: "restaurant-dining",
      title: "Restaurant & Dining",
      note: "Dining ambience and in-house meal setting.",
      items: mapGalleryList(groupedGallery.restaurantDining),
    },
    {
      key: "outdoor-garden",
      title: "Outdoor & Garden Spaces",
      note: "Open-air corners, lawns, sit-outs, and slower outdoor moments.",
      items: mapGalleryList(groupedGallery.outdoorGarden),
    },
    {
      key: "scenic-views",
      title: "Scenic Surroundings",
      note: "Landscape views, quiet corners, and nearby natural mood.",
      items: mapGalleryList(groupedGallery.scenicViews),
    },
    {
      key: "activities-experiences",
      title: "Activities & Experiences",
      note: "Resort-linked experiences and activity visuals, where available.",
      items: mapGalleryList(groupedGallery.activitiesExperiences),
    },
  ].filter((section) => section.items.length > 0);

  const totalImages = sections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  return (
    <main className="bg-[#f6f1e8]">
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12 lg:pt-14">
        <div className="rounded-[32px] border border-[#ddd2c2] bg-[linear-gradient(135deg,#f9f4eb_0%,#fcfaf5_45%,#f2eadf_100%)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#0f7c69]">
                Photo Gallery
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#214531] sm:text-5xl">
                All images from La Ki Trep
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5a685e] sm:text-base">
                Explore cottages, the swimming pool, dining, garden spaces, and
                scenic surroundings through the full gallery collection.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-full border border-[#d7ccb8] bg-white px-4 py-2 text-sm font-semibold text-[#2d593b]"
              >
                Back to home
              </Link>
              <span className="rounded-full bg-[#214531] px-4 py-2 text-sm font-semibold text-white">
                {totalImages} images
              </span>
            </div>
          </div>

          {sections.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section.key}
                  href={`#${section.key}`}
                  className="rounded-full border border-[#ddd5c9] bg-white/85 px-3 py-1.5 text-sm text-[#375441] transition hover:bg-white"
                >
                  {section.title}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16">
        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.key}
                id={section.key}
                className="scroll-mt-24 rounded-[28px] border border-[#dfd6c9] bg-[#fdfbf7] p-4 shadow-sm sm:p-5"
              >
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#708073]">
                    Gallery Category
                  </p>
                  <h2 className="mt-1 font-serif text-3xl text-[#214531] sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5b675f] sm:text-base">
                    {section.note}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((image, index) => (
                    <a
                      key={`${section.key}-${index}`}
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-[24px] border border-[#e6ddcf] bg-[#f7f2e9] shadow-sm"
                    >
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,16,12,0.02)_0%,rgba(10,16,12,0.12)_42%,rgba(10,16,12,0.5)_100%)]" />
                      </div>

                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-medium text-[#2d4b38]">
                          {image.caption || image.alt}
                        </p>
                        <p className="mt-2 text-xs text-[#6d786f]">
                          Open image ↗
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d8cdbd] bg-[#faf6ee] p-6 text-sm text-[#5a685e]">
            Gallery images will appear here once media is published.
          </div>
        )}
      </section>
    </main>
  );
}
