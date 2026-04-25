"use server";

import { addDays, eachDayOfInterval, format, isAfter, isBefore, parseISO } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";
import {
  calculateNights,
  recalculateBookingTotals,
  simpleRoomEstimate,
} from "@/features/admin/bookings/services/resort-management-service";
import { getCottageAvailability } from "@/actions/public/bookings";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNumber, getOptionalString, getString } from "./_shared";

const DIGIT_PHONE_REGEX = /^\d{10}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VALID_BILLING_STATUSES = new Set([
  "confirmed",
  "advance_paid",
  "checked_in",
  "checked_out",
]);
const VALID_CHARGE_TYPES = new Set([
  "extra_bed",
  "extra_person",
  "food_bill",
  "bonfire",
  "transport",
  "laundry",
  "decoration",
  "late_checkout",
  "damage_charge",
  "other",
  // Backward compatibility values.
  "food",
  "damage",
  "discount_adjustment",
  "room",
]);
const VALID_PAYMENT_MODES = new Set(["cash", "upi", "card", "bank_transfer", "other"]);
const VALID_PAYMENT_TYPES = new Set(["advance", "part_payment", "final_payment", "refund"]);

const customerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().regex(DIGIT_PHONE_REGEX, "Phone number must be exactly 10 digits."),
  whatsappNumber: z
    .string()
    .optional()
    .refine((value) => !value || DIGIT_PHONE_REGEX.test(value), "WhatsApp must be 10 digits."),
  email: z.string().email().or(z.literal("")).optional(),
});

function friendlyError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? fallback;
  if (error instanceof Error) return error.message;
  return fallback;
}

function redirectWithMessage(path: string, key: "success" | "error", message: string) {
  const joiner = path.includes("?") ? "&" : "?";
  redirect(`${path}${joiner}${key}=${encodeURIComponent(message)}`);
}

function rangeContainsUnavailableDates(checkInDate: string, checkOutDate: string, unavailableDateSet: Set<string>) {
  const checkIn = parseISO(checkInDate);
  const checkOut = parseISO(checkOutDate);
  if (!isBefore(checkIn, checkOut)) return true;

  const blockedNights = eachDayOfInterval({
    start: checkIn,
    end: addDays(checkOut, -1),
  });

  return blockedNights.some((day) => unavailableDateSet.has(format(day, "yyyy-MM-dd")));
}


export async function createOrUpdateCustomerAction(formData: FormData) {
  const returnPath = getOptionalString(formData, "return_path") || "/admin/customers";
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();

    const id = getOptionalString(formData, "id");
    const fullName = getString(formData, "full_name");
    const phone = getString(formData, "phone").replace(/\D/g, "").slice(0, 10);
    const whatsappNumber = getOptionalString(formData, "whatsapp_number").replace(/\D/g, "").slice(0, 10);
    const email = getOptionalString(formData, "email");

    customerSchema.parse({ fullName, phone, whatsappNumber, email });

    const payload = {
      full_name: fullName,
      phone,
      whatsapp_number: whatsappNumber || null,
      email: email || null,
      address: getOptionalString(formData, "address") || null,
      city: getOptionalString(formData, "city") || null,
      state: getOptionalString(formData, "state") || null,
      country: getOptionalString(formData, "country") || "India",
      customer_type: getOptionalString(formData, "customer_type") || "other",
      source: getOptionalString(formData, "source") || "other",
      notes: getOptionalString(formData, "notes") || null,
    };

    const duplicateQuery = supabase.from("booking_guests").select("id").eq("phone", phone).limit(1);
    const duplicate = await (id ? duplicateQuery.neq("id", id) : duplicateQuery);

    if ((duplicate.data ?? []).length > 0) {
      redirectWithMessage(returnPath, "error", "A customer with this phone number already exists.");
    }

    if (id) {
      const { error } = await supabase.from("booking_guests").update(payload).eq("id", id);
      if (error) throw new Error("Unable to update customer. Please try again.");
      revalidatePath("/admin/customers");
      redirectWithMessage(returnPath, "success", "Customer updated successfully.");
    }

    const { error } = await supabase.from("booking_guests").insert(payload);
    if (error) throw new Error("Unable to add customer. Please try again.");

    revalidatePath("/admin/customers");
    redirectWithMessage(returnPath, "success", "Customer added successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to save customer."));
  }
}

export async function createManualBookingAction(formData: FormData) {
  const returnPath = getOptionalString(formData, "return_path") || "/admin/bookings/new";

  try {
    const admin = await requireAdmin();
    const supabase = await getSupabaseServerClient();

    const customerId = getString(formData, "customer_id");
    const cottageId = getString(formData, "cottage_id");
    const checkInDate = getString(formData, "check_in_date");
    const checkOutDate = getString(formData, "check_out_date");
    const adults = Math.max(1, getNumber(formData, "adults", 1));
    const children = Math.max(0, getNumber(formData, "children", 0));
    const infants = Math.max(0, getNumber(formData, "infants", 0));

    if (!customerId || !cottageId || !checkInDate || !checkOutDate) {
      throw new Error("Customer, cottage, check-in and check-out are required.");
    }

    const today = format(new Date(), "yyyy-MM-dd");
    if (checkInDate < today) throw new Error("Past check-in dates are not allowed for manual booking.");
    if (checkOutDate <= checkInDate) throw new Error("Check-out date must be after check-in date.");

    const { data: cottage, error: cottageError } = await supabase
      .from("cottages")
      .select("id,slug,max_total_guests,weekday_price,weekend_price")
      .eq("id", cottageId)
      .maybeSingle();

    if (cottageError || !cottage) throw new Error("Invalid cottage selected.");

    if (adults + children + infants > Number(cottage.max_total_guests ?? 0)) {
      throw new Error("Guest count exceeds cottage capacity.");
    }

    const availability = await getCottageAvailability(String(cottage.slug ?? ""));
    if (availability.error) {
      throw new Error("Unable to verify current availability. Please try again.");
    }

    const unavailableDateSet = new Set(availability.unavailableDates ?? []);
    if (rangeContainsUnavailableDates(checkInDate, checkOutDate, unavailableDateSet)) {
      throw new Error("Selected dates are no longer available for this cottage. Please choose another date.");
    }

    const nights = calculateNights(checkInDate, checkOutDate);
    const bookingTotal = simpleRoomEstimate(Number(cottage.weekday_price ?? 0), Number(cottage.weekend_price ?? 0), checkInDate, nights);
    const discountAmount = Math.max(0, getNumber(formData, "discount_amount", 0));
    if (discountAmount > bookingTotal) throw new Error("Discount cannot exceed room charges.");

    const finalTotal = Math.max(0, bookingTotal - discountAmount);
    const advanceAmount = Math.max(0, getNumber(formData, "advance_amount", 0));
    const paymentStatus = advanceAmount <= 0 ? "unpaid" : advanceAmount >= finalTotal ? "paid" : "advance_paid";

    const { data: created, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        property_id: getString(formData, "property_id"),
        booking_guest_id: customerId,
        customer_id: customerId,
        cottage_id: cottageId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        children,
        infants,
        source: getOptionalString(formData, "source") || "phone",
        status: getOptionalString(formData, "status") || (advanceAmount > 0 ? "advance_paid" : "confirmed"),
        payment_method: "pay_on_arrival",
        payment_status: paymentStatus,
        special_requests: getOptionalString(formData, "special_requests") || null,
        admin_notes: getOptionalString(formData, "internal_notes") || null,
        nights,
        total_amount: bookingTotal,
        booking_total: bookingTotal,
        discount_amount: discountAmount,
        extra_charges_total: 0,
        final_total: finalTotal,
        amount_paid: advanceAmount,
        amount_pending: Math.max(0, finalTotal - advanceAmount),
        created_by: admin.id,
      })
      .select("id")
      .single();

    if (bookingError || !created) throw new Error("Failed to create booking.");

    if (advanceAmount > 0) {
      const paymentMode = getOptionalString(formData, "payment_mode") || "cash";
      const { error: paymentError } = await supabase.from("booking_payments").insert({
        booking_id: created.id,
        payment_date: new Date().toISOString().slice(0, 10),
        amount: advanceAmount,
        payment_mode: paymentMode,
        payment_type: "advance",
        reference_number: getOptionalString(formData, "reference_number") || null,
        notes: "Advance received while creating manual booking",
        received_by: admin.id,
      });
      if (paymentError) throw new Error("Booking created but advance payment could not be recorded.");
    }

    revalidatePath("/admin/bookings");
    redirectWithMessage(`/admin/bookings/${created.id}`, "success", "Booking created successfully. The booking has been added to the calendar.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to create manual booking."));
  }
}

export async function addBookingChargeAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${bookingId}`;

  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    if (!UUID_REGEX.test(bookingId)) throw new Error("Invalid booking selected.");

    const { data: booking } = await supabase.from("bookings").select("id,status").eq("id", bookingId).maybeSingle();
    if (!booking) throw new Error("Booking not found.");
    if (!VALID_BILLING_STATUSES.has(String((booking as { status?: string }).status ?? ""))) {
      throw new Error("This booking is not available for billing updates.");
    }

    const quantity = getNumber(formData, "quantity", 1);
    const unitPrice = getNumber(formData, "unit_price", 0);
    if (quantity <= 0) throw new Error("Please enter a valid quantity.");
    if (unitPrice < 0) throw new Error("Please enter a valid amount.");
    const chargeType = getString(formData, "charge_type");
    if (!chargeType.trim()) throw new Error("Charge type is required.");
    if (!VALID_CHARGE_TYPES.has(chargeType)) throw new Error("Please select a valid charge type.");
    const amount = Number((quantity * unitPrice).toFixed(2));
    if (amount < 0) throw new Error("Amount cannot be negative.");

    const { error } = await supabase.from("booking_charges").insert({
      booking_id: bookingId,
      charge_type: chargeType || "other",
      description: getOptionalString(formData, "description") || null,
      quantity,
      unit_price: unitPrice,
      amount,
    });
    if (error) throw new Error("Unable to add extra charge.");

    await recalculateBookingTotals(bookingId);
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/billing");
    revalidatePath(`/admin/billing/${bookingId}`);
    redirectWithMessage(returnPath, "success", "Extra charge added successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[billing] addBookingChargeAction failed", { bookingId, error });
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to save extra charge. Please check the details and try again."));
  }
}

export async function deleteBookingChargeAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const chargeId = getString(formData, "charge_id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${bookingId}`;

  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    if (!UUID_REGEX.test(bookingId) || !UUID_REGEX.test(chargeId)) throw new Error("Invalid request.");
    const { error } = await supabase.from("booking_charges").delete().eq("id", chargeId).eq("booking_id", bookingId);
    if (error) throw new Error("Unable to delete charge.");

    await recalculateBookingTotals(bookingId);
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/billing");
    revalidatePath(`/admin/billing/${bookingId}`);
    redirectWithMessage(returnPath, "success", "Extra charge deleted successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("[billing] deleteBookingChargeAction failed", { bookingId, chargeId, error });
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to delete charge."));
  }
}

export async function applyBookingDiscountAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${bookingId}`;

  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    const discount = getNumber(formData, "discount_amount", 0);
    if (discount < 0) throw new Error("Discount cannot be negative.");
    const { data: booking } = await supabase.from("bookings").select("id,total_amount,extra_charges_total").eq("id", bookingId).maybeSingle();
    if (!booking) throw new Error("Booking not found.");
    const maxDiscount = Number(booking.total_amount ?? 0) + Number(booking.extra_charges_total ?? 0);
    if (discount > maxDiscount) throw new Error("Discount cannot be more than the subtotal.");

    const { error } = await supabase.from("bookings").update({ discount_amount: discount }).eq("id", bookingId);
    if (error) throw new Error("Unable to apply discount.");

    await recalculateBookingTotals(bookingId);
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/billing");
    revalidatePath(`/admin/billing/${bookingId}`);
    redirectWithMessage(returnPath, "success", "Discount applied successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to apply discount."));
  }
}

export async function addBookingPaymentAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${bookingId}`;

  try {
    const admin = await requireAdmin();
    const supabase = await getSupabaseServerClient();
    const amount = getNumber(formData, "amount", 0);
    if (amount <= 0) throw new Error("Payment amount must be positive.");
    const paymentType = getOptionalString(formData, "payment_type") || "part_payment";
    const paymentMode = getOptionalString(formData, "payment_mode");
    if (!paymentMode) throw new Error("Payment mode is required.");
    if (!VALID_PAYMENT_MODES.has(paymentMode)) throw new Error("Please select a valid payment mode.");
    if (!VALID_PAYMENT_TYPES.has(paymentType)) throw new Error("Please select a valid payment type.");
    const { data: booking } = await supabase.from("bookings").select("id,final_total,amount_paid,amount_pending").eq("id", bookingId).maybeSingle();
    if (!booking) throw new Error("Booking not found.");

    const currentPending = Number((booking as { amount_pending?: number }).amount_pending ?? 0);
    const currentPaid = Number((booking as { amount_paid?: number }).amount_paid ?? 0);
    const finalTotal = Number((booking as { final_total?: number }).final_total ?? 0);
    const isRefund = paymentType === "refund";
    if (!isRefund && amount > currentPending) throw new Error("Payment amount cannot be more than the pending amount.");
    const projectedPaid = isRefund ? currentPaid - amount : currentPaid + amount;
    if (!isRefund && projectedPaid > finalTotal) throw new Error("Payment amount cannot be more than the pending amount.");
    if (isRefund && projectedPaid < 0) throw new Error("Refund amount cannot be more than the amount paid so far.");

    const { error } = await supabase.from("booking_payments").insert({
      booking_id: bookingId,
      payment_date: getOptionalString(formData, "payment_date") || new Date().toISOString().slice(0, 10),
      amount,
      payment_mode: paymentMode,
      payment_type: paymentType,
      reference_number: getOptionalString(formData, "reference_number") || null,
      notes: getOptionalString(formData, "notes") || null,
      received_by: admin.id,
    });
    if (error) throw new Error("Unable to record payment.");

    await recalculateBookingTotals(bookingId);
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/payments");
    revalidatePath("/admin/billing");
    revalidatePath(`/admin/billing/${bookingId}`);
    redirectWithMessage(returnPath, "success", "Payment recorded successfully. The billing summary has been updated.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to record payment."));
  }
}

export async function performCheckInOutAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const actionType = getString(formData, "action_type");
  const returnPath = getOptionalString(formData, "return_path") || "/admin/checkin-checkout";

  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id,status,amount_pending,payment_status,check_in_date,check_out_date,booking_guest_id,cottage_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (!booking) throw new Error("Booking not found.");

    const today = format(new Date(), "yyyy-MM-dd");

    if (actionType === "check_in") {
      const validStatus = ["confirmed", "advance_paid"].includes(String(booking.status));
      if (!validStatus) throw new Error("Only confirmed or advance-paid bookings can be checked in.");
      if (!booking.booking_guest_id || !booking.cottage_id) throw new Error("Customer or cottage information is missing.");
      if (today !== String(booking.check_in_date)) {
        const bookingDate = String(booking.check_in_date);
        if (isBefore(parseISO(today), parseISO(bookingDate))) throw new Error("Check-in will be available on the booking check-in date.");
        if (isAfter(parseISO(today), parseISO(bookingDate))) throw new Error("The scheduled check-in date has passed. Please review this booking before checking in.");
      }

      const { error } = await supabase.from("bookings").update({ status: "checked_in", actual_check_in_at: new Date().toISOString() }).eq("id", bookingId);
      if (error) throw new Error("Unable to complete check-in.");

      revalidatePath(`/admin/bookings/${bookingId}`);
      revalidatePath("/admin/checkin-checkout");
      redirectWithMessage(returnPath, "success", "Guest checked in successfully.");
    }

    if (actionType === "check_out") {
      if (String(booking.status) !== "checked_in") throw new Error("Only checked-in bookings can be checked out.");
      if (today !== String(booking.check_out_date)) {
        const bookingDate = String(booking.check_out_date);
        if (isBefore(parseISO(today), parseISO(bookingDate))) throw new Error("Checkout will be available on the booking check-out date.");
        if (isAfter(parseISO(today), parseISO(bookingDate))) throw new Error("The scheduled checkout date has passed. Please review the booking. To change dates, cancel/delete and create a new booking.");
      }

      const pending = Number((booking as { amount_pending?: number }).amount_pending ?? 0);
      if (pending > 0) throw new Error("Pending balance exists. Record final payment before checkout.");

      const { error } = await supabase.from("bookings").update({ status: "checked_out", actual_check_out_at: new Date().toISOString() }).eq("id", bookingId);
      if (error) throw new Error("Unable to complete checkout.");

      revalidatePath(`/admin/bookings/${bookingId}`);
      revalidatePath("/admin/checkin-checkout");
      redirectWithMessage(returnPath, "success", "Checkout completed successfully.");
    }

    throw new Error("Invalid action.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to process check-in/check-out action."));
  }
}

export async function generateInvoiceAction(formData: FormData) {
  const bookingId = getString(formData, "booking_id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${bookingId}`;

  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id,final_total,discount_amount,amount_paid,amount_pending")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Booking not found.");
    if (Number((booking as { final_total?: number }).final_total ?? 0) < 0) throw new Error("Final total is invalid.");

    const { count } = await supabase.from("invoices").select("id", { count: "exact", head: true });
    const next = ((count ?? 0) + 1).toString().padStart(4, "0");
    const year = new Date().getFullYear();

    const { error } = await supabase.from("invoices").insert({
      invoice_number: `LKT-INV-${year}-${next}`,
      booking_id: bookingId,
      invoice_date: new Date().toISOString().slice(0, 10),
      subtotal: Number((booking as { final_total?: number }).final_total ?? 0),
      discount_amount: Number((booking as { discount_amount?: number }).discount_amount ?? 0),
      tax_amount: 0,
      total_amount: Number((booking as { final_total?: number }).final_total ?? 0),
      amount_paid: Number((booking as { amount_paid?: number }).amount_paid ?? 0),
      amount_pending: Number((booking as { amount_pending?: number }).amount_pending ?? 0),
      status: Number((booking as { amount_pending?: number }).amount_pending ?? 0) <= 0 ? "paid" : "issued",
    });

    if (error) throw new Error("Unable to generate invoice.");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/billing/${bookingId}`);
    redirectWithMessage(returnPath, "success", "Invoice generated successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", friendlyError(error, "Unable to generate invoice."));
  }
}
