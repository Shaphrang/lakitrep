export type SeoEntry = {
  id: string;
  property_id: string;
  page_key: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[];
  canonical_url: string | null;
  og_image: string | null;
  is_active: boolean;
};
