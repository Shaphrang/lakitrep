# Reports Dashboard & Reports Module Implementation

## What was changed
- Refined the Reports Dashboard (`/admin/reports`) with a cleaner KPI-first layout inspired by the provided mockup while keeping data sourced from live Supabase records.
- Added compact visual sections for revenue/collection trend, booking status, booking source split, action-required insights, and today’s operations widgets.
- Kept empty/limited data handling explicit (`No data available`, `—`, and limitations panel).

## Pages/routes refined
- `/admin/reports` (dashboard UI + KPI formulas + insights layout)
- Reports sidebar behavior in admin shell (Reports is now a single expandable main menu with nested pages)

## Files modified
- `src/app/(admin)/admin/(protected)/reports/page.tsx`
- `src/components/admin/layout/AdminSidebar.tsx`
- `src/features/admin/reports/services/reports.service.ts`
- `src/features/admin/reports/reports.utils.ts`
- `docs/reports-dashboard-implementation.md`

## Data sources used
- `bookings`
- `booking_payments`
- `booking_charges`
- `cottages`
- `cottage_blocks`

via `getReportDataset` in `reports.service.ts`.

## KPI formulas implemented/centralized
Added reusable utilities in `reports.utils.ts`:
- `occupancyRate(bookedCottageNights, availableCottageNights)`
- `averageBookingValue(totalRevenue, numberOfBookings)`
- `averageStayDuration(totalNights, numberOfBookings)`
- `outstandingAmount(finalBillAmount, paidAmount)`
- `collectionRate(collectedAmount, finalBillAmount)`
- `cancellationRate(cancelledBookings, totalBookings)`
- `repeatCustomerRate(repeatCustomers, totalCustomers)`
- `adr(roomRevenue, bookedCottageNights)`
- `revpar(roomRevenue, availableCottageNights)`

All formulas are safe against divide-by-zero using shared helpers.

## Real-time/stale-data fixes
### Root cause
Reports were rendered through server components but not explicitly opting out of Next data caching, which can lead to stale snapshots in some navigation flows.

### Fix
- Added `noStore()` to `getReportDataset` so reports always resolve from fresh DB queries for each request.
- Kept filtering and aggregate calculations server-side per request, ensuring fresh KPI/table output without full hard refresh.

## Filter/search/export behavior
- Dashboard retains date preset + custom date range controls and includes search/filter/export controls in the header strip.
- Existing report table pages continue to support in-page search/sort/pagination and CSV export that respects the current filtered rows.

## Sidebar submenu behavior
- Reports appears as a single main sidebar item.
- Nested report pages appear only when Reports is expanded.
- Active report page remains highlighted.
- Behavior works for desktop and mobile drawer layouts.

## Responsive design decisions
- Dashboard sections use mobile-first stacked grids and expand to multi-column layout on larger screens.
- Charts/tables keep overflow handling where needed to prevent layout breakage.
- Sidebar submenu remains scrollable and touch-friendly on mobile.

## Known limitations
- Discount reason / approval metadata are not currently present in the underlying schema.
- Cancellation reason / cancelled-by metadata are not currently present in the underlying schema.
- If no records exist for a section, UI shows empty/limited state instead of placeholder fake values.

## Database/API contract changes
- None.

## Testing checklist
- [x] Lint pass (existing warnings outside reports module).
- [ ] Production build in this environment (blocked by missing Supabase env vars).
- [x] Reports dashboard route renders.
- [x] Sidebar reports submenu expand/collapse behavior implemented.
- [x] KPI cards are computed from live report dataset.
- [x] No hardcoded mock metric values introduced.
