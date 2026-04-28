"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth/admin";
import { propertySchema } from "@/features/admin/properties/schema";
import { createProperty, deleteProperty, updateProperty } from "@/features/admin/properties/services/properties-service";
import { getBoolean, getString, parseTextList } from "./_shared";

function parsePropertyForm(formData: FormData) {
  return propertySchema.parse({
    name: getString(formData, "name"),
    slug: getString(formData, "slug"),
    tagline: getString(formData, "tagline"),
    short_intro: getString(formData, "short_intro"),
    full_description: getString(formData, "full_description"),
    property_type: getString(formData, "property_type"),
    address_line: getString(formData, "address_line"),
    district: getString(formData, "district"),
    state: getString(formData, "state"),
    country: getString(formData, "country"),
    phone_number: getString(formData, "phone_number"),
    email: getString(formData, "email"),
    cover_image: getString(formData, "cover_image"),
    gallery_images: parseTextList(getString(formData, "gallery_images")),
    is_active: getBoolean(formData, "is_active"),
  });
}

export async function createPropertiesAction(formData: FormData) {
  await requireAdminPermission("properties.manage");
  const input = parsePropertyForm(formData);
  const row = await createProperty(input);
  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${row.id}`);
}

export async function updatePropertiesAction(formData: FormData) {
  await requireAdminPermission("properties.manage");
  const id = getString(formData, "id");
  const input = parsePropertyForm(formData);
  await updateProperty(id, input);
  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}`);
  redirect(`/admin/properties/${id}?saved=1`);
}

export async function deletePropertiesAction(formData: FormData) {
  await requireAdminPermission("properties.manage");
  const id = getString(formData, "id");
  await deleteProperty(id);
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}
