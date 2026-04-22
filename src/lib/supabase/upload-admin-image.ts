import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "lakitrep-media";

type UploadResult =
  | {
      success: true;
      path: string;
      url: string;
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

  const supabase = getSupabaseClient();
  const path = buildUploadPath(folder, file);

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return {
    success: true,
    path,
    url: data.publicUrl,
  };
}
