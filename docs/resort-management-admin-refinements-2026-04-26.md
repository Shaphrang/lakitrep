# Resort Admin Refinements (April 26, 2026)

## Scope
- Refined bookings, customers, and manual booking admin flows with minimal UI/service changes.
- Preserved existing routes, billing workflow, and backend contracts.

## Files Changed
- `src/features/admin/bookings/constants.ts`
- `src/features/admin/bookings/schema.ts`
- `src/actions/admin/bookings.ts`
- `src/features/admin/bookings/components/BookingTable.tsx`
- `src/components/admin/shared/ConfirmSubmitButton.tsx`
- `src/app/(admin)/admin/(protected)/bookings/[bookingId]/page.tsx`
- `src/app/(admin)/admin/(protected)/bookings/page.tsx`
- `src/app/(admin)/admin/(protected)/customers/page.tsx`
- `src/app/(admin)/admin/(protected)/customers/[id]/page.tsx`
- `src/features/admin/bookings/services/resort-management-service.ts`
- `src/app/(admin)/admin/(protected)/bookings/new/page.tsx`
- `src/components/admin/bookings/ManualBookingForm.tsx`
- `src/actions/admin/resort-management.ts`

## What Changed and Why

### A) Bookings
1. **Bookings table visible columns reduced**  
   Now shows only: Code, Guest, Phone, Cottage, Check-in, Check-out, Guests, Status, Source.

2. **Inline Status dropdown behavior**
   - Status is now editable directly in each row.
   - Uses shared booking status options.
   - On change, triggers `updateBookingStatusInlineAction`.
   - Row-level saving feedback (`Saving…`, `Saved`, error message).
   - If update fails, dropdown value is reverted to previous state.
   - No full page navigation; only router refresh for fresh server data.

3. **Booking detail page simplified**
   - Kept only:
     - Booking detail
     - Guest detail
     - Open Billing button (`/admin/billing/[bookingId]`)
     - Delete Booking action (with confirmation)
   - Removed visible billing/charges/payments/checkin-checkout sections from this page UI only.
   - Backend billing logic remains intact and accessible from billing route.

### B) Customers
1. **Filter heading added**
   - Added: `Search & Filter Customers`.

2. **Booking Source made controlled select**
   - Customers filter and customer create/edit forms now use a dropdown.
   - Values come from shared booking source options (`BOOKING_SOURCE_OPTIONS`).
   - Server-side validation now enforces allowed values via `bookingSourceSchema`.

3. **Customer detail booking table updated**
   - Columns now: Booking ID, Check-in, Check-out, Total Bill, Payment Status.
   - Data source uses existing booking billing fields (`final_total`, `payment_status`).
   - If billing totals are missing, UI shows `Not generated`.

### C) Add Manual Booking
1. **Booking Source is read-only**
   - Source is displayed as disabled select.
   - Hidden input still submits source for continuity.
   - Final source now resolves from selected customer record server-side (validated), with safe fallback.

2. **Payment UI/logic removed from manual booking creation**
   - Removed payment-related inputs from the form.
   - Removed advance payment insert logic from `createManualBookingAction`.
   - Manual booking now creates booking-only data; payment/billing handled later in Billing section.
   - Safe defaults used in booking insert:
     - `payment_status: "unpaid"`
     - `amount_paid: 0`
     - `amount_pending: finalTotal`

## Service/API/RPC Notes
- Added server action: `updateBookingStatusInlineAction(id, statusInput)` for row-inline status updates.
- Existing actions/routes retained; no breaking API contract changes.

## Database/Migration Notes
- **No schema changes**
- **No migration required**

## Mobile Responsiveness Notes
- All updated forms/tables remain inside existing responsive utility classes (`grid`, `sm:*`, overflow table container, flexible action row).
- Booking detail actions use wrapping button layout for smaller widths.

## Testing Checklist (to run)
- TypeScript build/typecheck.
- Lint.
- Route smoke checks:
  - `/admin/bookings`
  - `/admin/bookings/[bookingId]`
  - `/admin/customers`
  - `/admin/customers/[id]`
  - `/admin/bookings/new`
- Functional checks:
  - inline booking status update success/failure/revert
  - open billing from booking detail
  - delete booking confirmation and redirect
  - customer source dropdown validation
  - customer booking table total bill/payment status rendering
  - manual booking source read-only behavior
  - manual booking creation without payment capture
