/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/admin/constants";
import { extractStoragePath, resolveImageUrl, toSafeFilename } from "@/lib/admin/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AttractionsManagerProps = {
  propertyId: string;
  attractions: any[];
};

function toSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "attraction";
}

export function AttractionsManager({ propertyId, attractions }: AttractionsManagerProps) {
  const supabase = createClient();
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);

  async function uploadFile(file: File, entityKey: string, folder: "cover" | "gallery") {
    const path = `attractions/${entityKey}/${folder}/${file.lastModified}-${toSafeFilename(file.name)}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) throw error;
    return path;
  }

  async function saveAttraction(formData: FormData) {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }

    const description = String(formData.get("description") ?? "").trim() || null;
    const distanceText = String(formData.get("distanceText") ?? "").trim() || null;
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isActive = formData.get("isActive") === "on";

    const existingCover = String(formData.get("existingCoverImage") ?? "") || null;
    const existingGallery = String(formData.get("existingGalleryImages") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    const coverFile = formData.get("coverImage") as File | null;
    const galleryFiles = formData.getAll("galleryImages").filter((item) => item instanceof File && item.size > 0) as File[];

    setSavingId(id || "new");
    try {
      const entityKey = id || toSlug(name);
      let coverImage = existingCover;
      const galleryImages = [...existingGallery];

      if (coverFile && coverFile.size > 0) {
        const uploadedCover = await uploadFile(coverFile, entityKey, "cover");
        const oldCover = extractStoragePath(existingCover);
        coverImage = uploadedCover;
        if (oldCover) await supabase.storage.from(STORAGE_BUCKET).remove([oldCover]);
      }

      for (const file of galleryFiles) {
        const uploadedPath = await uploadFile(file, entityKey, "gallery");
        galleryImages.push(uploadedPath);
      }

      const payload = {
        property_id: propertyId,
        name,
        description,
        distance_text: distanceText,
        sort_order: Number.isNaN(sortOrder) ? 0 : sortOrder,
        is_active: isActive,
        cover_image: coverImage,
        gallery_images: galleryImages,
      };

      if (id) {
        const { error } = await supabase.from("attractions").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attractions").insert(payload);
        if (error) throw error;
      }

      toast.success(id ? "Attraction updated." : "Attraction created.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save attraction.");
    }
    setSavingId(null);
  }

  async function removeGalleryImage(attraction: any, imagePath: string) {
    const updated = (attraction.gallery_images ?? []).filter((path: string) => path !== imagePath);
    const { error } = await supabase.from("attractions").update({ gallery_images: updated }).eq("id", attraction.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    const objectPath = extractStoragePath(imagePath);
    if (objectPath) await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);

    toast.success("Gallery image removed.");
    router.refresh();
  }

  async function removeCoverImage(attraction: any) {
    const { error } = await supabase.from("attractions").update({ cover_image: null }).eq("id", attraction.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    const objectPath = extractStoragePath(attraction.cover_image);
    if (objectPath) await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);

    toast.success("Cover image removed.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add attraction</CardTitle></CardHeader>
        <CardContent>
          <form action={saveAttraction} className="grid gap-2 md:grid-cols-3">
            <input name="name" placeholder="Name" className="h-10 rounded-md border px-3" />
            <input name="distanceText" placeholder="Distance" className="h-10 rounded-md border px-3" />
            <input name="sortOrder" type="number" defaultValue={0} className="h-10 rounded-md border px-3" />
            <textarea name="description" placeholder="Description" className="rounded-md border p-2 md:col-span-3" rows={3} />
            <label className="space-y-1 text-sm md:col-span-2">
              <span>Cover image</span>
              <input name="coverImage" type="file" accept="image/*" />
            </label>
            <label className="space-y-1 text-sm md:col-span-3">
              <span>Gallery images</span>
              <input name="galleryImages" type="file" accept="image/*" multiple />
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked /> Active</label>
            <Button type="submit" variant="secondary" disabled={savingId === "new"}>{savingId === "new" ? "Saving..." : "Save"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {attractions.map((item) => (
          <Card key={item.id}><CardContent className="pt-6">
            <form action={saveAttraction} className="grid gap-2 md:grid-cols-3">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="existingCoverImage" defaultValue={item.cover_image ?? ""} />
              <textarea name="existingGalleryImages" defaultValue={(item.gallery_images ?? []).join("\n")} className="hidden" readOnly />
              <input name="name" defaultValue={item.name} className="h-10 rounded-md border px-3" />
              <input name="distanceText" defaultValue={item.distance_text ?? ""} className="h-10 rounded-md border px-3" />
              <input name="sortOrder" type="number" defaultValue={item.sort_order} className="h-10 rounded-md border px-3" />
              <textarea name="description" defaultValue={item.description ?? ""} className="rounded-md border p-2 md:col-span-3" rows={3} />

              <div className="space-y-2 md:col-span-3">
                <p className="text-sm font-medium">Cover image</p>
                <input name="coverImage" type="file" accept="image/*" />
                {item.cover_image ? (
                  <div className="w-full max-w-sm space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolveImageUrl(item.cover_image)} alt={item.name} className="h-36 w-full rounded object-cover" />
                    <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={() => removeCoverImage(item)}>Remove cover</Button>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-3">
                <p className="text-sm font-medium">Gallery images</p>
                <input name="galleryImages" type="file" accept="image/*" multiple />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(item.gallery_images ?? []).map((imagePath: string) => (
                    <div key={imagePath} className="space-y-2 rounded border p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveImageUrl(imagePath)} alt={item.name} className="h-28 w-full rounded object-cover" />
                      <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={() => removeGalleryImage(item, imagePath)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={item.is_active} /> Active</label>
              <Button type="submit" variant="secondary" disabled={savingId === item.id}>{savingId === item.id ? "Saving..." : "Update"}</Button>
            </form>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
