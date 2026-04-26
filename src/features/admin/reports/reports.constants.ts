import type { ReportDatePreset } from "./reports.types";

export const REPORT_DATE_PRESETS: { value: ReportDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

export const REPORT_PAGE_LINKS = [
  { href: "/admin/reports", label: "Dashboard" },
  { href: "/admin/reports/bookings", label: "Bookings" },
  { href: "/admin/reports/revenue", label: "Revenue" },
  { href: "/admin/reports/cottages", label: "Cottages" },
  { href: "/admin/reports/checkin-checkout", label: "Check-in / Check-out" },
] as const;
