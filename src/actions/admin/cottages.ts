"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createCottagesAction(): Promise<ActionResult> {
  return mockActionResult("Cottages created (mock)");
}

export async function updateCottagesAction(): Promise<ActionResult> {
  return mockActionResult("Cottages updated (mock)");
}

export async function deleteCottagesAction(): Promise<ActionResult> {
  return mockActionResult("Cottages deleted (mock)");
}
