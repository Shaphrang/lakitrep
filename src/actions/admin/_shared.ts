export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function getNumber(formData: FormData, key: string, defaultValue = 0) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return defaultValue;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function parseTextList(input: string) {
  return input
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function parseCommaList(input: string) {
  return input
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
