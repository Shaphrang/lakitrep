/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/admin/constants";
import { cottagePriceSchema, cottageSchema } from "@/lib/admin/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// keep local combined type
import { z } from "zod";

const formSchema = cottageSchema.extend(cottagePriceSchema.shape);
type FormValues = z.infer<typeof formSchema>;

type CottageFormProps = {
  mode: "create" | "edit";
  propertyId: string;
  cottage?: any;
  amenities: any[];
  selectedAmenities: string[];
  images: any[];
};

export function CottageForm({
  mode,
  propertyId,
  cottage,
  amenities,
  selectedAmenities,
  images,
}: CottageFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      weekdayRate: cottage?.cottage_prices?.[0]?.weekday_rate ?? 0,
      weekendRate: cottage?.cottage_prices?.[0]?.weekend_rate ?? 0,
      childRate: cottage?.cottage_prices?.[0]?.child_rate ?? 0,
      extraBedRate: cottage?.cottage_prices?.[0]?.extra_bed_rate ?? 0,
      notes: cottage?.cottage_prices?.[0]?.notes ?? "",
    }),
    [cottage, propertyId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults,
  });

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
    };

    const { data: savedCottage, error } = mode === "create"
      ? await supabase.from("cottages").insert(cottageData).select("id").single()
      : await supabase.from("cottages").update(cottageData).eq("id", cottage.id).select("id").single();

    if (error || !savedCottage) {
      toast.error(error?.message ?? "Failed to save cottage.");
      setSaving(false);
      return;
    }

    const targetId = savedCottage.id;

    const { error: priceError } = await supabase.from("cottage_prices").upsert({
      cottage_id: targetId,
      weekday_rate: payload.weekdayRate,
      weekend_rate: payload.weekendRate,
      child_rate: payload.childRate,
      extra_bed_rate: payload.extraBedRate,
      notes: payload.notes || null,
    });

    if (priceError) {
      toast.error(priceError.message);
      setSaving(false);
      return;
    }

    const checkedAmenities = Object.entries(form.getValues())
      .filter(([key, v]) => key.startsWith("amenity_") && Boolean(v))
      .map(([key]) => key.replace("amenity_", ""));

    await supabase.from("cottage_amenities").delete().eq("cottage_id", targetId);

    if (checkedAmenities.length > 0) {
      const { error: amenityError } = await supabase.from("cottage_amenities").insert(
        checkedAmenities.map((id) => ({ cottage_id: targetId, amenity_id: id })),
      );
      if (amenityError) {
        toast.error(amenityError.message);
      }
    }

    toast.success(mode === "create" ? "Cottage created." : "Cottage updated.");
    setSaving(false);
    router.push(`/admin/cottages/${targetId}`);
    router.refresh();
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !cottage?.id) return;

    setUploading(true);
    const path = `cottages/${cottage.slug}/${file.lastModified}-${file.name.replace(/\s+/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    const { error: dbError } = await supabase.from("cottage_images").insert({
      cottage_id: cottage.id,
      storage_path: publicData.publicUrl,
      sort_order: images.length,
    });

    if (dbError) toast.error(dbError.message);
    else toast.success("Image uploaded.");

    setUploading(false);
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

            <div className="grid gap-4 md:grid-cols-3">
              {["maxAdults", "maxChildren", "maxInfants", "maxTotalGuests", "roomCount", "sortOrder"].map((n) => (
                <label key={n} className="space-y-1 text-sm">
                  <span>{n}</span>
                  <input type="number" className="h-10 w-full rounded-md border px-3" {...form.register(n as any, { valueAsNumber: true })} />
                </label>
              ))}
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
            </div>

            <label className="space-y-1 text-sm">
              <span>Price notes</span>
              <textarea className="w-full rounded-md border p-3" rows={3} {...form.register("notes")} />
            </label>

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

      {mode === "edit" ? (
        <Card>
          <CardHeader>
            <CardTitle>Cottage Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading} />
            <p className="text-xs text-zinc-500">Bucket: {STORAGE_BUCKET}. If upload fails, set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="rounded border p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.storage_path} alt={image.alt_text || "Cottage image"} className="h-32 w-full rounded object-cover" />
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="secondary"
                      className="h-8 px-2 text-xs"
                      onClick={async () => {
                        await supabase.from("cottage_images").update({ is_cover: false }).eq("cottage_id", cottage.id);
                        const { error } = await supabase.from("cottage_images").update({ is_cover: true }).eq("id", image.id);
                        if (error) toast.error(error.message);
                        else toast.success("Cover image updated.");
                        router.refresh();
                      }}
                    >
                      {image.is_cover ? "Cover" : "Set cover"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="h-8 px-2 text-xs"
                      onClick={async () => {
                        const { error } = await supabase.from("cottage_images").delete().eq("id", image.id);
                        if (error) toast.error(error.message);
                        else toast.success("Image deleted.");
                        router.refresh();
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
