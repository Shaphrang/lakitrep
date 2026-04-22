import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SeoInput } from "../schema";

export async function getAllSeoEntries() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("seo")
    .select("id,property_id,page_key,meta_title,meta_description,meta_keywords,canonical_url,og_image,is_active,properties(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch SEO rows: ${error.message}`);
  return (data ?? []).map((row) => ({ ...row, property_name: (row.properties as { name?: string } | null)?.name }));
}

export async function getSeoById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("seo").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch SEO: ${error.message}`);
  return data;
}

export async function createSeoEntry(input: SeoInput) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("seo").insert(input).select("id").single();
  if (error) throw new Error(`Failed to create SEO: ${error.message}`);
  return data;
}

export async function updateSeoEntry(id: string, input: SeoInput) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("seo").update(input).eq("id", id);
  if (error) throw new Error(`Failed to update SEO: ${error.message}`);
}

export async function deleteSeoEntry(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("seo").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete SEO: ${error.message}`);
}
