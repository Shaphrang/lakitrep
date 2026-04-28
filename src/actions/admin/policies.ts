"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "@/lib/auth/admin";
import { policySchema } from "@/features/admin/policies/schema";
import { createPolicy, deletePolicy, updatePolicy } from "@/features/admin/policies/services/policies-service";
import { getBoolean, getNumber, getString } from "./_shared";

function parsePolicyForm(formData: FormData) {
  return policySchema.parse({
    property_id: getString(formData, "property_id"),
    policy_key: getString(formData, "policy_key"),
    title: getString(formData, "title"),
    content: getString(formData, "content"),
    sort_order: getNumber(formData, "sort_order"),
    is_active: getBoolean(formData, "is_active"),
  });
}

export async function createPoliciesAction(formData: FormData) {
  await requireAdminPermission("policies.manage");
  const row = await createPolicy(parsePolicyForm(formData));
  revalidatePath("/admin/policies");
  redirect(`/admin/policies/${row.id}`);
}

export async function updatePoliciesAction(formData: FormData) {
  await requireAdminPermission("policies.manage");
  const id = getString(formData, "id");
  await updatePolicy(id, parsePolicyForm(formData));
  revalidatePath("/admin/policies");
  redirect(`/admin/policies/${id}?saved=1`);
}

export async function deletePoliciesAction(formData: FormData) {
  await requireAdminPermission("policies.manage");
  const id = getString(formData, "id");
  await deletePolicy(id);
  revalidatePath("/admin/policies");
  redirect("/admin/policies");
}
