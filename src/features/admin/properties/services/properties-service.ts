import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Property, } from "../types";
import type { PropertyInput } from "../schema";

export async function getAllProperties(): Promise<Property[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("id,name,slug,tagline,short_intro,district,state,cover_image,gallery_images,is_active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }

  return data ?? [];
}

export async function getPropertyById(id: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Failed to fetch property: ${error.message}`);
  return data;
}

export async function createProperty(input: PropertyInput) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("properties").insert(input).select("id").single();
  if (error) throw new Error(`Failed to create property: ${error.message}`);
  return data;
}

export async function updateProperty(id: string, input: PropertyInput) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("properties").update(input).eq("id", id);
  if (error) throw new Error(`Failed to update property: ${error.message}`);
}

export async function deleteProperty(id: string) {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete property: ${error.message}`);
}

export async function getPropertyOptions() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.from("properties").select("id,name").order("name");
  if (error) throw new Error(`Failed to fetch property options: ${error.message}`);
  return data ?? [];
}
