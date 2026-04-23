import type { PublicGroupedGallery, PublicGalleryItem } from "@/features/gallery/types";
import { getFirstImage, resolveMediaUrl } from "@/lib/public-site";
import type {
  GalleryImage,
  GalleryPreviewCard,
  HomeAttractionInput,
  HomeCottage,
  HomeExperience,
} from "./home.types";
import { FALLBACK_EXPERIENCES } from "./home.constants";

function mapGalleryImage(item?: PublicGalleryItem): GalleryImage | null {
  if (!item) return null;
  const url = resolveMediaUrl(item.public_url);
  if (!url) return null;

  return {
    url,
    alt: item.alt_text || item.caption || "La Ki Trep gallery image",
    caption: item.caption,
  };
}

export function firstGalleryImage(images: PublicGalleryItem[]): GalleryImage | null {
  return mapGalleryImage(images[0]);
}

export function getGalleryUrl(items?: PublicGalleryItem[]): string | null {
  return resolveMediaUrl(items?.[0]?.public_url);
}

export function buildWhatsappEventLink(whatsappNumber?: string | null, phoneNumber?: string | null): string {
  const digits = (whatsappNumber || phoneNumber || "6009044450").replace(/\D/g, "");
  const msisdn = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${msisdn}`;
}

export function buildGalleryPreviewCards(groupedGallery: PublicGroupedGallery): GalleryPreviewCard[] {
  return [
    {
      key: "exterior-view",
      label: "Hero exterior / aerial photo",
      image: firstGalleryImage(groupedGallery.exteriorView) || firstGalleryImage(groupedGallery.outdoorGarden),
      className: "md:col-span-6 min-h-[320px]",
    },
    {
      key: "premium-cottage",
      label: "Premium cottage balcony / sit-out",
      image: firstGalleryImage(groupedGallery.premiumCottage) || firstGalleryImage(groupedGallery.interiorView),
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
  ].filter((item): item is GalleryPreviewCard => Boolean(item.image));
}

export function countTotalGalleryImages(groupedGallery: PublicGroupedGallery): number {
  return [
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
}

export function mapHomeExperiences(attractions: HomeAttractionInput[]): HomeExperience[] {
  if (attractions.length === 0) {
    return FALLBACK_EXPERIENCES.map((item) => ({ ...item, distance: "Nearby", image: null }));
  }

  return attractions.slice(0, 6).map((item) => ({
    name: item.name,
    note: item.description || "A nearby highlight to pair with your stay itinerary.",
    distance: item.distance_text || "Near La Ki Trep",
    image: resolveMediaUrl(getFirstImage(item.cover_image, item.gallery_images)),
  }));
}

export function getCottageHeroImage(cottage: HomeCottage, groupedGallery: PublicGroupedGallery): string | null {
  const category = String(cottage.category || "").toLowerCase();

  const fallbackByCategory = category.includes("premium")
    ? getGalleryUrl(groupedGallery.premiumCottage)
    : category.includes("standard")
      ? getGalleryUrl(groupedGallery.standardCottage)
      : getGalleryUrl(groupedGallery.interiorView);

  return resolveMediaUrl(getFirstImage(cottage.cover_image || fallbackByCategory || null, cottage.gallery_images));
}
