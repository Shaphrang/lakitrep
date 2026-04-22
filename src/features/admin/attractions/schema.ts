import { z } from "zod";

export const attractionSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  shortDescription: z.string().min(10),
  duration: z.string().min(2),
  status: z.enum(["active", "draft", "inactive"]),
});

export type AttractionInput = z.infer<typeof attractionSchema>;
