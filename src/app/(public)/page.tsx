import type { Metadata } from "next";
import {
  getAttractions,
  getPolicies,
  getPrimaryProperty,
  getPropertyGalleryByCategory,
  getPublicCottages,
  getSeoByPageKey,
} from "@/lib/public-site";
import { FAQ_ITEMS } from "@/components/public/home/home.constants";
import {
  AttractionsSection,
  CottagesSection,
  EventsSection,
  FinalCtaSection,
  GalleryPreviewSection,
  HeroSection,
  LocationReachSection,
  PoliciesFaqSection,
  QuickHighlightsSection,
  StorySection,
} from "@/components/public/home/sections";
import {
  buildGalleryPreviewCards,
  buildWhatsappEventLink,
  countTotalGalleryImages,
  firstGalleryImage,
  mapHomeExperiences,
} from "@/components/public/home/home.utils";

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

  const [attractions, policies, cottages, groupedGallery] = await Promise.all([
    getAttractions(property.id),
    getPolicies(property.id),
    getPublicCottages(property.id),
    getPropertyGalleryByCategory(property.id),
  ]);

  const aboutImagePrimary = firstGalleryImage(groupedGallery.exteriorView) || firstGalleryImage(groupedGallery.outdoorGarden);
  const aboutImageSecondary = firstGalleryImage(groupedGallery.interiorView) || firstGalleryImage(groupedGallery.premiumCottage);
  const aboutImageAccent = firstGalleryImage(groupedGallery.swimmingPool) || firstGalleryImage(groupedGallery.scenicViews);
  const eventImage =
    firstGalleryImage(groupedGallery.activitiesExperiences) ||
    firstGalleryImage(groupedGallery.outdoorGarden) ||
    firstGalleryImage(groupedGallery.scenicViews);

  const galleryPreviewCards = buildGalleryPreviewCards(groupedGallery);
  const totalGalleryImages = countTotalGalleryImages(groupedGallery);
  const experiences = mapHomeExperiences(attractions);
  const topPolicies = policies.slice(0, 3);
  const whatsappEventLink = buildWhatsappEventLink(property.whatsapp_number, property.phone_number);
  const hasWhatsappContact = Boolean(property.whatsapp_number || property.phone_number);

  return (
    <main>
      <HeroSection property={property} cottages={cottages} />
      <QuickHighlightsSection />
      <StorySection
        fullDescription={property.full_description}
        aboutImagePrimary={aboutImagePrimary}
        aboutImageSecondary={aboutImageSecondary}
        aboutImageAccent={aboutImageAccent}
      />
      <CottagesSection cottages={cottages} groupedGallery={groupedGallery} />
      <LocationReachSection
        whatsappDirectionsLink={whatsappEventLink}
        hasWhatsappContact={hasWhatsappContact}
      />
      <GalleryPreviewSection cards={galleryPreviewCards} totalGalleryImages={totalGalleryImages} />
      <AttractionsSection experiences={experiences} />
      <EventsSection eventImage={eventImage} whatsappEventLink={whatsappEventLink} />
      <PoliciesFaqSection topPolicies={topPolicies} faqItems={FAQ_ITEMS} />
      <FinalCtaSection />
    </main>
  );
}
