import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CottageInput } from "../schema";
import type { Cottage } from "../types";

export async function getAllCottages(): Promise<(Cottage & { property_name?: string })[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("cottages")
    .select("id,property_id,code,name,slug,category,max_total_guests,weekday_price,weekend_price,cover_image,gallery_images,status,is_bookable,properties(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to fetch cottages: ${error.message}`);
  return (data ?? []).map((row) => ({ ...row, property_name: (row.properties as { name?: string } | null)?.name }));
}

export async function getCottageById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("cottages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch cottage: ${error.message}`);
  return data;
}

export async function createCottage(input: CottageInput) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("cottages").insert({ ...input, amenities: input.amenities }).select("id").single();
  if (error) throw new Error(`Failed to create cottage: ${error.message}`);
  return data;
}

export async function updateCottage(id: string, input: CottageInput) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("cottages").update({ ...input, amenities: input.amenities }).eq("id", id);
  if (error) throw new Error(`Failed to update cottage: ${error.message}`);
}

export async function deleteCottage(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("cottages").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete cottage: ${error.message}`);
}
