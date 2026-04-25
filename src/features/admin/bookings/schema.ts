import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "new_request",
  "contacted",
  "confirmed",
  "advance_paid",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
  "completed",
  "rejected",
]);

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
