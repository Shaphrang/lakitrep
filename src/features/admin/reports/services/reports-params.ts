import type { ReportDatePreset } from "../reports.types";
import { getDateRange } from "../reports.utils";

export async function resolveReportDateRange(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const params = await searchParams;
  const preset = (typeof params.preset === "string" ? params.preset : "this_month") as ReportDatePreset;
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";
  return { preset, ...getDateRange(preset, from, to) };
}
