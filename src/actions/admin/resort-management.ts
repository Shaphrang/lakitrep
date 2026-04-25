"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  assertCottageAvailability,
  calculateNights,
  recalculateBookingTotals,
  simpleRoomEstimate,
} from "@/features/admin/bookings/services/resort-management-service";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNumber, getOptionalString, getString } from "./_shared";

const DIGIT_PHONE_REGEX = /^\d{10}$/;

const customerSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(DIGIT_PHONE_REGEX, "Phone number must be exactly 10 digits."),
  whatsappNumber: z.string().optional().refine((value) => !value || DIGIT_PHONE_REGEX.test(value), "WhatsApp must be 10 digits."),
  email: z.string().email().or(z.literal("")).optional(),
});

export async function createOrUpdateCustomerAction(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const id = getOptionalString(formData, "id");
  const fullName = getString(formData, "full_name");
  const phone = getString(formData, "phone");
  const whatsappNumber = getOptionalString(formData, "whatsapp_number");
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
    throw new Error("A customer with the same phone number already exists.");
  }

  if (id) {
    const { error } = await supabase.from("booking_guests").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("booking_guests").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function createManualBookingAction(formData: FormData) {
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
    throw new Error("Customer, cottage, check-in, and check-out are required.");
  }

  if (checkOutDate <= checkInDate) {
    throw new Error("Check-out date must be after check-in date.");
  }

  const { data: cottage, error: cottageError } = await supabase
    .from("cottages")
    .select("id,max_total_guests,weekday_price,weekend_price")
    .eq("id", cottageId)
    .maybeSingle();

  if (cottageError || !cottage) throw new Error("Invalid cottage selected.");

  if (adults + children + infants > Number(cottage.max_total_guests ?? 0)) {
    throw new Error("Guest count exceeds cottage capacity.");
  }

  const availability = await assertCottageAvailability(cottageId, checkInDate, checkOutDate);
  if (availability.hasConflict) {
    throw new Error("Selected cottage is not available for this date range.");
  }

  const nights = calculateNights(checkInDate, checkOutDate);
  const bookingTotal = simpleRoomEstimate(Number(cottage.weekday_price ?? 0), Number(cottage.weekend_price ?? 0), checkInDate, nights);
  const discountAmount = Math.max(0, getNumber(formData, "discount_amount", 0));
  if (discountAmount > bookingTotal) throw new Error("Discount cannot exceed booking total.");

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

  if (bookingError || !created) throw new Error(bookingError?.message ?? "Failed to create booking.");

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

    if (paymentError) throw new Error(paymentError.message);
  }

  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${created.id}`);
}

export async function addBookingChargeAction(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const bookingId = getString(formData, "booking_id");
  const quantity = Math.max(1, getNumber(formData, "quantity", 1));
  const unitPrice = Math.max(0, getNumber(formData, "unit_price", 0));
  const amount = Number((quantity * unitPrice).toFixed(2));

  const { error } = await supabase.from("booking_charges").insert({
    booking_id: bookingId,
    charge_type: getString(formData, "charge_type") || "other",
    description: getOptionalString(formData, "description") || null,
    quantity,
    unit_price: unitPrice,
    amount,
  });

  if (error) throw new Error(error.message);
  await recalculateBookingTotals(bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/billing");
}

export async function addBookingPaymentAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const bookingId = getString(formData, "booking_id");
  const amount = Math.max(0, getNumber(formData, "amount", 0));
  if (amount <= 0) throw new Error("Payment amount must be positive.");

  const { error } = await supabase.from("booking_payments").insert({
    booking_id: bookingId,
    payment_date: getOptionalString(formData, "payment_date") || new Date().toISOString().slice(0, 10),
    amount,
    payment_mode: getOptionalString(formData, "payment_mode") || "cash",
    payment_type: getOptionalString(formData, "payment_type") || "part_payment",
    reference_number: getOptionalString(formData, "reference_number") || null,
    notes: getOptionalString(formData, "notes") || null,
    received_by: admin.id,
  });
  if (error) throw new Error(error.message);

  await recalculateBookingTotals(bookingId);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/payments");
  revalidatePath("/admin/billing");
}

export async function performCheckInOutAction(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const bookingId = getString(formData, "booking_id");
  const actionType = getString(formData, "action_type");
  const allowPending = getString(formData, "allow_pending") === "1";

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,status,amount_pending,payment_status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) throw new Error("Booking not found.");

  if (actionType === "check_in") {
    const valid = ["confirmed", "advance_paid", "checked_in"].includes(String(booking.status));
    if (!valid && !allowPending) {
      throw new Error("Booking should be confirmed or advance paid before check-in.");
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "checked_in", actual_check_in_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) throw new Error(error.message);
  }

  if (actionType === "check_out") {
    const pending = Number((booking as { amount_pending?: number }).amount_pending ?? 0);
    if (pending > 0 && !allowPending) {
      throw new Error("Pending dues exist. Use checkout with pending dues to continue.");
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "checked_out", actual_check_out_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/checkin-checkout");
}

export async function generateInvoiceAction(formData: FormData) {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const bookingId = getString(formData, "booking_id");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,final_total,discount_amount,amount_paid,amount_pending")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) throw new Error("Booking not found.");

  const { data: existing } = await supabase.from("invoices").select("id").order("created_at", { ascending: false }).limit(1);
  const next = ((existing?.length ?? 0) + 1).toString().padStart(4, "0");
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

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/invoices");
}
