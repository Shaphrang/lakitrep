export type CottageStatus = "active" | "draft" | "inactive";

export type Cottage = {
  id: string;
  propertyId: string;
  name: string;
  code: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  amenities: string[];
  basePrice: number;
  weekendPrice: number;
  coverImage: string;
  galleryImages: string[];
  maxGuests: number;
  status: CottageStatus;
};
