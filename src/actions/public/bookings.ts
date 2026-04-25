"use server";

import { addDays, eachDayOfInterval, format, isBefore, parseISO } from "date-fns";
import { z } from "zod";
import { calculateBookingEstimate, validateGuestCapacity } from "@/lib/booking";
import { getPrimaryProperty, getPublicCottages } from "@/lib/public-site";
import { getSupabasePublicServerClient } from "@/lib/supabase/public-server";
import { sendBookingWhatsappNotification } from "@/lib/whatsapp";

const DIGIT_PHONE_REGEX = /^\d{10}$/;
type BlockedRange = {
  checkInDate: string;
  checkOutDate: string;
};

export type CottageAvailabilityResult = {
  unavailableDates: string[];
  blockedRanges: BlockedRange[];
  error?: string;
};

const formSchema = z.object({
  cottageSlug: z.string().min(1),
  fullName: z.string().trim().min(2, "Full name is required."),
  phone: z
    .string()
    .trim()
    .regex(DIGIT_PHONE_REGEX, "Phone number must be exactly 10 digits."),
  whatsappNumber: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || DIGIT_PHONE_REGEX.test(value), "WhatsApp number must be exactly 10 digits."),
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
  bookingSource: z.string().optional(),
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

function rangeContainsUnavailableDates(checkInDate: string, checkOutDate: string, unavailableDateSet: Set<string>) {
  const checkIn = parseISO(checkInDate);
  const checkOut = parseISO(checkOutDate);
  if (!isBefore(checkIn, checkOut)) return true;

  // Nights are blocked from check-in (inclusive) to check-out (exclusive).
  const blockedNights = eachDayOfInterval({
    start: checkIn,
    end: addDays(checkOut, -1),
  });

  return blockedNights.some((day) => unavailableDateSet.has(format(day, "yyyy-MM-dd")));
}

export async function getCottageAvailability(cottageSlug: string): Promise<CottageAvailabilityResult> {
  const property = await getPrimaryProperty();
  if (!property || !cottageSlug) {
    return { unavailableDates: [], blockedRanges: [], error: "Please select a cottage first." };
  }

  const cottages = await getPublicCottages(property.id);
  const cottage = cottages.find((item) => item.slug === cottageSlug);

  if (!cottage) {
    return { unavailableDates: [], blockedRanges: [], error: "Selected cottage is not available." };
  }

  const supabase = getSupabasePublicServerClient();
  const { data, error } = await supabase.rpc("get_cottage_unavailability", {
    p_property_slug: property.slug,
    p_cottage_slug: cottage.slug,
  });

  if (error) {
    return {
      unavailableDates: [],
      blockedRanges: [],
      error: "We could not check availability right now. Please try again in a moment.",
    };
  }

  const unavailableDates = Array.isArray(data?.unavailableDates)
    ? data.unavailableDates.filter((item: unknown): item is string => typeof item === "string")
    : [];

  const blockedRangeItems: unknown[] = Array.isArray(data?.blockedRanges) ? data.blockedRanges : [];
  const blockedRanges = blockedRangeItems
    .filter(
      (item: unknown): item is BlockedRange =>
        typeof item === "object" && item !== null && "checkInDate" in item && "checkOutDate" in item,
    )
    .map((item) => ({
      checkInDate: item.checkInDate,
      checkOutDate: item.checkOutDate,
    }));

  return {
    unavailableDates,
    blockedRanges,
  };
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
    bookingSource: getOptionalString(formData, "bookingSource"),
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

  const cottages = await getPublicCottages(property.id);
  const selectedCottage = cottages.find((cottage) => cottage.slug === parsed.data.cottageSlug);

  if (!selectedCottage) {
    return { success: false, message: "Selected cottage is not available." };
  }

  if (parsed.data.checkOutDate <= parsed.data.checkInDate) {
    return { success: false, message: "Check-out date must be after check-in date." };
  }

  const capacityError = validateGuestCapacity(selectedCottage, {
    adults: parsed.data.adults,
    children: parsed.data.children,
    infants: parsed.data.infants,
  });

  if (capacityError) {
    return {
      success: false,
      message: `This cottage allows a maximum of ${selectedCottage.max_total_guests} occupants.`,
    };
  }

  const availability = await getCottageAvailability(parsed.data.cottageSlug);
  if (availability.error) {
    return { success: false, message: availability.error };
  }

  const unavailableDateSet = new Set(availability.unavailableDates);
  if (rangeContainsUnavailableDates(parsed.data.checkInDate, parsed.data.checkOutDate, unavailableDateSet)) {
    return {
      success: false,
      message: "Selected dates are unavailable for this cottage. Please choose another date range.",
    };
  }

  const estimate = calculateBookingEstimate({
    cottage: selectedCottage,
    checkInDate: parsed.data.checkInDate,
    checkOutDate: parsed.data.checkOutDate,
    guests: {
      adults: parsed.data.adults,
      children: parsed.data.children,
      infants: parsed.data.infants,
    },
  });

  if (!estimate) {
    return { success: false, message: "Please select valid check-in and check-out dates." };
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

  const bookingCode = typeof data?.booking_code === "string" ? data.booking_code : undefined;
  const estimatedTotal = typeof data?.total_amount === "number" ? data.total_amount : estimate.totalAmount;

  // Pending requests are intentionally not blocking in availability checks to avoid stale soft-locks.
  const whatsappResult = await sendBookingWhatsappNotification({
    bookingCode: bookingCode ?? "N/A",
    fullName: parsed.data.fullName,
    phone: parsed.data.phone,
    whatsappNumber: parsed.data.whatsappNumber || "-",
    email: parsed.data.email || "-",
    cottageName: selectedCottage.name,
    checkInDate: parsed.data.checkInDate,
    checkOutDate: parsed.data.checkOutDate,
    nights: estimate.nights,
    adults: parsed.data.adults,
    children: parsed.data.children,
    infants: parsed.data.infants,
    estimatedTotal,
    specialRequests: parsed.data.specialRequests || "-",
    bookingSource: parsed.data.bookingSource || "Website booking form",
  });

  // Notification delivery should not fail booking persistence.
  if (!whatsappResult.ok) {
    console.error("WhatsApp notification failed after booking creation", whatsappResult.error ?? "Unknown error");
  }

  return {
    success: true,
    message: "Booking request submitted successfully.",
    bookingCode,
    estimatedTotal,
  };
}
