export const BOOKING_SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "walk_in", label: "Walk-in" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "agent", label: "Agent" },
  { value: "repeat_guest", label: "Repeat Guest" },
  { value: "other", label: "Other" },
] as const;

export type BookingSource = (typeof BOOKING_SOURCE_OPTIONS)[number]["value"];

export const BOOKING_SOURCE_VALUES = BOOKING_SOURCE_OPTIONS.map((option) => option.value);

export const BOOKING_STATUS_OPTIONS = [
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
] as const;
