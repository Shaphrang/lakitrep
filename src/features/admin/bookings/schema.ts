import { z } from "zod";

export const bookingSchema = z.object({
  reference: z.string().min(3),
  guestName: z.string().min(2),
  checkIn: z.string().min(8),
  checkOut: z.string().min(8),
  cottageName: z.string().min(2),
  totalAmount: z.number().nonnegative(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});

export type BookingInput = z.infer<typeof bookingSchema>;
