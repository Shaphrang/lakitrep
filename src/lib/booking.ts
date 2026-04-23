import { addDays, differenceInCalendarDays, format, getDay, isBefore, parseISO } from "date-fns";
import type { PublicCottage } from "@/lib/public-site";

export type GuestCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type BookingCalculation = {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  baseAmount: number;
  childAmount: number;
  totalAmount: number;
};

export const DEFAULT_GUESTS: GuestCounts = {
  adults: 2,
  children: 0,
  infants: 0,
};

export function formatCurrency(amount: number) {
  return `₹${Math.max(0, amount).toLocaleString("en-IN")}`;
}

export function formatDateLabel(value?: string | null) {
  if (!value) return "Select";
  return format(parseISO(value), "dd MMM yyyy");
}

export function getMinCheckoutDate(checkInDate?: string | null) {
  if (!checkInDate) return undefined;
  return format(addDays(parseISO(checkInDate), 1), "yyyy-MM-dd");
}

export function validateGuestCapacity(cottage: PublicCottage | undefined, guests: GuestCounts) {
  if (!cottage) {
    return "Please select a cottage.";
  }

  const total = guests.adults + guests.children + guests.infants;
  if (guests.adults < 1) return "At least one adult is required.";
  if (guests.adults > cottage.max_adults) return `Adults exceed limit (${cottage.max_adults}).`;
  if (guests.children > cottage.max_children) return `Children exceed limit (${cottage.max_children}).`;
  if (guests.infants > cottage.max_infants) return `Infants exceed limit (${cottage.max_infants}).`;
  if (total > cottage.max_total_guests) return `Total guests exceed limit (${cottage.max_total_guests}).`;
  return null;
}

export function calculateBookingEstimate({
  cottage,
  checkInDate,
  checkOutDate,
  guests,
}: {
  cottage?: PublicCottage;
  checkInDate?: string;
  checkOutDate?: string;
  guests: GuestCounts;
}): BookingCalculation | null {
  if (!cottage || !checkInDate || !checkOutDate) return null;

  const checkIn = parseISO(checkInDate);
  const checkOut = parseISO(checkOutDate);
  if (isBefore(checkOut, addDays(checkIn, 1))) return null;

  const nights = differenceInCalendarDays(checkOut, checkIn);
  if (nights <= 0) return null;

  let weekdayNights = 0;
  let weekendNights = 0;
  for (let i = 0; i < nights; i += 1) {
    const date = addDays(checkIn, i);
    const day = getDay(date);
    if (day === 0 || day === 6) {
      weekendNights += 1;
    } else {
      weekdayNights += 1;
    }
  }

  const baseAmount = weekdayNights * cottage.weekday_price + weekendNights * cottage.weekend_price;
  const childAmount = guests.children * cottage.child_price * nights;

  return {
    nights,
    weekdayNights,
    weekendNights,
    baseAmount,
    childAmount,
    totalAmount: baseAmount + childAmount,
  };
}
