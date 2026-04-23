export const GALLERY_BUCKET = "property-media";

export const GALLERY_CATEGORY_OPTIONS = [
  { slug: "exterior-view", label: "Exterior View of Property", key: "exteriorView" },
  { slug: "interior-view", label: "Interior View", key: "interiorView" },
  { slug: "premium-cottage", label: "Premium Cottage Photos", key: "premiumCottage" },
  { slug: "standard-cottage", label: "Standard Cottage Photos", key: "standardCottage" },
  { slug: "swimming-pool", label: "Swimming Pool Area", key: "swimmingPool" },
  { slug: "restaurant-dining", label: "Restaurant / Dining Area", key: "restaurantDining" },
  { slug: "outdoor-garden", label: "Outdoor / Garden Spaces", key: "outdoorGarden" },
  { slug: "scenic-views", label: "Scenic Views / Surroundings", key: "scenicViews" },
  { slug: "activities-experiences", label: "Activities / Experiences", key: "activitiesExperiences" },
] as const;

export const GALLERY_CATEGORY_SLUGS = GALLERY_CATEGORY_OPTIONS.map((item) => item.slug);

export const MAX_GALLERY_UPLOAD_MB = 8;
export const MAX_GALLERY_UPLOAD_BYTES = MAX_GALLERY_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_GALLERY_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
