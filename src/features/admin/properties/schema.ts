import { z } from "zod";

export const propertySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  location: z.string().min(2),
  shortDescription: z.string().min(10),
  status: z.enum(["active", "draft", "inactive"]),
});

export type PropertyInput = z.infer<typeof propertySchema>;
