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
  { href: "/admin/reports/occupancy", label: "Occupancy" },
  { href: "/admin/reports/revenue", label: "Revenue" },
  { href: "/admin/reports/payments", label: "Payments & Collections" },
  { href: "/admin/reports/outstanding", label: "Outstanding Dues" },
  { href: "/admin/reports/billing", label: "Billing & Invoices" },
  { href: "/admin/reports/customers", label: "Customers" },
  { href: "/admin/reports/cottages", label: "Cottages" },
  { href: "/admin/reports/sources", label: "Booking Sources" },
  { href: "/admin/reports/checkin-checkout", label: "Check-in / Check-out" },
  { href: "/admin/reports/cancellations", label: "Cancellations & Refunds" },
  { href: "/admin/reports/extra-charges", label: "Extra Charges" },
  { href: "/admin/reports/discounts", label: "Discounts" },
  { href: "/admin/reports/forecasting", label: "Forecasting" },
] as const;
