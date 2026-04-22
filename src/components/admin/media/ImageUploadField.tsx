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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input type="hidden" name={name} value={url} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!file) {
              setError("Choose a file first");
              return;
            }
            startTransition(async () => {
              const formData = new FormData();
              formData.append("file", file);
              formData.append("folder", folder);
              const result = await uploadAdminImageAction(formData);
              if (!result.success) {
                setError(result.error ?? "Upload failed");
                return;
              }
              setError("");
              setUrl(result.url ?? "");
              setFile(null);
            });
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          {isPending ? "Uploading..." : "Upload"}
        </button>
        {url ? (
          <button type="button" onClick={() => setUrl("")} className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700">
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {url ? <img src={url} alt={label} className="h-24 rounded-md object-cover" /> : null}
    </div>
  );
}
