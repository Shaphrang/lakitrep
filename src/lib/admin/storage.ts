import { STORAGE_BUCKET } from "@/lib/admin/constants";

function getPublicBaseUrl() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/${STORAGE_BUCKET}` : "";
}

export function toSafeFilename(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]/g, "-").replace(/-+/g, "-");
}

export function buildStoragePath(baseFolder: string, file: File) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
  const stem = toSafeFilename(file.name.replace(/\.[^/.]+$/, "")) || "image";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cleanBase = baseFolder.replace(/\/+$/, "");
  return `${cleanBase}/${stem}-${unique}${ext ? `.${ext.toLowerCase()}` : ""}`;
}

export function resolveImageUrl(storagePath: string | null | undefined) {
  if (!storagePath) return "";
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  const base = getPublicBaseUrl();
  return base ? `${base}/${storagePath}` : storagePath;
}

export function extractStoragePath(storagePath: string | null | undefined) {
  if (!storagePath) return "";
  if (!storagePath.startsWith("http://") && !storagePath.startsWith("https://")) {
    return storagePath;
  }

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = storagePath.indexOf(marker);
  if (index === -1) return "";
  return storagePath.slice(index + marker.length);
}
