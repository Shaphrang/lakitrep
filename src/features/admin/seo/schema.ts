import { z } from "zod";

export const seoSchema = z.object({
  property_id: z.string().uuid(),
  page_key: z.string().min(2),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.array(z.string()).default([]),
  canonical_url: z.string().url().optional().or(z.literal("")),
  og_image: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type SeoInput = z.infer<typeof seoSchema>;
