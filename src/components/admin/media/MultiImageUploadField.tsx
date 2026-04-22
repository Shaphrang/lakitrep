"use client";

import { useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET ?? "lakitrep-media";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValues?: string[];
};

function buildFilePath(folder: string, fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
}

export function MultiImageUploadField({ label, folder, name, defaultValues = [] }: Props) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(defaultValues);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const pendingPreviews = useMemo(
    () => selectedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  async function uploadSelected() {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError("");

    const supabase = getSupabaseClient();
    const nextUrls: string[] = [];

    for (const file of selectedFiles) {
      const filePath = buildFilePath(folder, file.name);
      const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (uploadError) {
        setError(uploadError.message);
        setIsUploading(false);
        return;
      }

      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
      nextUrls.push(data.publicUrl);
    }

    setUploadedImages((prev) => [...prev, ...nextUrls]);
    setSelectedFiles([]);
    setIsUploading(false);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={uploadedImages.join("\n")} />

      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>

      <button type="button" onClick={uploadSelected} disabled={selectedFiles.length === 0 || isUploading} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50">
        {isUploading ? "Uploading..." : `Upload ${selectedFiles.length || ""} image(s)`}
      </button>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {pendingPreviews.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-slate-500">Selected previews</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {pendingPreviews.map((preview) => (
              <div key={`${preview.file.name}-${preview.file.size}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt="Selected preview" className="h-20 w-full rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setSelectedFiles((prev) => prev.filter((item) => item !== preview.file))}
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/80 text-xs text-white"
                  aria-label="Remove selected image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {uploadedImages.map((image) => (
          <div key={image} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Gallery" className="h-20 w-full rounded-md object-cover" />
            <button
              type="button"
              onClick={() => setUploadedImages((prev) => prev.filter((item) => item !== image))}
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black/80 text-xs text-white"
              aria-label="Remove gallery image"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
