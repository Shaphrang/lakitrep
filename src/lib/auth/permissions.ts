export type AdminRole = "super_admin" | "staff";

export type AdminPermission =
  | "admin.full"
  | "dashboard.view"
  | "bookings.read"
  | "bookings.create"
  | "bookings.update"
  | "customers.read"
  | "availability.read"
  | "checkin_checkout.read"
  | "checkin_checkout.update"
  | "billing.read"
  | "billing.update"
  | "reports.view"
  | "properties.manage"
  | "cottages.manage"
  | "attractions.manage"
  | "policies.manage"
  | "seo.manage";

export const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: [
    "admin.full",
    "dashboard.view",
    "bookings.read",
    "bookings.create",
    "bookings.update",
    "customers.read",
    "availability.read",
    "checkin_checkout.read",
    "checkin_checkout.update",
    "billing.read",
    "billing.update",
    "reports.view",
    "properties.manage",
    "cottages.manage",
    "attractions.manage",
    "policies.manage",
    "seo.manage",
  ],
  staff: [
    "bookings.read",
    "bookings.create",
    "bookings.update",
    "customers.read",
    "availability.read",
    "checkin_checkout.read",
    "checkin_checkout.update",
    "billing.read",
    "billing.update",
  ],
};

export function isAdminRole(value: string | null | undefined): value is AdminRole {
  return value === "super_admin" || value === "staff";
}

export function hasPermission(
  role: AdminRole | string | null | undefined,
  permission: AdminPermission,
) {
  if (!role) return false;
  if (role === "super_admin") return true;
  if (!isAdminRole(role)) return false;

  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessAdminPath(role: AdminRole | string | null | undefined, pathname: string) {
  if (role === "super_admin") return true;

  if (role === "staff") {
    return (
      pathname === "/admin/bookings" ||
      pathname.startsWith("/admin/bookings/") ||
      pathname === "/admin/customers" ||
      pathname.startsWith("/admin/customers/") ||
      pathname === "/admin/availability" ||
      pathname.startsWith("/admin/availability/") ||
      pathname === "/admin/checkin-checkout" ||
      pathname.startsWith("/admin/checkin-checkout/") ||
      pathname === "/admin/billing" ||
      pathname.startsWith("/admin/billing/")
    );
  }

  return false;
}
