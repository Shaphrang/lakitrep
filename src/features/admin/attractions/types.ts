export type Attraction = {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  distance_text: string | null;
  cover_image: string | null;
  gallery_images: string[];
  sort_order: number;
  is_active: boolean;
};
