import { z } from "zod";

export const attractionSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  distance_text: z.string().optional(),
  cover_image: z.string().optional(),
  gallery_images: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type AttractionInput = z.infer<typeof attractionSchema>;
