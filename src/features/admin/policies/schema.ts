import { z } from "zod";

export const policySchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  content: z.string().min(10),
  status: z.enum(["active", "draft", "inactive"]),
});

export type PolicyInput = z.infer<typeof policySchema>;
