"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookingStatusSchema } from "@/features/admin/bookings/schema";
import { deleteBooking, updateBookingStatus } from "@/features/admin/bookings/services/bookings-service";
import { requireAdmin } from "@/lib/auth/admin";
import { getString } from "./_shared";

export async function updateBookingsAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id");
  const status = bookingStatusSchema.parse(getString(formData, "status"));
  await updateBookingStatus(id, status);
  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${id}?saved=1`);
}

export async function deleteBookingsAction(formData: FormData) {
  await requireAdmin();
  const id = getString(formData, "id");
  await deleteBooking(id);
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}
