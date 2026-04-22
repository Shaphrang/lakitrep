import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tagline: z.string().optional(),
  short_intro: z.string().optional(),
  full_description: z.string().optional(),
  property_type: z.string().optional(),
  address_line: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  cover_image: z.string().optional(),
  gallery_images: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});

export type PropertyInput = z.infer<typeof propertySchema>;
