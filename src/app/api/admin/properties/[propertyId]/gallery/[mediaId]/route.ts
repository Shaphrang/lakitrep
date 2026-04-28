import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deletePropertyGalleryMediaRow, getPropertyGalleryMediaById, updatePropertyGalleryMedia } from "@/features/gallery/gallery-service";
import { GALLERY_BUCKET } from "@/features/gallery/constants";
import { requireAdminPermission } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ propertyId: string; mediaId: string }> }) {
  try {
    await requireAdminPermission("properties.manage");
    const { propertyId, mediaId } = await params;
    const payload = (await request.json()) as {
      title: string | null;
      alt_text: string | null;
      caption: string | null;
      is_featured: boolean;
    };

    const item = await updatePropertyGalleryMedia(mediaId, payload);
    revalidatePath(`/admin/properties/${propertyId}/gallery`);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update media." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ propertyId: string; mediaId: string }> }) {
  try {
    await requireAdminPermission("properties.manage");
    const { propertyId, mediaId } = await params;
    const row = await getPropertyGalleryMediaById(mediaId);

    if (!row) {
      return NextResponse.json({ error: "Gallery row not found." }, { status: 404 });
    }

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.storage.from(GALLERY_BUCKET).remove([row.storage_path]);

    if (error) {
      return NextResponse.json(
        {
          error: `Storage delete failed. Remove '${row.storage_path}' manually from ${GALLERY_BUCKET}.`,
        },
        { status: 500 },
      );
    }

    await deletePropertyGalleryMediaRow(mediaId);

    revalidatePath(`/admin/properties/${propertyId}/gallery`);
    revalidatePath(`/admin/properties/${propertyId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete media." }, { status: 500 });
  }
}
