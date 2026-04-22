"use client";

import { useState, useTransition } from "react";
import { uploadAdminImageAction } from "@/actions/admin/media";

type Props = {
  label: string;
  folder: string;
  name: string;
  defaultValues?: string[];
};

export function MultiImageUploadField({ label, folder, name, defaultValues = [] }: Props) {
  const [images, setImages] = useState<string[]>(defaultValues);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={images.join("\n")} />
      <label className="block text-sm">
        <span className="mb-1 block">{label}</span>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
      </label>
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
            if (!result.success || !result.url) {
              setError(result.error ?? "Upload failed");
              return;
            }
            setError("");
            setImages((prev) => [...prev, result.url!]);
            setFile(null);
          });
        }}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
      >
        {isPending ? "Uploading..." : "Upload image"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {images.map((image) => (
          <div key={image} className="space-y-1">
            <img src={image} alt="Gallery" className="h-20 w-full rounded-md object-cover" />
            <button type="button" onClick={() => setImages((prev) => prev.filter((x) => x !== image))} className="text-xs text-red-600">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
