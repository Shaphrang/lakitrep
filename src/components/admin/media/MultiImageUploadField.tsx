"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { uploadAdminImageFromClient } from "@/lib/supabase/upload-admin-image";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValues?: string[];
};

function formatKilobytes(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

export function MultiImageUploadField({ label, folder, name, defaultValues = [] }: Props) {
  const [images, setImages] = useState<string[]>(defaultValues);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [progress, setProgress] = useState("");
  const [isPending, startTransition] = useTransition();

  const uploadFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);

    startTransition(async () => {
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];
      let totalOriginalBytes = 0;
      let totalUploadedBytes = 0;

      setError("");
      setUploadMessage("");

      for (const [index, file] of selectedFiles.entries()) {
        setProgress(`Optimizing and uploading ${index + 1} of ${selectedFiles.length}...`);

        const result = await uploadAdminImageFromClient(file, folder);

        if (!result.success) {
          failedFiles.push(file.name);
          continue;
        }

        uploadedUrls.push(result.url);
        totalOriginalBytes += result.originalSizeBytes;
        totalUploadedBytes += result.uploadedSizeBytes;
      }

      setProgress("");

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        setUploadMessage(
          `Uploaded ${uploadedUrls.length} optimized image(s) (${formatKilobytes(totalOriginalBytes)} → ${formatKilobytes(totalUploadedBytes)}).`,
        );
      }

      if (failedFiles.length > 0) {
        setError(`Failed to upload ${failedFiles.length} file(s). Please retry.`);
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
          onChange={(e) => {
            uploadFiles(e.target.files);
            e.currentTarget.value = "";
          }}
          disabled={isPending}
          aria-busy={isPending}
          className="w-full rounded-md border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </label>
      {isPending ? <p className="inline-flex items-center gap-2 text-xs text-slate-500"><LoadingSpinner className="h-3 w-3" />Uploading...</p> : null}
      {progress ? <p className="text-xs text-slate-500">{progress}</p> : null}
      {uploadMessage ? <p className="text-xs text-emerald-700">{uploadMessage}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="relative h-20">
            <Image src={image} alt="Gallery" className="rounded-md object-cover" fill sizes="(max-width: 768px) 50vw, 25vw" unoptimized />
            <button
              type="button"
              onClick={() => setImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))}
              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
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
