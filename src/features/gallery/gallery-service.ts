import { cache } from "react";
import { GALLERY_CATEGORY_OPTIONS } from "@/features/gallery/constants";
import type {
  GalleryCategoryKey,
  PropertyGalleryMedia,
  PropertyGalleryMediaInput,
  PublicGalleryItem,
  PublicGroupedGallery,
} from "@/features/gallery/types";
import { getSupabasePublicServerClient } from "@/lib/supabase/public-server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const GALLERY_MEDIA_SELECT =
  "id,property_id,category_slug,title,alt_text,caption,storage_bucket,storage_path,public_url,sort_order,is_featured,width,height,file_size,mime_type,created_at,updated_at";

export async function getPropertyGalleryMedia(propertyId: string): Promise<PropertyGalleryMedia[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_gallery_media")
    .select(GALLERY_MEDIA_SELECT)
    .eq("property_id", propertyId)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch property gallery media: ${error.message}`);
  }

  return (data ?? []) as PropertyGalleryMedia[];
}


export async function getPropertyGalleryMediaById(id: string): Promise<PropertyGalleryMedia | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("property_gallery_media").select(GALLERY_MEDIA_SELECT).eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch gallery row: ${error.message}`);
  }

  return (data as PropertyGalleryMedia | null) ?? null;
}

export async function insertPropertyGalleryMedia(input: PropertyGalleryMediaInput): Promise<PropertyGalleryMedia> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("property_gallery_media").insert(input).select(GALLERY_MEDIA_SELECT).single();

  if (error) {
    throw new Error(`Failed to create gallery media row: ${error.message}`);
  }

  return data as PropertyGalleryMedia;
}

export async function updatePropertyGalleryMedia(
  id: string,
  payload: Pick<PropertyGalleryMedia, "title" | "alt_text" | "caption" | "is_featured">,
): Promise<PropertyGalleryMedia> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("property_gallery_media")
    .update(payload)
    .eq("id", id)
    .select(GALLERY_MEDIA_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update gallery media row: ${error.message}`);
  }

  return data as PropertyGalleryMedia;
}

export async function reorderPropertyGalleryMedia(items: Array<{ id: string; sort_order: number }>): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const supabase = await getSupabaseServerClient();

  for (const item of items) {
    const { error } = await supabase.from("property_gallery_media").update({ sort_order: item.sort_order }).eq("id", item.id);
    if (error) {
      throw new Error(`Failed to persist gallery order: ${error.message}`);
    }
  }
}

export async function deletePropertyGalleryMediaRow(id: string): Promise<PropertyGalleryMedia> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("property_gallery_media").delete().eq("id", id).select(GALLERY_MEDIA_SELECT).single();

  if (error) {
    throw new Error(`Failed to delete gallery row: ${error.message}`);
  }

  return data as PropertyGalleryMedia;
}

export const getPublicGalleryByPropertyId = cache(async (propertyId: string): Promise<PublicGroupedGallery> => {
  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("property_gallery_media")
    .select("id,title,alt_text,caption,category_slug,public_url,sort_order,is_featured,created_at")
    .eq("property_id", propertyId)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch public gallery media: ${error.message}`);
  }

  const initial = GALLERY_CATEGORY_OPTIONS.reduce<PublicGroupedGallery>((acc, category) => {
    acc[category.key as GalleryCategoryKey] = [];
    return acc;
  }, {} as PublicGroupedGallery);

  for (const row of data ?? []) {
    const category = GALLERY_CATEGORY_OPTIONS.find((item) => item.slug === row.category_slug);
    if (!category) {
      continue;
    }

    const item: PublicGalleryItem = {
      id: row.id,
      title: row.title,
      alt_text: row.alt_text,
      caption: row.caption,
      category_slug: row.category_slug,
      public_url: row.public_url,
      sort_order: row.sort_order,
      is_featured: row.is_featured,
    };

    initial[category.key].push(item);
  }

  return initial;
});
