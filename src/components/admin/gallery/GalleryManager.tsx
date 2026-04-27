"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { GALLERY_CATEGORY_OPTIONS } from "@/features/gallery/constants";
import type { GalleryCategorySlug, PropertyGalleryMedia } from "@/features/gallery/types";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";
import {
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageMetadata,
  uploadGalleryImages,
} from "@/lib/supabase/gallery-storage";

type Props = {
  propertyId: string;
  initialItems: PropertyGalleryMedia[];
};

const inputClass = "mt-1 w-full rounded-lg border border-[#d8cfbf] bg-[#fdfbf7] px-3 py-2 text-xs text-[#21392c]";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error. Please retry.";
}

export function GalleryManager({ propertyId, initialItems }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategorySlug>(GALLERY_CATEGORY_OPTIONS[0].slug);
  const [items, setItems] = useState(initialItems);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");

  const visibleItems = useMemo(
    () => items.filter((item) => item.category_slug === selectedCategory).sort((a, b) => a.sort_order - b.sort_order),
    [items, selectedCategory],
  );

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || isUploading) {
      return;
    }

    const selectedFiles = Array.from(fileList);
    const seen = new Set<string>();
    const deduped = selectedFiles.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    setIsUploading(true);
    setError("");
    setUploadStatus(`Uploading ${deduped.length} image(s)...`);

    try {
      const uploaded = await uploadGalleryImages({ propertyId, categorySlug: selectedCategory, files: deduped });
      const existingCount = items.filter((item) => item.category_slug === selectedCategory).length;

      setItems((current) => [
        ...current,
        ...uploaded.map((entry, index) => ({ ...entry.media, sort_order: existingCount + index })),
      ]);
      setUploadStatus(`Uploaded ${uploaded.length} image(s).`);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
      setUploadStatus("");
    } finally {
      setIsUploading(false);
    }
  };

  const onDelete = async (media: PropertyGalleryMedia) => {
    if (!confirm("Delete this gallery image? This cannot be undone.")) {
      return;
    }

    setPendingIds((current) => [...current, media.id]);
    setError("");

    try {
      await deleteGalleryImage(propertyId, media.id);
      setItems((current) => current.filter((item) => item.id !== media.id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setPendingIds((current) => current.filter((id) => id !== media.id));
    }
  };

  const onReorder = async (index: number, direction: "up" | "down") => {
    const next = [...visibleItems];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= next.length) {
      return;
    }

    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    const nextIds = next.map((item) => item.id);

    const previousItems = items;
    const optimistic = previousItems.map((item) => {
      if (item.category_slug !== selectedCategory) return item;
      const order = nextIds.indexOf(item.id);
      return order >= 0 ? { ...item, sort_order: order } : item;
    });

    setItems(optimistic);

    try {
      await reorderGalleryImages(propertyId, selectedCategory, nextIds);
    } catch (reorderError) {
      setError(getErrorMessage(reorderError));
      setItems(previousItems);
    }
  };

  const onSaveMetadata = async (
    mediaId: string,
    payload: { title: string | null; alt_text: string | null; caption: string | null; is_featured: boolean },
  ) => {
    setPendingIds((current) => [...current, mediaId]);
    setError("");

    try {
      const updated = await updateGalleryImageMetadata(propertyId, mediaId, payload);
      setItems((current) => current.map((item) => (item.id === mediaId ? { ...item, ...updated } : item)));
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setPendingIds((current) => current.filter((id) => id !== mediaId));
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#e1d9cc] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {GALLERY_CATEGORY_OPTIONS.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setSelectedCategory(category.slug)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              selectedCategory === category.slug ? "bg-[#2f5a3d] text-white" : "bg-[#f2ede3] text-[#385442]"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-[#cabfae] bg-[#fcfaf6] p-4">
        <p className="text-sm font-medium text-[#284532]">Upload to selected category</p>
        <p className="text-xs text-[#5f6f63]">Supports JPEG, PNG, WebP. Files are optimized and stored as WebP.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isUploading}
          onChange={(event) => {
            onUpload(event.target.files);
            event.currentTarget.value = "";
          }}
          className="mt-3 w-full rounded-lg border border-[#d8cfbf] bg-white px-3 py-2 text-sm"
        />
      </div>

      {uploadStatus ? <p className="inline-flex items-center gap-2 text-xs text-emerald-700">{isUploading ? <LoadingSpinner className="h-3 w-3" /> : null}{uploadStatus}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      {visibleItems.length === 0 ? (
        <p className="rounded-xl border border-[#e1d9cc] bg-[#fcfaf6] p-6 text-center text-sm text-[#6b7d70]">
          No images in this category yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item, index) => (
            <GalleryCard
              key={item.id}
              media={item}
              busy={pendingIds.includes(item.id)}
              onDelete={() => onDelete(item)}
              onMoveUp={() => onReorder(index, "up")}
              onMoveDown={() => onReorder(index, "down")}
              onSave={onSaveMetadata}
              disableMoveUp={index === 0}
              disableMoveDown={index === visibleItems.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GalleryCard({
  media,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  onSave,
}: {
  media: PropertyGalleryMedia;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  onSave: (mediaId: string, payload: { title: string | null; alt_text: string | null; caption: string | null; is_featured: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState(media.title ?? "");
  const [altText, setAltText] = useState(media.alt_text ?? "");
  const [caption, setCaption] = useState(media.caption ?? "");
  const [featured, setFeatured] = useState(media.is_featured);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#dfd6c9] bg-[#fcfaf7]">
      <div className="relative h-40 w-full">
        <Image src={`${media.public_url}?v=${media.updated_at}`} alt={media.alt_text ?? "Gallery image"} fill className="object-cover" unoptimized />
      </div>
      <div className="space-y-2 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onMoveUp} disabled={disableMoveUp || busy} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40">
            Move up
          </button>
          <button type="button" onClick={onMoveDown} disabled={disableMoveDown || busy} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40">
            Move down
          </button>
        </div>

        <label className="text-xs">Title<input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></label>
        <label className="text-xs">Alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} className={inputClass} /></label>
        <label className="text-xs">Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={2} className={inputClass} /></label>

        <label className="flex items-center gap-2 text-xs text-[#395643]">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> Featured
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            aria-busy={busy}
            onClick={() => onSave(media.id, { title: title || null, alt_text: altText || null, caption: caption || null, is_featured: featured })}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2f5a3d] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {busy ? <><LoadingSpinner className="h-3 w-3" />Saving...</> : "Save"}
          </button>
          <button
            type="button"
            disabled={busy}
            aria-busy={busy}
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e4b6b6] bg-[#fff1f1] px-3 py-1.5 text-xs font-medium text-[#8e3a3a] disabled:opacity-40"
          >
            {busy ? <><LoadingSpinner className="h-3 w-3" />Deleting...</> : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
