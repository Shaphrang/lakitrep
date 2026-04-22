export type AttractionStatus = "active" | "draft" | "inactive";

export type Attraction = {
  id: string;
  propertyId: string;
  name: string;
  slug: string;
  shortDescription: string;
  duration: string;
  status: AttractionStatus;
};
