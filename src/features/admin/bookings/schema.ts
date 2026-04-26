import { z } from "zod";
import { BOOKING_STATUS_OPTIONS } from "./constants";

export const bookingStatusSchema = z.enum(BOOKING_STATUS_OPTIONS);
export const bookingSourceSchema = z.enum(["website", "phone", "whatsapp", "walk_in", "instagram", "facebook", "agent", "repeat_guest", "other"]);

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
export type BookingSourceInput = z.infer<typeof bookingSourceSchema>;
