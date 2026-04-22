export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export function mockActionResult(message: string): ActionResult {
  // TODO: connect server action to real mutation.
  return { success: true, message };
}
