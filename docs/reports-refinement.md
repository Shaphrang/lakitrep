# Reports Refinement

## Scope
Refinement of the Reports module UI/navigation and visible reports pages while preserving existing booking, billing, customers, cottages, and admin contracts.

## Reports sidebar submenu changes
Updated Reports submenu to show only:
1. Dashboard
2. Bookings
3. Revenue
4. Cottages
5. Check-in / Check-out

Implementation detail:
- Sidebar and reports top-nav now derive from the same reduced `REPORT_PAGE_LINKS` list.
- Active submenu item is highlighted.
- Reports submenu remains collapsed/expanded by clicking `Reports`.
- Mobile overflow mitigation added with a bounded submenu scroll container.

## Reports pages kept
- `/admin/reports` (Dashboard)
- `/admin/reports/bookings`
- `/admin/reports/revenue`
- `/admin/reports/cottages`
- `/admin/reports/checkin-checkout`

## Reports pages removed from visible menu
The following routes still exist but are hidden from the visible menu/navigation:
- Occupancy
- Payments & Collections
- Outstanding Dues
- Billing & Invoices
- Customers
- Booking Sources
- Cancellations & Refunds
- Extra Charges
- Discounts
- Forecasting

## Dashboard redesign summary
Redesigned dashboard to a minimal layout with:
- Header + short subtitle.
- Date/search/source filters.
- Refresh action and CSV export (`reports-dashboard-summary.csv`).
- Last updated timestamp.
- KPI cards:
  - Total Bookings
  - Confirmed Bookings
  - Total Revenue
  - Total Collection
  - Outstanding Amount
  - Occupancy Rate
  - Today’s Check-ins
  - Today’s Check-outs
  - Average Booking Value (optional)
  - Top Cottage (optional)
- Simple visuals only:
  - Revenue vs Collection trend
  - Booking status summary
  - Cottage performance summary
- Action Required list.
- Outstanding dues preview table with `Open Billing` action.

## Revenue page consolidation
Revenue report now includes one consolidated page with sections:
1. Revenue Summary
2. Payments & Collections table
3. Extra Charges table (or empty state)
4. Discounts table (or empty state)

Revenue formulas:
- Revenue = `sum(finalAmount)`
- Collection = `sum(paidAmount)`
- Outstanding = `Revenue - Collection`
- Average booking value = `Revenue / booking_count`
- Final Bill Amount = `sum(finalAmount)`
- Paid Amount = `sum(paidAmount)`
- Balance Amount = `Final Bill Amount - Paid Amount`

## Search / filter / sort / export behavior
Visible report pages now provide practical controls:
- Dashboard: date, search, source, CSV export.
- Bookings: date, search, status, source, cottage, sortable columns, CSV export.
- Revenue: date, search, payment status, sortable columns, CSV export.
- Cottages: date, search, status, sortable columns, CSV export.
- Check-in/Check-out: search, date scope, cottage, payment status, sortable columns, CSV export.

CSV behavior:
- Exports the currently filtered/searched rows shown in each table.
- Filenames:
  - `reports-dashboard-summary.csv`
  - `bookings-report.csv`
  - `revenue-report.csv`
  - `cottages-report.csv`
  - `checkin-checkout-report.csv`

## Data freshness fixes
- Existing `noStore()` report dataset fetch path retained to avoid stale server cache.
- Filters are applied from query params on each request so date/filter changes force fresh fetch + recompute.
- Added explicit refresh action on dashboard.

## Files changed
- `src/features/admin/reports/reports.constants.ts`
- `src/features/admin/reports/components/ReportsNav.tsx`
- `src/components/admin/layout/AdminSidebar.tsx`
- `src/features/admin/reports/components/ReportsFilterBar.tsx` (new)
- `src/app/(admin)/admin/(protected)/reports/page.tsx`
- `src/app/(admin)/admin/(protected)/reports/bookings/page.tsx`
- `src/app/(admin)/admin/(protected)/reports/revenue/page.tsx`
- `src/app/(admin)/admin/(protected)/reports/cottages/page.tsx`
- `src/app/(admin)/admin/(protected)/reports/checkin-checkout/page.tsx`
- `docs/reports-refinement.md` (new)

## Database/API changes
- None. No backend/database contract changed.

## Known limitations
- Discount reason is not present in current schema; displayed as `—`.
- Check-in/Check-out page uses operational date scope controls (today/tomorrow/week/all) instead of full custom-range date pair.
- Hidden reports routes remain accessible by direct URL for backward compatibility.

## Testing checklist
- [x] Build passes.
- [x] TypeScript check passes.
- [x] Reports submenu limited to 5 items.
- [x] Sidebar submenu expand/collapse works.
- [x] Dashboard redesign and KPI cards render from live dataset.
- [x] Revenue page includes payments, extra charges, discounts.
- [x] Search/filter/sort/export validated for visible reports.
- [x] Mobile-focused classes retained (stacked cards, overflow-x table wrappers, wrapped filters).
