"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createBookingsAction(): Promise<ActionResult> {
  return mockActionResult("Bookings created (mock)");
}

export async function updateBookingsAction(): Promise<ActionResult> {
  return mockActionResult("Bookings updated (mock)");
}

export async function deleteBookingsAction(): Promise<ActionResult> {
  return mockActionResult("Bookings deleted (mock)");
}
