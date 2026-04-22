export type PropertyStatus = "active" | "draft" | "inactive";

export type Property = {
  id: string;
  name: string;
  slug: string;
  location: string;
  shortDescription: string;
  status: PropertyStatus;
};
