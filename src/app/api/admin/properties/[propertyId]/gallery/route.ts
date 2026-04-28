import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { GALLERY_CATEGORY_SLUGS } from "@/features/gallery/constants";
import { getPropertyGalleryMedia, insertPropertyGalleryMedia } from "@/features/gallery/gallery-service";
import type { GalleryCategorySlug } from "@/features/gallery/types";
import { requireAdminPermission } from "@/lib/auth/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  try {
    await requireAdminPermission("properties.manage");
    const { propertyId } = await params;
    const rows = await getPropertyGalleryMedia(propertyId);
    return NextResponse.json({ items: rows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load gallery." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission("properties.manage");
    const body = (await request.json()) as {
      property_id: string;
      category_slug: GalleryCategorySlug;
      storage_bucket: string;
      storage_path: string;
      public_url: string;
      width?: number | null;
      height?: number | null;
      file_size?: number | null;
      mime_type?: string | null;
    };

    if (!GALLERY_CATEGORY_SLUGS.includes(body.category_slug)) {
      return NextResponse.json({ error: "Invalid gallery category." }, { status: 400 });
    }

    const current = await getPropertyGalleryMedia(body.property_id);
    const categoryRows = current.filter((item) => item.category_slug === body.category_slug);

    const row = await insertPropertyGalleryMedia({
      property_id: body.property_id,
      category_slug: body.category_slug,
      storage_bucket: body.storage_bucket,
      storage_path: body.storage_path,
      public_url: body.public_url,
      width: body.width ?? null,
      height: body.height ?? null,
      file_size: body.file_size ?? null,
      mime_type: body.mime_type ?? null,
      sort_order: categoryRows.length,
      is_featured: false,
    });

    revalidatePath(`/admin/properties/${body.property_id}`);
    revalidatePath(`/admin/properties/${body.property_id}/gallery`);

    return NextResponse.json({ item: row }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create gallery media." }, { status: 500 });
  }
}
