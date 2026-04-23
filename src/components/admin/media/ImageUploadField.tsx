"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { uploadAdminImageFromClient } from "@/lib/supabase/upload-admin-image";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValue?: string | null;
};

function formatKilobytes(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

export function ImageUploadField({ label, folder, name, defaultValue }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const uploadFile = (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadMessage("Optimizing image...");

    startTransition(async () => {
      const result = await uploadAdminImageFromClient(file, folder);

      if (!result.success) {
        setError(result.error ?? "Upload failed");
        setUploadMessage("");
        return;
      }

      setError("");
      setUrl(result.url);
      setUploadMessage(
        `Uploaded optimized image (${formatKilobytes(result.originalSizeBytes)} → ${formatKilobytes(result.uploadedSizeBytes)}).`,
      );
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input type="hidden" name={name} value={url} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            uploadFile(e.target.files?.[0] ?? null);
            e.currentTarget.value = "";
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      {isPending ? <p className="text-xs text-slate-500">Optimizing and uploading...</p> : null}
      {uploadMessage ? <p className="text-xs text-emerald-700">{uploadMessage}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {url ? (
        <div className="relative inline-block">
          <Image src={url} alt={label} className="h-24 w-24 rounded-md object-cover" width={96} height={96} unoptimized />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
            aria-label={`Remove ${label}`}
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
