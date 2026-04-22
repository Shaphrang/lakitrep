"use client";

import { useState, useTransition } from "react";
import { uploadAdminImageAction } from "@/actions/admin/media";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValue?: string | null;
};

export function ImageUploadField({ label, folder, name, defaultValue }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

    const uploadFile = (file: File | null) => {
    if (!file) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const result = await uploadAdminImageAction(formData);

      if (!result.success || !result.url) {
        setError(result.error ?? "Upload failed");
        return;
      }

      setError("");
      setUrl(result.url);
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
          onChange={(e) => uploadFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />
        </label>
      {isPending ? <p className="text-xs text-slate-500">Uploading...</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {url ? (
        <div className="relative inline-block">
          <img src={url} alt={label} className="h-24 rounded-md object-cover" />
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
