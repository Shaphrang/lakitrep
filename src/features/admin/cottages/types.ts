export type CottageStatus = "active" | "inactive" | "maintenance";

export type Cottage = {
  id: string;
  property_id: string;
  code: string;
  name: string;
  slug: string;
  category: string;
  max_total_guests: number;
  weekday_price: number;
  weekend_price: number;
  cover_image: string | null;
  gallery_images: string[];
  status: CottageStatus;
  is_bookable: boolean;
};
