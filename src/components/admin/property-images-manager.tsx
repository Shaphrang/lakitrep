"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/admin/constants";
import { buildStoragePath, extractStoragePath, resolveImageUrl } from "@/lib/admin/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PropertyImagesManager({
  propertyId,
  initialCoverImage,
  initialGalleryImages,
}: {
  propertyId: string;
  initialCoverImage: string | null;
  initialGalleryImages: string[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage);
  const [galleryImages, setGalleryImages] = useState<string[]>(initialGalleryImages);
  const [busy, setBusy] = useState(false);

  async function saveImages(nextCover: string | null, nextGallery: string[]) {
    const { error } = await supabase
      .from("properties")
      .update({ cover_image: nextCover, gallery_images: nextGallery })
      .eq("id", propertyId);

    if (error) throw error;
  }

  async function uploadCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setBusy(true);
    try {
      const path = buildStoragePath("property/cover", file);
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;

      const oldCover = extractStoragePath(coverImage);
      try {
        await saveImages(path, galleryImages);
      } catch (error) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        throw error;
      }
      if (oldCover) {
        const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove([oldCover]);
        if (removeError) toast.error(`Image saved, but old cover could not be deleted: ${removeError.message}`);
      }

      setCoverImage(path);
      toast.success("Property cover image updated.");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload cover image.";
      toast.error(message);
    }
    setBusy(false);
    event.target.value = "";
  }

  async function removeCover() {
    if (!coverImage) return;

    setBusy(true);
    try {
      await saveImages(null, galleryImages);
      const objectPath = extractStoragePath(coverImage);
      if (objectPath) {
        const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);
        if (removeError) toast.error(`Cover removed from settings, but file delete failed: ${removeError.message}`);
      }
      setCoverImage(null);
      toast.success("Property cover removed.");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove cover image.";
      toast.error(message);
    }
    setBusy(false);
  }

  async function uploadGallery(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped because they are not image files.");
    }
    if (validFiles.length === 0) {
      event.target.value = "";
      return;
    }

    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of validFiles) {
        const path = buildStoragePath("property/gallery", file);
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
          upsert: false,
          contentType: file.type,
        });
        if (!uploadError) {
          uploaded.push(path);
        } else {
          toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
      }
      if (uploaded.length === 0) {
        throw new Error("No gallery images were uploaded.");
      }

      const nextGallery = [...galleryImages, ...uploaded];
      try {
        await saveImages(coverImage, nextGallery);
      } catch (error) {
        await supabase.storage.from(STORAGE_BUCKET).remove(uploaded);
        throw error;
      }
      setGalleryImages(nextGallery);
      toast.success(`${uploaded.length} property gallery image(s) added.`);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to upload property gallery images.";
      toast.error(message);
    }
    setBusy(false);
    event.target.value = "";
  }

  async function removeGalleryImage(path: string) {
    setBusy(true);
    try {
      const nextGallery = galleryImages.filter((item) => item !== path);
      await saveImages(coverImage, nextGallery);
      const objectPath = extractStoragePath(path);
      if (objectPath) {
        const { error: removeError } = await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);
        if (removeError) toast.error(`Image removed from settings, but file delete failed: ${removeError.message}`);
      }
      setGalleryImages(nextGallery);
      toast.success("Gallery image removed.");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove gallery image.";
      toast.error(message);
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Property Images</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Cover image</p>
          <input type="file" accept="image/*" onChange={uploadCover} disabled={busy} className="w-full text-sm" />
          {coverImage ? (
            <div className="w-full max-w-sm space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveImageUrl(coverImage)} alt="Property cover" className="h-44 w-full rounded object-cover" />
              <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={removeCover}>Remove cover</Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Property gallery images</p>
          <input type="file" accept="image/*" multiple onChange={uploadGallery} disabled={busy} className="w-full text-sm" />
          <p className="text-xs text-zinc-500">Bucket: {STORAGE_BUCKET}. Stored as property/cover and property/gallery paths only.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((imagePath) => (
              <div key={imagePath} className="space-y-2 rounded border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImageUrl(imagePath)} alt="Property gallery" className="h-28 w-full rounded object-cover" />
                <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={() => removeGalleryImage(imagePath)}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
