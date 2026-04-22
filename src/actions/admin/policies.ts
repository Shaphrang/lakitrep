"use server";

import { mockActionResult, type ActionResult } from "./_shared";

export async function createPoliciesAction(): Promise<ActionResult> {
  return mockActionResult("Policies created (mock)");
}

export async function updatePoliciesAction(): Promise<ActionResult> {
  return mockActionResult("Policies updated (mock)");
}

export async function deletePoliciesAction(): Promise<ActionResult> {
  return mockActionResult("Policies deleted (mock)");
}
