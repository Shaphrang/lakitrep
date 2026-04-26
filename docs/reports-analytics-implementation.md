# Reports & Analytics Implementation

## 1) Module overview
Implemented a complete admin Reports module with a dashboard plus 14 dedicated report pages. All reports use real booking/billing/payment/cottage data and avoid fake business values.

## 2) Routes/pages added
- `/admin/reports` dashboard
- `/admin/reports/bookings`
- `/admin/reports/occupancy`
- `/admin/reports/revenue`
- `/admin/reports/payments`
- `/admin/reports/outstanding`
- `/admin/reports/billing`
- `/admin/reports/customers`
- `/admin/reports/cottages`
- `/admin/reports/sources`
- `/admin/reports/checkin-checkout`
- `/admin/reports/cancellations`
- `/admin/reports/extra-charges`
- `/admin/reports/discounts`
- `/admin/reports/forecasting`

## 3) Files changed
- Added `src/features/admin/reports/*` service/types/utils/constants/components.
- Replaced dashboard report page and added all report route pages.
- Updated admin sidebar navigation for complete reports menu.

## 4) Data sources used
- `bookings`
- `booking_guests`
- `cottages`
- `booking_payments`
- `booking_charges`
- `invoices`
- `cottage_blocks`

## 5) KPI formulas
Implemented centrally in `reports.utils.ts`/dashboard calculations:
- Occupancy Rate = booked nights / available nights * 100
- ADR = room revenue / booked nights
- RevPAR = room revenue / available nights
- Collection Rate = collected / billed * 100
- Cancellation Rate = cancelled / total bookings * 100
- Repeat Customer Rate = repeat customers / total customers * 100
- Average Booking Value = total revenue / bookings
- Average Stay Duration = total nights / bookings
- Outstanding = final bill - paid

All divisions are zero-safe.

## 6) Revenue vs collection logic
- Revenue uses booking `final_total` (billed value).
- Collection uses received payments / booking `amount_paid`.
- Outstanding uses `final_total - amount_paid`.

## 7) Occupancy logic
- Available nights = cottages in scope * date-span nights.
- Booked nights = sum of booking nights.
- Blocked nights from `cottage_blocks` are surfaced separately.

## 8) Outstanding dues logic
- Report defaults to bookings with due amount `> 0`.
- Tracks unpaid, partially paid, past-checkout due, and upcoming-checkin due.

## 9) Customer repeat logic
- Primary key: guest phone.
- Fallback: guest name when phone missing.
- Repeat customer = more than one booking within selected data scope.

## 10) Booking source logic
- Uses existing `bookings.source` values as-is.
- No new source values added.

## 11) Export behavior
- Every report table supports CSV export.
- Export respects in-table search/sort filtering state.

## 12) Responsive/mobile behavior
- KPI cards stack by breakpoint.
- Tables use horizontal scroll on narrow screens.
- Controls wrap and remain touch-friendly.

## 13) Database/API/RPC changes
- No database migrations.
- No contract-breaking API/RPC changes.

## 14) Unavailable fields / limitations
- Cancellation reason and cancelled_by not currently stored -> shown as "Not available".
- Discount reason/approved_by not currently stored -> shown as "Not available".
- Collected-by user detail not expanded; shown as generic "Admin" when available.

## 15) Testing checklist
- Build and type-check pass.
- Report routes compile.
- Sidebar links include all required report sections.
- CSV export functional on report tables.
- Empty states shown for missing data (extra charges/discount details).
- Revenue/collection logic separated correctly.
