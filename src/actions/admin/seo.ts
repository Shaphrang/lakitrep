"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth/admin";
import { seoSchema } from "@/features/admin/seo/schema";
import { createSeoEntry, deleteSeoEntry, updateSeoEntry } from "@/features/admin/seo/services/seo-service";
import { getBoolean, getString, parseCommaList } from "./_shared";

function parseSeoForm(formData: FormData) {
  return seoSchema.parse({
    property_id: getString(formData, "property_id"),
    page_key: getString(formData, "page_key"),
    meta_title: getString(formData, "meta_title"),
    meta_description: getString(formData, "meta_description"),
    meta_keywords: parseCommaList(getString(formData, "meta_keywords")),
    canonical_url: getString(formData, "canonical_url"),
    og_image: getString(formData, "og_image"),
    is_active: getBoolean(formData, "is_active"),
  });
}

export async function createSeoAction(formData: FormData) {
  await requireAdminPermission("seo.manage");
  const row = await createSeoEntry(parseSeoForm(formData));
  revalidatePath("/admin/seo");
  redirect(`/admin/seo/${row.id}`);
}

export async function updateSeoAction(formData: FormData) {
  await requireAdminPermission("seo.manage");
  const id = getString(formData, "id");
  await updateSeoEntry(id, parseSeoForm(formData));
  revalidatePath("/admin/seo");
  redirect(`/admin/seo/${id}?saved=1`);
}

export async function deleteSeoAction(formData: FormData) {
  await requireAdminPermission("seo.manage");
  const id = getString(formData, "id");
  await deleteSeoEntry(id);
  revalidatePath("/admin/seo");
  redirect("/admin/seo");
}
