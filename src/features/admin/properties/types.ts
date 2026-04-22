export type Property = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  short_intro: string | null;
  district: string | null;
  state: string | null;
  cover_image: string | null;
  gallery_images: string[];
  is_active: boolean;
};
