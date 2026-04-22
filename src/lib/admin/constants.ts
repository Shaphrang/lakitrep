export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "rejected",
  "no_show",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid_on_arrival", "partially_paid", "waived"] as const;

export const INQUIRY_STATUSES = ["new", "contacted", "closed", "spam"] as const;

export const EVENT_INQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "confirmed",
  "cancelled",
  "closed",
] as const;

export const COTTAGE_STATUSES = ["active", "inactive", "maintenance"] as const;

export const SITE_SETTING_KEYS = {
  HOMEPAGE_HERO: "homepage_hero",
  SEO_HOMEPAGE: "seo_homepage",
} as const;

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "lakitrep-media";
