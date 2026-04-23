import type { PublicAttraction, PublicCottage, PublicPolicy } from "@/lib/public-site";

export type GalleryImage = {
  url: string;
  alt: string;
  caption?: string | null;
};

export type QuickHighlightIconType = "stay" | "pool" | "dining" | "nature" | "scenic";

export type QuickHighlight = {
  title: string;
  note: string;
  icon: QuickHighlightIconType;
};

export type FallbackExperience = {
  name: string;
  note: string;
};

export type FaqItem = {
  title: string;
  points: string[];
};

export type GalleryPreviewCard = {
  key: string;
  label: string;
  image: GalleryImage;
  className: string;
};

export type HomeExperience = {
  name: string;
  note: string;
  distance: string;
  image: string | null;
};

export type HomeAttractionInput = PublicAttraction;
export type HomePolicy = PublicPolicy;
export type HomeCottage = PublicCottage;
