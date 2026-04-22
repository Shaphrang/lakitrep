"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "lakitrep-media";

export async function uploadAdminImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "misc").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please select an image file." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return { success: true, url: data.publicUrl, path };
}
