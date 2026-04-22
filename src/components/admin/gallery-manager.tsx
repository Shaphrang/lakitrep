/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/admin/constants";
import { extractStoragePath, resolveImageUrl, toSafeFilename } from "@/lib/admin/storage";
import { gallerySchema } from "@/lib/admin/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function GalleryManager({ propertyId, images }: { propertyId: string; images: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function upload(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      toast.error("Please select an image file.");
      return;
    }

    const parsed = gallerySchema.safeParse({
      propertyId,
      title: formData.get("title"),
      category: formData.get("category"),
      altText: formData.get("altText"),
      sortOrder: formData.get("sortOrder"),
      isFeatured: formData.get("isFeatured") === "on",
      isActive: formData.get("isActive") === "on",
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid gallery input.");
      return;
    }

    setBusy(true);
    const path = `gallery/${file.lastModified}-${toSafeFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      toast.error(uploadError.message);
      setBusy(false);
      return;
    }

    const { error } = await supabase.from("gallery_images").insert({
      property_id: parsed.data.propertyId,
      title: parsed.data.title || null,
      category: parsed.data.category || null,
      alt_text: parsed.data.altText || null,
      storage_path: path,
      is_featured: parsed.data.isFeatured,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    });

    if (error) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      toast.error(error.message);
    } else {
      toast.success("Image uploaded.");
    }
    setBusy(false);
    router.refresh();
  }

  async function deleteImage(image: any) {
    const objectPath = extractStoragePath(image.storage_path);
    const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    if (objectPath) {
      await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);
    }

    toast.success("Image deleted.");
    router.refresh();
  }

  async function updateImage(image: any, updates: Record<string, unknown>) {
    const { error } = await supabase.from("gallery_images").update(updates).eq("id", image.id);
    if (error) toast.error(error.message);
    else toast.success("Image updated.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form action={upload} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input name="title" placeholder="Title" className="h-10 rounded-md border px-3" />
        <input name="category" placeholder="Category" className="h-10 rounded-md border px-3" />
        <input name="altText" placeholder="Alt text" className="h-10 rounded-md border px-3" />
        <input name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-md border px-3" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
        <input name="file" type="file" accept="image/*" className="md:col-span-2" />
        <Button type="submit" disabled={busy}>{busy ? "Uploading..." : "Upload"}</Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <Card key={image.id}><CardContent className="space-y-2 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImageUrl(image.storage_path)} alt={image.alt_text || "Gallery image"} className="h-40 w-full rounded object-cover" />
            <input
              defaultValue={image.title ?? ""}
              className="h-9 w-full rounded-md border px-2 text-sm"
              placeholder="Title"
              onBlur={(event) => updateImage(image, { title: event.target.value || null })}
            />
            <input
              defaultValue={image.alt_text ?? ""}
              className="h-9 w-full rounded-md border px-2 text-sm"
              placeholder="Alt text"
              onBlur={(event) => updateImage(image, { alt_text: event.target.value || null })}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                defaultValue={image.category ?? ""}
                className="h-9 w-full rounded-md border px-2 text-sm"
                placeholder="Category"
                onBlur={(event) => updateImage(image, { category: event.target.value || null })}
              />
              <input
                defaultValue={image.sort_order ?? 0}
                type="number"
                className="h-9 w-full rounded-md border px-2 text-sm"
                placeholder="Sort"
                onBlur={(event) => updateImage(image, { sort_order: Number(event.target.value || 0) })}
              />
            </div>
            <div className="flex gap-2">
              <Button className="h-8 px-2 text-xs" variant="secondary" onClick={() => updateImage(image, { is_featured: !image.is_featured })}>
                {image.is_featured ? "Unfeature" : "Feature"}
              </Button>
              <Button className="h-8 px-2 text-xs" variant="secondary" onClick={() => updateImage(image, { is_active: !image.is_active })}>
                {image.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button className="h-8 px-2 text-xs" variant="destructive" onClick={() => deleteImage(image)}>Delete</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
