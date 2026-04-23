import { cache } from "react";
import { getSupabasePublicServerClient } from "@/lib/supabase/public-server";

type Property = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  short_intro: string | null;
  full_description: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  email: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  booking_note: string | null;
  maps_note: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cover_image: string | null;
  gallery_images: string[];
};

export type PublicCottage = {
  id: string;
  property_id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  full_description: string | null;
  bed_type: string | null;
  max_adults: number;
  max_children: number;
  max_infants: number;
  max_total_guests: number;
  amenities: string[];
  weekday_price: number;
  weekend_price: number;
  cover_image: string | null;
  gallery_images: string[];
  is_featured: boolean;
};

export type PublicAttraction = {
  id: string;
  name: string;
  description: string | null;
  distance_text: string | null;
  cover_image: string | null;
  gallery_images: string[];
};

export type PublicPolicy = {
  id: string;
  policy_key: string;
  title: string;
  content: string;
};

export type PageSeo = {
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[];
  canonical_url: string | null;
  og_image: string | null;
};

export const getPrimaryProperty = cache(async (): Promise<Property | null> => {
  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select(
      "id,name,slug,tagline,short_intro,full_description,district,state,country,phone_number,whatsapp_number,email,instagram_handle,instagram_url,booking_note,maps_note,check_in_time,check_out_time,cover_image,gallery_images",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to load property: ${error.message}`);
  return data;
});

export const getPublicCottages = cache(async (propertyId: string): Promise<PublicCottage[]> => {
  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("cottages")
    .select(
      "id,property_id,name,slug,category,short_description,full_description,bed_type,max_adults,max_children,max_infants,max_total_guests,amenities,weekday_price,weekend_price,cover_image,gallery_images,is_featured",
    )
    .eq("property_id", propertyId)
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load cottages: ${error.message}`);

  return (data ?? []).map((item) => ({
    ...item,
    amenities: Array.isArray(item.amenities) ? item.amenities.map((value) => String(value)) : [],
  }));
});

export async function getFeaturedCottages(propertyId: string, limit = 3) {
  const cottages = await getPublicCottages(propertyId);
  const featured = cottages.filter((cottage) => cottage.is_featured);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }

  const remaining = cottages.filter((cottage) => !cottage.is_featured);
  return [...featured, ...remaining].slice(0, limit);
}

export async function getCottageBySlug(propertyId: string, slug: string) {
  const cottages = await getPublicCottages(propertyId);
  return cottages.find((cottage) => cottage.slug === slug) ?? null;
}

export const getAttractions = cache(async (propertyId: string): Promise<PublicAttraction[]> => {
  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("attractions")
    .select("id,name,description,distance_text,cover_image,gallery_images")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load attractions: ${error.message}`);
  return data ?? [];
});

export const getPolicies = cache(async (propertyId: string): Promise<PublicPolicy[]> => {
  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("policies")
    .select("id,policy_key,title,content")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw new Error(`Failed to load policies: ${error.message}`);
  return data ?? [];
});

export const getSeoByPageKey = cache(
  async (propertyId: string, pageKey: string): Promise<PageSeo | null> => {
    const supabase = getSupabasePublicServerClient();
    const { data, error } = await supabase
      .from("seo")
      .select("meta_title,meta_description,meta_keywords,canonical_url,og_image")
      .eq("property_id", propertyId)
      .eq("page_key", pageKey)
      .maybeSingle();

    if (error) throw new Error(`Failed to load SEO for ${pageKey}: ${error.message}`);
    return data;
  },
);

export function getFirstImage(coverImage: string | null, gallery: string[] = []) {
  return coverImage || gallery[0] || "/next.svg";
}
