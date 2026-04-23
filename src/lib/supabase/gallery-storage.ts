"use client";

import { ALLOWED_GALLERY_MIME_TYPES, GALLERY_BUCKET } from "@/features/gallery/constants";
import type { GalleryCategorySlug, PropertyGalleryMedia } from "@/features/gallery/types";
import { optimizeAdminImage } from "@/lib/supabase/optimize-admin-image";
import { getSupabaseClient } from "@/lib/supabase/client";

export type GalleryUploadOptions = {
  propertyId: string;
  categorySlug: GalleryCategorySlug;
  files: File[];
};

export function getGalleryPublicUrl(storagePath: string, cacheBuster = Date.now()): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);
  return `${data.publicUrl}?v=${cacheBuster}`;
}

function buildGalleryPath(propertyId: string, categorySlug: GalleryCategorySlug) {
  return `properties/${propertyId}/${categorySlug}/${Date.now()}-${crypto.randomUUID()}.webp`;
}

function validateGalleryFile(file: File): string | null {
  if (!ALLOWED_GALLERY_MIME_TYPES.includes(file.type as (typeof ALLOWED_GALLERY_MIME_TYPES)[number])) {
    return `${file.name}: Invalid file type. Only JPEG, PNG, and WebP are supported.`;
  }

  return null;
}

export async function uploadGalleryImages(options: GalleryUploadOptions): Promise<
  Array<{
    media: PropertyGalleryMedia;
    previewUrl: string;
  }>
> {
  const supabase = getSupabaseClient();
  const createdRows: Array<{ media: PropertyGalleryMedia; previewUrl: string }> = [];

  for (const file of options.files) {
    const validationError = validateGalleryFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    const optimized = await optimizeAdminImage(file, `properties/${options.propertyId}/${options.categorySlug}/gallery`);

    if (!optimized.success) {
      throw new Error(optimized.error);
    }

    const storagePath = buildGalleryPath(options.propertyId, options.categorySlug);
    const uploadResult = await supabase.storage.from(GALLERY_BUCKET).upload(storagePath, optimized.file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: "image/webp",
    });

    if (uploadResult.error) {
      throw new Error(`Storage upload failed (${file.name}): ${uploadResult.error.message}`);
    }

    const metadataResponse = await fetch(`/api/admin/properties/${options.propertyId}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: options.propertyId,
        category_slug: options.categorySlug,
        storage_bucket: GALLERY_BUCKET,
        storage_path: storagePath,
        public_url: getGalleryPublicUrl(storagePath),
        width: optimized.outputWidth,
        height: optimized.outputHeight,
        file_size: optimized.optimizedSizeBytes,
        mime_type: "image/webp",
      }),
    });

    if (!metadataResponse.ok) {
      await supabase.storage.from(GALLERY_BUCKET).remove([storagePath]);
      throw new Error(`Metadata insert failed (${file.name}). Upload was rolled back.`);
    }

    const body = (await metadataResponse.json()) as { item: PropertyGalleryMedia };
    createdRows.push({ media: body.item, previewUrl: getGalleryPublicUrl(storagePath) });
  }

  return createdRows;
}

export async function deleteGalleryImage(propertyId: string, mediaId: string): Promise<void> {
  const response = await fetch(`/api/admin/properties/${propertyId}/gallery/${mediaId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Delete failed." }))) as { error?: string };
    throw new Error(body.error ?? "Delete failed.");
  }
}

export async function reorderGalleryImages(
  propertyId: string,
  categorySlug: GalleryCategorySlug,
  sortedIds: string[],
): Promise<void> {
  const response = await fetch(`/api/admin/properties/${propertyId}/gallery/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      category_slug: categorySlug,
      items: sortedIds.map((id, index) => ({ id, sort_order: index })),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Reorder failed." }))) as { error?: string };
    throw new Error(body.error ?? "Reorder failed.");
  }
}

export async function updateGalleryImageMetadata(
  propertyId: string,
  mediaId: string,
  payload: { title: string | null; alt_text: string | null; caption: string | null; is_featured: boolean },
): Promise<PropertyGalleryMedia> {
  const response = await fetch(`/api/admin/properties/${propertyId}/gallery/${mediaId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: "Update failed." }))) as { error?: string };
    throw new Error(body.error ?? "Update failed.");
  }

  const body = (await response.json()) as { item: PropertyGalleryMedia };
  return body.item;
}
