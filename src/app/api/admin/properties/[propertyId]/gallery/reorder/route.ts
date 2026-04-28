import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { GALLERY_CATEGORY_SLUGS } from "@/features/gallery/constants";
import { reorderPropertyGalleryMedia } from "@/features/gallery/gallery-service";
import { requireAdminPermission } from "@/lib/auth/admin";

export async function POST(request: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  try {
    await requireAdminPermission("properties.manage");
    const { propertyId } = await params;
    const body = (await request.json()) as {
      category_slug: string;
      items: Array<{ id: string; sort_order: number }>;
    };

    if (!GALLERY_CATEGORY_SLUGS.includes(body.category_slug as (typeof GALLERY_CATEGORY_SLUGS)[number])) {
      return NextResponse.json({ error: "Invalid gallery category." }, { status: 400 });
    }

    await reorderPropertyGalleryMedia(body.items);
    revalidatePath(`/admin/properties/${propertyId}/gallery`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reorder gallery." }, { status: 500 });
  }
}
