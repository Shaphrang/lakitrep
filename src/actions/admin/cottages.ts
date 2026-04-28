"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth/admin";
import { cottageSchema } from "@/features/admin/cottages/schema";
import { createCottage, deleteCottage, updateCottage } from "@/features/admin/cottages/services/cottages-service";
import { getBoolean, getNumber, getString, parseCommaList, parseTextList } from "./_shared";

function parseCottageForm(formData: FormData) {
  return cottageSchema.parse({
    property_id: getString(formData, "property_id"),
    code: getString(formData, "code"),
    name: getString(formData, "name"),
    slug: getString(formData, "slug"),
    category: getString(formData, "category"),
    short_description: getString(formData, "short_description"),
    full_description: getString(formData, "full_description"),
    bed_type: getString(formData, "bed_type"),
    max_adults: getNumber(formData, "max_adults", 1),
    max_children: getNumber(formData, "max_children", 0),
    max_infants: getNumber(formData, "max_infants", 0),
    max_total_guests: getNumber(formData, "max_total_guests", 1),
    room_count: getNumber(formData, "room_count", 1),
    has_ac: getBoolean(formData, "has_ac"),
    breakfast_included: getBoolean(formData, "breakfast_included"),
    extra_bed_allowed: getBoolean(formData, "extra_bed_allowed"),
    is_combined_unit: getBoolean(formData, "is_combined_unit"),
    component_codes: parseCommaList(getString(formData, "component_codes")),
    amenities: parseTextList(getString(formData, "amenities")),
    weekday_price: getNumber(formData, "weekday_price"),
    weekend_price: getNumber(formData, "weekend_price"),
    child_price: getNumber(formData, "child_price"),
    extra_bed_price: getNumber(formData, "extra_bed_price"),
    pricing_note: getString(formData, "pricing_note"),
    cover_image: getString(formData, "cover_image"),
    gallery_images: parseTextList(getString(formData, "gallery_images")),
    sort_order: getNumber(formData, "sort_order"),
    is_featured: getBoolean(formData, "is_featured"),
    is_bookable: getBoolean(formData, "is_bookable"),
    status: getString(formData, "status"),
  });
}

export async function createCottagesAction(formData: FormData) {
  await requireAdminPermission("cottages.manage");
  const input = parseCottageForm(formData);
  const row = await createCottage(input);
  revalidatePath("/admin/cottages");
  redirect(`/admin/cottages/${row.id}`);
}

export async function updateCottagesAction(formData: FormData) {
  await requireAdminPermission("cottages.manage");
  const id = getString(formData, "id");
  const input = parseCottageForm(formData);
  await updateCottage(id, input);
  revalidatePath("/admin/cottages");
  revalidatePath(`/admin/cottages/${id}`);
  redirect(`/admin/cottages/${id}?saved=1`);
}

export async function deleteCottagesAction(formData: FormData) {
  await requireAdminPermission("cottages.manage");
  const id = getString(formData, "id");
  await deleteCottage(id);
  revalidatePath("/admin/cottages");
  redirect("/admin/cottages");
}
