import { z } from "zod";

export const policySchema = z.object({
  property_id: z.string().uuid(),
  policy_key: z.string().min(2),
  title: z.string().min(2),
  content: z.string().min(10),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type PolicyInput = z.infer<typeof policySchema>;
