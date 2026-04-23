export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : "";
}

export function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function getNumber(formData: FormData, key: string, defaultValue = 0) {
  const raw = getString(formData, key);
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

export function parseTextList(input: string) {
  return uniqueStrings(
    input
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean),
  );
}

export function parseCommaList(input: string) {
  return uniqueStrings(
    input
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );
}
