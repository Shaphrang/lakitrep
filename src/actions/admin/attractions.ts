"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createAttractionsAction(): Promise<ActionResult> {
  return mockActionResult("Attractions created (mock)");
}

export async function updateAttractionsAction(): Promise<ActionResult> {
  return mockActionResult("Attractions updated (mock)");
}

export async function deleteAttractionsAction(): Promise<ActionResult> {
  return mockActionResult("Attractions deleted (mock)");
}
