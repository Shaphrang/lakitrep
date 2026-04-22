"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createSeoAction(): Promise<ActionResult> {
  return mockActionResult("Seo created (mock)");
}

export async function updateSeoAction(): Promise<ActionResult> {
  return mockActionResult("Seo updated (mock)");
}

export async function deleteSeoAction(): Promise<ActionResult> {
  return mockActionResult("Seo deleted (mock)");
}
