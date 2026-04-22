"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createPropertiesAction(): Promise<ActionResult> {
  return mockActionResult("Properties created (mock)");
}

export async function updatePropertiesAction(): Promise<ActionResult> {
  return mockActionResult("Properties updated (mock)");
}

export async function deletePropertiesAction(): Promise<ActionResult> {
  return mockActionResult("Properties deleted (mock)");
}
