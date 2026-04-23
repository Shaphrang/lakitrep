import { getSupabaseClient } from "@/lib/supabase/client";
import { optimizeAdminImage } from "@/lib/supabase/optimize-admin-image";

const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "lakitrep-media";

type UploadResult =
  | {
      success: true;
      path: string;
      url: string;
      originalSizeBytes: number;
      uploadedSizeBytes: number;
    }
  | {
      success: false;
      error: string;
    };

function buildUploadPath(folder: string, file: File) {
  const cleanFolder = folder.trim() || "misc";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return `${cleanFolder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
}

export async function uploadAdminImageFromClient(file: File, folder: string): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  const optimized = await optimizeAdminImage(file, folder);

  if (!optimized.success) {
    return { success: false, error: optimized.error };
  }

  const supabase = getSupabaseClient();
  const path = buildUploadPath(folder, optimized.file);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, optimized.file, {
    cacheControl: "3600",
    upsert: false,
    contentType: optimized.file.type,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return {
    success: true,
    path,
    url: data.publicUrl,
    originalSizeBytes: optimized.originalSizeBytes,
    uploadedSizeBytes: optimized.optimizedSizeBytes,
  };
}
