import { z } from "zod";

export const cottageSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  shortDescription: z.string().min(10),
  fullDescription: z.string().min(20),
  amenities: z.array(z.string()).default([]),
  basePrice: z.number().nonnegative(),
  weekendPrice: z.number().nonnegative(),
  coverImage: z.string().min(1),
  galleryImages: z.array(z.string()).default([]),
  maxGuests: z.number().int().positive(),
  status: z.enum(["active", "draft", "inactive"]),
});

export type CottageInput = z.infer<typeof cottageSchema>;
