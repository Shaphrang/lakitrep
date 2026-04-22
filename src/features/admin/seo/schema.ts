import { z } from "zod";

export const seoSchema = z.object({
  pageKey: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(10),
  canonicalUrl: z.string().url(),
  status: z.enum(["active", "draft"]),
});

export type SeoInput = z.infer<typeof seoSchema>;
