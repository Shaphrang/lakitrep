import { z } from "zod";
import {
  BOOKING_CONTACT_METHODS,
  BOOKING_STATUSES,
  COTTAGE_STATUSES,
  EVENT_INQUIRY_STATUSES,
  INQUIRY_STATUSES,
  PAYMENT_STATUSES,
} from "@/lib/admin/constants";

export const cottageSchema = z.object({
  propertyId: z.string().uuid("Property is required."),
  code: z.string().trim().min(2),
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  category: z.string().trim().min(2),
  shortDescription: z.string().trim().optional(),
  fullDescription: z.string().trim().optional(),
  bedType: z.string().trim().optional(),
  componentCodes: z.string().trim().optional(),
  maxAdults: z.coerce.number().int().min(1),
  maxChildren: z.coerce.number().int().min(0),
  maxInfants: z.coerce.number().int().min(0),
  maxTotalGuests: z.coerce.number().int().min(1),
  roomCount: z.coerce.number().int().min(1),
  sortOrder: z.coerce.number().int().min(0),
  hasAc: z.boolean(),
  breakfastIncluded: z.boolean(),
  extraBedAllowed: z.boolean(),
  isCombinedUnit: z.boolean(),
  isFeatured: z.boolean(),
  isBookable: z.boolean(),
  status: z.enum(COTTAGE_STATUSES),
});

export const cottagePriceSchema = z.object({
  weekdayRate: z.coerce.number().min(0),
  weekendRate: z.coerce.number().min(0),
  childRate: z.coerce.number().min(0),
  extraBedRate: z.coerce.number().min(0),
  notes: z.string().trim().optional(),
});

export const cottageImageSchema = z.object({
  altText: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0),
});

export const attractionSchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  distanceText: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const policySchema = z.object({
  propertyId: z.string().uuid(),
  policyKey: z.string().trim().min(2),
  title: z.string().trim().min(2),
  content: z.string().trim().min(5),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const bookingUpdateSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  adminNotes: z.string().trim().optional(),
});

export const bookingContactLogSchema = z.object({
  contactMethod: z.enum(BOOKING_CONTACT_METHODS),
  contactSummary: z.string().trim().min(2).optional(),
});

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

export const eventInquiryUpdateSchema = z.object({
  status: z.enum(EVENT_INQUIRY_STATUSES),
  adminNotes: z.string().trim().optional(),
});

export const gallerySchema = z.object({
  propertyId: z.string().uuid(),
  title: z.string().trim().optional(),
  category: z.string().trim().optional(),
  altText: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().min(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  tagline: z.string().trim().optional(),
  shortIntro: z.string().trim().optional(),
  fullDescription: z.string().trim().optional(),
  propertyType: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
  district: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  email: z.string().trim().optional(),
  instagramHandle: z.string().trim().optional(),
  instagramUrl: z.string().trim().optional(),
  facebookUrl: z.string().trim().optional(),
  bookingNote: z.string().trim().optional(),
  mapsNote: z.string().trim().optional(),
  checkInTime: z.string().trim().optional(),
  checkOutTime: z.string().trim().optional(),
  isActive: z.boolean(),
  heroHeadline: z.string().trim().optional(),
  heroSubheadline: z.string().trim().optional(),
  heroTrustLine: z.string().trim().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});
