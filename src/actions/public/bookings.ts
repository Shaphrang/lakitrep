"use server";

import { z } from "zod";
import { getSupabasePublicServerClient } from "@/lib/supabase/public-server";
import { getPrimaryProperty } from "@/lib/public-site";

const formSchema = z.object({
  cottageSlug: z.string().min(1),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  adults: z.coerce.number().int().min(1),
  children: z.coerce.number().int().min(0),
  infants: z.coerce.number().int().min(0),
  specialRequests: z.string().optional(),
});

export type BookingFormState = {
  success: boolean;
  message: string;
  bookingCode?: string;
  estimatedTotal?: number;
};
function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function submitBookingRequest(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const property = await getPrimaryProperty();
  if (!property) {
    return { success: false, message: "Property not found." };
  }

  const parsed = formSchema.safeParse({
    cottageSlug: getRequiredString(formData, "cottageSlug"),
    fullName: getRequiredString(formData, "fullName"),
    phone: getRequiredString(formData, "phone"),
    whatsappNumber: getOptionalString(formData, "whatsappNumber"),
    email: getOptionalString(formData, "email"),
    city: getOptionalString(formData, "city"),
    state: getOptionalString(formData, "state"),
    country: getOptionalString(formData, "country"),
    checkInDate: getRequiredString(formData, "checkInDate"),
    checkOutDate: getRequiredString(formData, "checkOutDate"),
    adults: formData.get("adults"),
    children: formData.get("children"),
    infants: formData.get("infants"),
    specialRequests: formData.get("specialRequests"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const path = firstIssue?.path?.[0];

    return {
      success: false,
      message:
        path === "cottageSlug"
          ? "Please choose a cottage."
          : path === "checkInDate" || path === "checkOutDate"
            ? "Please select valid check-in and check-out dates."
            : firstIssue?.message || "Please complete all required fields correctly.",
    };
  }

  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase.rpc("create_booking_request", {
    p_property_slug: property.slug,
    p_cottage_slug: parsed.data.cottageSlug,
    p_full_name: parsed.data.fullName,
    p_phone: parsed.data.phone,
    p_whatsapp_number: parsed.data.whatsappNumber ?? null,
    p_email: parsed.data.email || null,
    p_city: parsed.data.city ?? null,
    p_state: parsed.data.state ?? null,
    p_country: parsed.data.country ?? null,
    p_check_in_date: parsed.data.checkInDate,
    p_check_out_date: parsed.data.checkOutDate,
    p_adults: parsed.data.adults,
    p_children: parsed.data.children,
    p_infants: parsed.data.infants,
    p_special_requests: parsed.data.specialRequests ?? null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Booking request submitted successfully.",
    bookingCode: data?.booking_code,
    estimatedTotal: typeof data?.total_amount === "number" ? data.total_amount : undefined,
  };
}
