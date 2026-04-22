import { z } from "zod";

export const bookingStatusSchema = z.enum(["pending", "confirmed", "cancelled", "completed", "rejected"]);

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
