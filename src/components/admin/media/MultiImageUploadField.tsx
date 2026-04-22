"use client";

import { useState, useTransition } from "react";
import { uploadAdminImageFromClient } from "@/lib/supabase/upload-admin-image";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValues?: string[];
};

export function MultiImageUploadField({ label, folder, name, defaultValues = [] }: Props) {
  const [images, setImages] = useState<string[]>(defaultValues);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const uploadFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    startTransition(async () => {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const result = await uploadAdminImageFromClient(file, folder);

        if (!result.success) {
          setError(result.error ?? "Upload failed");
          continue;
        }

        uploadedUrls.push(result.url);
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        setError("");
      }
    });
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={images.join("\n")} />
      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadFiles(e.target.files)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      {isPending ? <p className="text-xs text-slate-500">Uploading...</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="relative">
            <img src={image} alt="Gallery" className="h-20 w-full rounded-md object-cover" />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
