# Admin Role Access Control

## Roles

LakiTrep admin now uses role-based authorization from `public.admin_users.role` with two supported roles:

- `super_admin`
- `staff`

Both roles must also have `is_active = true`.

## Staff Access Scope

Staff (office operator/receptionist) can access only operational modules:

- `/admin/bookings`
  - `/admin/bookings/new`
  - `/admin/bookings/[bookingId]`
- `/admin/customers`
  - `/admin/customers/[id]`
- `/admin/availability`
- `/admin/checkin-checkout`
- `/admin/billing`
  - `/admin/billing/[bookingId]`

## Staff Restricted Scope

Staff is blocked from analytics/content/settings modules:

- `/admin` dashboard (redirects to `/admin/bookings`)
- `/admin/reports`
- `/admin/properties`
- `/admin/cottages`
- `/admin/attractions`
- `/admin/policies`
- `/admin/seo`
- any related nested routes and protected mutation actions for these modules

## Permission Utility

Central permission mapping lives in:

- `src/lib/auth/permissions.ts`

It provides:

- `AdminRole`
- `AdminPermission`
- `ROLE_PERMISSIONS`
- `hasPermission(...)`
- `canAccessAdminPath(...)`

## Sidebar Filtering

Sidebar entries in `src/components/admin/layout/AdminSidebar.tsx` now carry a required `permission` and are filtered with `hasPermission(adminRole, item.permission)`.

- `super_admin` sees full admin menu.
- `staff` sees only Bookings, Customers, Availability, Check-in / Out, and Billing.

## Route Protection

Route-level protection is enforced via:

- `requireAdminPermission(permission)` in `src/lib/auth/admin.ts`
- module layout guards under:
  - `src/app/(admin)/admin/(protected)/reports/layout.tsx`
  - `src/app/(admin)/admin/(protected)/properties/layout.tsx`
  - `src/app/(admin)/admin/(protected)/cottages/layout.tsx`
  - `src/app/(admin)/admin/(protected)/attractions/layout.tsx`
  - `src/app/(admin)/admin/(protected)/policies/layout.tsx`
  - `src/app/(admin)/admin/(protected)/seo/layout.tsx`

Unauthorized access redirects to `/admin/access-denied`.

## Access Denied Page

Added page:

- `src/app/(admin)/admin/(protected)/access-denied/page.tsx`

Displays a friendly message with a safe fallback action to `/admin/bookings`.

## Server Action Protection

Restricted actions now enforce module permissions before mutating data:

- `src/actions/admin/properties.ts` → `properties.manage`
- `src/actions/admin/cottages.ts` → `cottages.manage`
- `src/actions/admin/attractions.ts` → `attractions.manage`
- `src/actions/admin/policies.ts` → `policies.manage`
- `src/actions/admin/seo.ts` → `seo.manage`
- property gallery admin API routes under `src/app/api/admin/properties/[propertyId]/gallery/**` → `properties.manage`

Operational staff actions for bookings/customers/availability/check-in/billing remain available.

## Auth Helper Changes

`getAuthenticatedAdmin()` now returns role-aware admin data:

- `id`
- `email`
- `fullName`
- `role`
- `isActive`

Only active users with supported roles are treated as authenticated admins.

## Staff On `/admin`

`/admin` dashboard page now redirects `staff` to `/admin/bookings`.

## Adding Future Roles

1. Add the role value in `public.admin_users.role`.
2. Extend `AdminRole` in `src/lib/auth/permissions.ts`.
3. Add role permissions in `ROLE_PERMISSIONS`.
4. Add/update menu item permission requirements.
5. Add route-layout/server-action guards for new protected modules.
6. Validate redirect behavior for default landing route.

## Creating a New Staff User

1. Create the user in Supabase Auth.
2. Insert an active row into `public.admin_users`:
   - `id = auth.users.id`
   - `email = user email`
   - `role = 'staff'`
   - `is_active = true`

## Testing Performed

- TypeScript compile validation via project typecheck.
- Lint validation via project lint.
- Manual verification checklist:
  - super admin full menu and full route access
  - staff reduced menu
  - staff blocked on restricted manual URLs
  - staff redirected from `/admin` to `/admin/bookings`
  - restricted server actions rejected for staff
