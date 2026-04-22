import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AttractionInput } from "../schema";

export async function getAllAttractions() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("attractions")
    .select("id,property_id,name,description,distance_text,cover_image,gallery_images,sort_order,is_active,properties(name)")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to fetch attractions: ${error.message}`);
  return (data ?? []).map((row) => ({ ...row, property_name: (row.properties as { name?: string } | null)?.name }));
}

export async function getAttractionById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("attractions").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch attraction: ${error.message}`);
  return data;
}

export async function createAttraction(input: AttractionInput) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("attractions").insert(input).select("id").single();
  if (error) throw new Error(`Failed to create attraction: ${error.message}`);
  return data;
}

export async function updateAttraction(id: string, input: AttractionInput) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("attractions").update(input).eq("id", id);
  if (error) throw new Error(`Failed to update attraction: ${error.message}`);
}

export async function deleteAttraction(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("attractions").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete attraction: ${error.message}`);
}
