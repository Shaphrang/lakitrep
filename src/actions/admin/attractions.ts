"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth/admin";
import { attractionSchema } from "@/features/admin/attractions/schema";
import { createAttraction, deleteAttraction, updateAttraction } from "@/features/admin/attractions/services/attractions-service";
import { getBoolean, getNumber, getString, parseTextList } from "./_shared";

function parseAttractionForm(formData: FormData) {
  return attractionSchema.parse({
    property_id: getString(formData, "property_id"),
    name: getString(formData, "name"),
    description: getString(formData, "description"),
    distance_text: getString(formData, "distance_text"),
    cover_image: getString(formData, "cover_image"),
    gallery_images: parseTextList(getString(formData, "gallery_images")),
    sort_order: getNumber(formData, "sort_order"),
    is_active: getBoolean(formData, "is_active"),
  });
}

export async function createAttractionsAction(formData: FormData) {
  await requireAdminPermission("attractions.manage");
  const input = parseAttractionForm(formData);
  const row = await createAttraction(input);
  revalidatePath("/admin/attractions");
  redirect(`/admin/attractions/${row.id}`);
}

export async function updateAttractionsAction(formData: FormData) {
  await requireAdminPermission("attractions.manage");
  const id = getString(formData, "id");
  const input = parseAttractionForm(formData);
  await updateAttraction(id, input);
  revalidatePath("/admin/attractions");
  redirect(`/admin/attractions/${id}?saved=1`);
}

export async function deleteAttractionsAction(formData: FormData) {
  await requireAdminPermission("attractions.manage");
  const id = getString(formData, "id");
  await deleteAttraction(id);
  revalidatePath("/admin/attractions");
  redirect("/admin/attractions");
}
