import { addDays, endOfMonth, endOfQuarter, endOfWeek, endOfYear, format, startOfMonth, startOfQuarter, startOfWeek, startOfYear, subDays, subMonths } from "date-fns";
import type { ReportDatePreset } from "./reports.types";

export function getDateRange(preset: ReportDatePreset, customFrom?: string, customTo?: string) {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: format(now, "yyyy-MM-dd"), to: format(now, "yyyy-MM-dd") };
    case "yesterday": {
      const d = subDays(now, 1);
      return { from: format(d, "yyyy-MM-dd"), to: format(d, "yyyy-MM-dd") };
    }
    case "this_week":
      return { from: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"), to: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd") };
    case "this_month":
      return { from: format(startOfMonth(now), "yyyy-MM-dd"), to: format(endOfMonth(now), "yyyy-MM-dd") };
    case "this_quarter":
      return { from: format(startOfQuarter(now), "yyyy-MM-dd"), to: format(endOfQuarter(now), "yyyy-MM-dd") };
    case "this_year":
      return { from: format(startOfYear(now), "yyyy-MM-dd"), to: format(endOfYear(now), "yyyy-MM-dd") };
    case "last_month": {
      const d = subMonths(now, 1);
      return { from: format(startOfMonth(d), "yyyy-MM-dd"), to: format(endOfMonth(d), "yyyy-MM-dd") };
    }
    case "custom":
      return { from: customFrom ?? "", to: customTo ?? "" };
    default:
      return { from: "", to: "" };
  }
}

export function currency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function pct(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function occupancyRate(bookedCottageNights: number, availableCottageNights: number) {
  return pct(bookedCottageNights, availableCottageNights);
}

export function averageBookingValue(totalRevenue: number, numberOfBookings: number) {
  return safeDivide(totalRevenue, numberOfBookings);
}

export function averageStayDuration(totalNights: number, numberOfBookings: number) {
  return safeDivide(totalNights, numberOfBookings);
}

export function outstandingAmount(finalBillAmount: number, paidAmount: number) {
  return Math.max(0, finalBillAmount - paidAmount);
}

export function collectionRate(collectedAmount: number, finalBillAmount: number) {
  return pct(collectedAmount, finalBillAmount);
}

export function cancellationRate(cancelledBookings: number, totalBookings: number) {
  return pct(cancelledBookings, totalBookings);
}

export function repeatCustomerRate(repeatCustomers: number, totalCustomers: number) {
  return pct(repeatCustomers, totalCustomers);
}

export function adr(roomRevenue: number, bookedCottageNights: number) {
  return safeDivide(roomRevenue, bookedCottageNights);
}

export function revpar(roomRevenue: number, availableCottageNights: number) {
  return safeDivide(roomRevenue, availableCottageNights);
}

export function nightsBetween(from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function enumerateDates(from: string, to: string) {
  const dates: string[] = [];
  let cursor = new Date(from);
  const end = new Date(to);
  while (cursor < end) {
    dates.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
}
