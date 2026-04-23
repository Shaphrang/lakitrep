import type { GALLERY_CATEGORY_OPTIONS } from "./constants";

export type GalleryCategorySlug = (typeof GALLERY_CATEGORY_OPTIONS)[number]["slug"];
export type GalleryCategoryKey = (typeof GALLERY_CATEGORY_OPTIONS)[number]["key"];

export type PropertyGalleryMedia = {
  id: string;
  property_id: string;
  category_slug: GalleryCategorySlug;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  storage_bucket: string;
  storage_path: string;
  public_url: string;
  sort_order: number;
  is_featured: boolean;
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyGalleryMediaInput = {
  property_id: string;
  category_slug: GalleryCategorySlug;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  storage_bucket: string;
  storage_path: string;
  public_url: string;
  sort_order?: number;
  is_featured?: boolean;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  mime_type?: string | null;
};

export type PublicGalleryItem = Pick<
  PropertyGalleryMedia,
  "id" | "title" | "alt_text" | "caption" | "category_slug" | "public_url" | "sort_order" | "is_featured"
>;

export type PublicGroupedGallery = Record<GalleryCategoryKey, PublicGalleryItem[]>;
