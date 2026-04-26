"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { bookingStatusSchema } from "@/features/admin/bookings/schema";
import { deleteBooking, updateBookingStatus } from "@/features/admin/bookings/services/bookings-service";
import { requireAdmin } from "@/lib/auth/admin";
import { getOptionalString, getString } from "./_shared";

function redirectWithMessage(path: string, key: "success" | "error", message: string) {
  const joiner = path.includes("?") ? "&" : "?";
  redirect(`${path}${joiner}${key}=${encodeURIComponent(message)}`);
}

export async function updateBookingsAction(formData: FormData) {
  const id = getString(formData, "id");
  const returnPath = getOptionalString(formData, "return_path") || `/admin/bookings/${id}`;

  try {
    await requireAdmin();
    const status = bookingStatusSchema.parse(getString(formData, "status"));
    await updateBookingStatus(id, status);
    revalidatePath("/admin/bookings");
    redirectWithMessage(returnPath, "success", "Booking status updated successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", "Unable to update booking status.");
  }
}

export async function updateBookingStatusInlineAction(id: string, statusInput: string) {
  try {
    await requireAdmin();
    const status = bookingStatusSchema.parse(statusInput);
    await updateBookingStatus(id, status);
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false as const, error: error.message || "Unable to update booking status." };
    }
    return { ok: false as const, error: "Unable to update booking status." };
  }
}

export async function deleteBookingsAction(formData: FormData) {
  const id = getString(formData, "id");
  const returnPath = getOptionalString(formData, "return_path") || "/admin/bookings";

  try {
    await requireAdmin();
    await deleteBooking(id);
    revalidatePath("/admin/bookings");
    redirectWithMessage(returnPath, "success", "Booking deleted successfully.");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirectWithMessage(returnPath, "error", "Unable to delete booking.");
  }
}
