"use client";

import { useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "lakitrep-media";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValue?: string | null;
};

function buildFilePath(folder: string, fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const random = crypto.randomUUID();
  return `${folder}/${Date.now()}-${random}.${ext}`;
}

export function ImageUploadField({ label, folder, name, defaultValue }: Props) {
  const [uploadedUrl, setUploadedUrl] = useState(defaultValue ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : ""), [selectedFile]);

  async function uploadSelected() {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    const supabase = getSupabaseClient();
    const filePath = buildFilePath(folder, selectedFile.name);
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, selectedFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: selectedFile.type,
    });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
    setUploadedUrl(data.publicUrl);
    setSelectedFile(null);
    setIsUploading(false);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={uploadedUrl} />

      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="flex gap-2">
        <button type="button" onClick={uploadSelected} disabled={!selectedFile || isUploading} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {previewUrl || uploadedUrl ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl || uploadedUrl} alt={label} className="h-28 w-40 rounded-md object-cover" />
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setUploadedUrl("");
            }}
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/80 text-xs text-white"
            aria-label={`Remove ${label}`}
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
