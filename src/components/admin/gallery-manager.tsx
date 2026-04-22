/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/admin/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function GalleryManager({ propertyId, images }: { propertyId: string; images: any[] }) {
  const supabase = createClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function upload(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return;
    setBusy(true);
    const path = `gallery/${file.lastModified}-${file.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const { error } = await supabase.from("gallery_images").insert({
      property_id: propertyId,
      title: String(formData.get("title") || "") || null,
      category: String(formData.get("category") || "") || null,
      alt_text: String(formData.get("altText") || "") || null,
      storage_path: data.publicUrl,
      is_featured: formData.get("isFeatured") === "on",
      is_active: formData.get("isActive") !== "off",
      sort_order: Number(formData.get("sortOrder") || 0),
    });
    if (error) toast.error(error.message);
    else toast.success("Image uploaded.");
    setBusy(false);
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
            <img src={image.storage_path} alt={image.alt_text || "Gallery image"} className="h-40 w-full rounded object-cover" />
            <p className="text-sm font-medium">{image.title || "Untitled"}</p>
            <p className="text-xs text-zinc-500">{image.category || "uncategorized"} · sort {image.sort_order}</p>
            <div className="flex gap-2">
              <Button className="h-8 px-2 text-xs" variant="secondary" onClick={async () => {
                await supabase.from("gallery_images").update({ is_featured: !image.is_featured }).eq("id", image.id);
                router.refresh();
              }}>{image.is_featured ? "Unfeature" : "Feature"}</Button>
              <Button className="h-8 px-2 text-xs" variant="destructive" onClick={async () => {
                await supabase.from("gallery_images").delete().eq("id", image.id);
                router.refresh();
              }}>Delete</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
