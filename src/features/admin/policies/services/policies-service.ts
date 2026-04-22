import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PolicyInput } from "../schema";

export async function getAllPolicies() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("policies")
    .select("id,property_id,policy_key,title,content,sort_order,is_active,properties(name)")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch policies: ${error.message}`);
  return (data ?? []).map((row) => ({ ...row, property_name: (row.properties as { name?: string } | null)?.name }));
}

export async function getPolicyById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("policies").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch policy: ${error.message}`);
  return data;
}

export async function createPolicy(input: PolicyInput) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("policies").insert(input).select("id").single();
  if (error) throw new Error(`Failed to create policy: ${error.message}`);
  return data;
}

export async function updatePolicy(id: string, input: PolicyInput) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("policies").update(input).eq("id", id);
  if (error) throw new Error(`Failed to update policy: ${error.message}`);
}

export async function deletePolicy(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("policies").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete policy: ${error.message}`);
}
