/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { COTTAGE_STATUSES, STORAGE_BUCKET } from "@/lib/admin/constants";
import { buildStoragePath, extractStoragePath, resolveImageUrl } from "@/lib/admin/storage";
import { cottagePriceSchema, cottageSchema } from "@/lib/admin/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = cottageSchema.extend(cottagePriceSchema.shape);
type FormValues = z.infer<typeof formSchema>;

type CottageFormProps = {
  mode: "create" | "edit";
  propertyId: string;
  cottage?: any;
  amenities: any[];
  selectedAmenities: string[];
};

export function CottageForm({
  mode,
  propertyId,
  cottage,
  amenities,
  selectedAmenities,
}: CottageFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(cottage?.cover_image ?? null);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(cottage?.gallery_images) ? cottage.gallery_images : [],
  );
  const [pathsToDelete, setPathsToDelete] = useState<string[]>([]);

  const defaults = useMemo<FormValues>(
    () => ({
      propertyId,
      code: cottage?.code ?? "",
      name: cottage?.name ?? "",
      slug: cottage?.slug ?? "",
      category: cottage?.category ?? "",
      shortDescription: cottage?.short_description ?? "",
      fullDescription: cottage?.full_description ?? "",
      bedType: cottage?.bed_type ?? "",
      componentCodes: Array.isArray(cottage?.component_codes) ? cottage.component_codes.join(",") : "",
      maxAdults: cottage?.max_adults ?? 2,
      maxChildren: cottage?.max_children ?? 0,
      maxInfants: cottage?.max_infants ?? 0,
      maxTotalGuests: cottage?.max_total_guests ?? 2,
      roomCount: cottage?.room_count ?? 1,
      sortOrder: cottage?.sort_order ?? 0,
      hasAc: cottage?.has_ac ?? false,
      breakfastIncluded: cottage?.breakfast_included ?? true,
      extraBedAllowed: cottage?.extra_bed_allowed ?? false,
      isCombinedUnit: cottage?.is_combined_unit ?? false,
      isFeatured: cottage?.is_featured ?? false,
      isBookable: cottage?.is_bookable ?? true,
      status: cottage?.status ?? "active",
      weekdayRate: Number(cottage?.cottage_prices?.[0]?.weekday_rate ?? 0),
      weekendRate: Number(cottage?.cottage_prices?.[0]?.weekend_rate ?? 0),
      childRate: Number(cottage?.cottage_prices?.[0]?.child_rate ?? 0),
      extraBedRate: Number(cottage?.cottage_prices?.[0]?.extra_bed_rate ?? 0),
      notes: cottage?.cottage_prices?.[0]?.notes ?? "",
    }),
    [cottage, propertyId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  });

  function formatSupabaseErrorMessage(message: string) {
    if (message.toLowerCase().includes("cottages_code_key")) return "Code already exists. Please use a unique code.";
    if (message.toLowerCase().includes("cottages_slug_key")) return "Slug already exists. Please use a unique slug.";
    return message;
  }

  async function uploadToStorage(file: File, folder: "cover" | "gallery") {
    if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file.");
    const slug = (form.getValues("slug") || cottage?.slug || "new-cottage").trim() || "new-cottage";
    const path = buildStoragePath(`cottages/${slug}/${folder}`, file);
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) throw error;
    return path;
  }

  async function onCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const path = await uploadToStorage(file, "cover");
      const previousPath = extractStoragePath(coverImage);
      setCoverImage(path);
      if (previousPath) {
        setPathsToDelete((prev) => (prev.includes(previousPath) ? prev : [...prev, previousPath]));
      }
      toast.success("Cover image uploaded.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to upload cover image.");
    }
    setUploadingCover(false);
    event.target.value = "";
  }

  async function onGalleryUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadingGallery(true);
    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const path = await uploadToStorage(file, "gallery");
        uploaded.push(path);
      } catch (error: any) {
        toast.error(error.message ?? `Failed to upload ${file.name}`);
      }
    }

    if (uploaded.length > 0) {
      setGalleryImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} gallery image(s) uploaded.`);
    }

    setUploadingGallery(false);
    event.target.value = "";
  }

  async function removeCoverImage() {
    if (!coverImage) return;
    const objectPath = extractStoragePath(coverImage);
    if (objectPath) {
      setPathsToDelete((prev) => (prev.includes(objectPath) ? prev : [...prev, objectPath]));
    }
    setCoverImage(null);
  }

  async function removeGalleryImage(path: string) {
    const objectPath = extractStoragePath(path);
    if (objectPath) {
      setPathsToDelete((prev) => (prev.includes(objectPath) ? prev : [...prev, objectPath]));
    }
    setGalleryImages((prev) => prev.filter((item) => item !== path));
  }

  function moveGalleryImage(index: number, direction: "up" | "down") {
    setGalleryImages((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form values");
      setSaving(false);
      return;
    }

    const payload = parsed.data;
    const cottageData = {
      property_id: payload.propertyId,
      code: payload.code,
      name: payload.name,
      slug: payload.slug,
      category: payload.category,
      short_description: payload.shortDescription || null,
      full_description: payload.fullDescription || null,
      bed_type: payload.bedType || null,
      component_codes: payload.componentCodes
        ? payload.componentCodes.split(",").map((code) => code.trim()).filter(Boolean)
        : [],
      max_adults: payload.maxAdults,
      max_children: payload.maxChildren,
      max_infants: payload.maxInfants,
      max_total_guests: payload.maxTotalGuests,
      room_count: payload.roomCount,
      sort_order: payload.sortOrder,
      has_ac: payload.hasAc,
      breakfast_included: payload.breakfastIncluded,
      extra_bed_allowed: payload.extraBedAllowed,
      is_combined_unit: payload.isCombinedUnit,
      is_featured: payload.isFeatured,
      is_bookable: payload.isBookable,
      status: payload.status,
      cover_image: coverImage,
      gallery_images: galleryImages,
    };

    const { data: savedCottage, error } = mode === "create"
      ? await supabase.from("cottages").insert(cottageData).select("id").single()
      : await supabase.from("cottages").update(cottageData).eq("id", cottage.id).select("id").single();

    if (error || !savedCottage) {
      toast.error(formatSupabaseErrorMessage(error?.message ?? "Failed to save cottage."));
      setSaving(false);
      return;
    }

    const targetId = savedCottage.id;

    const { error: priceError } = await supabase
      .from("cottage_prices")
      .upsert(
        {
          cottage_id: targetId,
          weekday_rate: payload.weekdayRate,
          weekend_rate: payload.weekendRate,
          child_rate: payload.childRate,
          extra_bed_rate: payload.extraBedRate,
          notes: payload.notes || null,
        },
        { onConflict: "cottage_id" },
      );

    if (priceError) {
      toast.error(priceError.message);
      setSaving(false);
      return;
    }

    const checkedAmenities = Object.entries(form.getValues())
      .filter(([key, v]) => key.startsWith("amenity_") && Boolean(v))
      .map(([key]) => key.replace("amenity_", ""));

    const { error: clearAmenityError } = await supabase.from("cottage_amenities").delete().eq("cottage_id", targetId);
    if (clearAmenityError) {
      toast.error(clearAmenityError.message);
      setSaving(false);
      return;
    }

    if (checkedAmenities.length > 0) {
      const { error: amenityError } = await supabase.from("cottage_amenities").insert(
        checkedAmenities.map((id) => ({ cottage_id: targetId, amenity_id: id })),
      );
      if (amenityError) {
        toast.error(amenityError.message);
        setSaving(false);
        return;
      }
    }

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove(pathsToDelete);
      if (storageError) {
        toast.error(`Cottage saved, but some old image files could not be deleted: ${storageError.message}`);
      } else {
        setPathsToDelete([]);
      }
    }

    toast.success(mode === "create" ? "Cottage created." : "Cottage updated.");
    setSaving(false);
    router.push(`/admin/cottages/${targetId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create Cottage" : "Edit Cottage"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["code", "Code"],
                ["name", "Name"],
                ["slug", "Slug"],
                ["category", "Category"],
                ["bedType", "Bed type"],
              ].map(([name, label]) => (
                <label key={name} className="space-y-1 text-sm">
                  <span>{label}</span>
                  <input className="h-10 w-full rounded-md border px-3" {...form.register(name as any)} />
                </label>
              ))}
            </div>

            <label className="space-y-1 text-sm">
              <span>Component codes (comma separated)</span>
              <input className="h-10 w-full rounded-md border px-3" {...form.register("componentCodes")} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Short description</span>
                <textarea className="w-full rounded-md border p-3" rows={2} {...form.register("shortDescription")} />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span>Full description</span>
                <textarea className="w-full rounded-md border p-3" rows={4} {...form.register("fullDescription")} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["maxAdults", "Max adults"],
                ["maxChildren", "Max children"],
                ["maxInfants", "Max infants"],
                ["maxTotalGuests", "Max total guests"],
                ["roomCount", "Room count"],
                ["sortOrder", "Sort order"],
              ].map(([n, label]) => (
                <label key={n} className="space-y-1 text-sm">
                  <span>{label}</span>
                  <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register(n as any, { valueAsNumber: true })} />
                </label>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Status</span>
                <select className="h-10 w-full rounded-md border px-3" {...form.register("status")}>
                  {COTTAGE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span>Weekday rate</span>
                <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register("weekdayRate", { valueAsNumber: true })} />
              </label>
              <label className="space-y-1 text-sm">
                <span>Weekend rate</span>
                <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register("weekendRate", { valueAsNumber: true })} />
              </label>
              <label className="space-y-1 text-sm">
                <span>Child rate</span>
                <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register("childRate", { valueAsNumber: true })} />
              </label>
              <label className="space-y-1 text-sm">
                <span>Extra bed rate</span>
                <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register("extraBedRate", { valueAsNumber: true })} />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span>Price notes</span>
              <textarea className="w-full rounded-md border p-3" rows={3} {...form.register("notes")} />
            </label>

            <Card>
              <CardHeader><CardTitle className="text-base">Cottage Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cover image</p>
                  <input type="file" accept="image/*" onChange={onCoverUpload} disabled={uploadingCover} className="w-full text-sm" />
                  {coverImage ? (
                    <div className="w-full max-w-sm space-y-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolveImageUrl(coverImage)} alt="Cottage cover" className="h-40 w-full rounded object-cover" />
                      <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={removeCoverImage}>Remove cover</Button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Gallery images</p>
                  <input type="file" accept="image/*" multiple onChange={onGalleryUpload} disabled={uploadingGallery} className="w-full text-sm" />
                  <p className="text-xs text-zinc-500">Stored in {STORAGE_BUCKET} as cottages/&#123;slug&#125;/cover and cottages/&#123;slug&#125;/gallery paths.</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((imagePath, index) => (
                      <div key={imagePath} className="space-y-2 rounded border p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveImageUrl(imagePath)} alt="Cottage gallery" className="h-32 w-full rounded object-cover" />
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" className="h-8 px-2 text-xs" onClick={() => moveGalleryImage(index, "up")}>Up</Button>
                          <Button type="button" variant="secondary" className="h-8 px-2 text-xs" onClick={() => moveGalleryImage(index, "down")}>Down</Button>
                          <Button type="button" variant="destructive" className="h-8 px-2 text-xs" onClick={() => removeGalleryImage(imagePath)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {[
                ["hasAc", "AC"],
                ["breakfastIncluded", "Breakfast Included"],
                ["extraBedAllowed", "Extra Bed Allowed"],
                ["isCombinedUnit", "Combined Unit"],
                ["isFeatured", "Featured"],
                ["isBookable", "Bookable"],
              ].map(([n, label]) => (
                <label key={n} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <input type="checkbox" {...form.register(n as any)} /> {label}
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Amenities</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {amenities.map((amenity) => (
                  <label key={amenity.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      defaultChecked={selectedAmenities.includes(amenity.id)}
                      {...form.register(`amenity_${amenity.id}` as any)}
                    />
                    {amenity.name}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Cottage"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
