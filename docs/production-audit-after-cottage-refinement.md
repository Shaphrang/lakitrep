# Production Audit After Cottage/Admin/Public Refinement

Date: 2026-04-26

## 1) What was audited

A production-focused code audit was performed across:

- Admin layout/shell/sidebar/header behavior and route wiring.
- Cottage availability and booking conflict logic (including FC45 ↔ C4/C5 interplay).
- Public homepage, cottages, booking UI/actions, attractions, and location section.
- Admin bookings/manual booking workflow.
- Customers and booking history data safety.
- Billing actions and billing workspace behavior.
- Reports services/pages (dashboard, bookings, revenue, cottages, check-in/check-out).
- Dashboard metric aggregation (`getResortDashboardMetrics`).
- Basic security/validation and stale-data risks.
- Build/lint/script health.

## 2) Cottage behaviour safety checks

Validated and reinforced that archived legacy cottage code `C1-C2` is excluded from active public and admin booking-facing cottage lists by adding explicit query guards in shared data loaders.

## 3) Availability logic fixes

- Conflict lookup for availability now uses active + bookable cottages while explicitly excluding archived `C1-C2` from conflict graph generation.
- Manual booking status options were narrowed to statuses that participate in hard availability blocking (`confirmed`, `advance_paid`) to reduce accidental double-booking via non-blocking statuses.

## 4) Admin flow fixes

- Manual booking action now validates UUID format for selected customer and cottage IDs.
- Manual booking action now validates status against an allow-list.
- Additional UUID validation added for billing-affecting actions:
  - add payment
  - apply discount
  - generate invoice
  - perform check-in/out

## 5) Public homepage/cottage fixes

- Public cottages query now explicitly excludes archived `C1-C2` even if status/bookable flags were mistakenly set in data.
- Public cottage detail route was switched to dynamic rendering mode to avoid build-time hard failures in environments without configured public Supabase variables.

## 6) Attractions checks/fixes

- Attractions flows were reviewed for source usage and null-safe rendering patterns.
- No blocking code defects requiring patch were found in this pass.

## 7) Reports/dashboard checks/fixes

- Check-in/check-out report payment aggregation fixed to treat `refund` as negative instead of positive, preventing overstated paid totals and understated balances.
- Dashboard metric implementation was reviewed for created_at-based collection/revenue separation.

## 8) Billing checks/fixes

- Server actions now guard booking ID UUID format in additional billing paths.
- Existing pending/overpayment/refund checks remain in place and were verified for consistency.

## 9) Security/validation improvements

Implemented defensive server-side validation improvements:

- UUID checks on key booking/billing action entry points.
- Manual booking status allow-list.
- Archived cottage exclusion hardening in booking-facing list queries.

## 10) Performance improvements

- Prevented build-time static path generation pressure for cottage details by forcing dynamic rendering in that route.
- Maintained selective column fetching patterns and bounded limits in existing report/dashboard queries.

## 11) Files changed

- `src/lib/public-site.ts`
- `src/features/admin/bookings/services/resort-management-service.ts`
- `src/actions/admin/resort-management.ts`
- `src/components/admin/bookings/ManualBookingForm.tsx`
- `src/features/admin/reports/services/reports.service.ts`
- `src/app/(public)/cottages/[slug]/page.tsx`
- `docs/production-audit-after-cottage-refinement.md`

## 12) Manual test checklist

### Cottage availability
- [ ] Booking C1 does not block C2 on same dates.
- [ ] Booking C2 does not block C1 on same dates.
- [ ] Booking C4 blocks FC45.
- [ ] Booking C5 blocks FC45.
- [ ] Booking FC45 blocks C4 and C5.
- [ ] Block C4 blocks FC45.
- [ ] Block C5 blocks FC45.
- [ ] Block FC45 blocks C4 and C5.

### Archive handling
- [ ] `C1-C2` not shown in public booking options.
- [ ] `C1-C2` not shown in admin manual booking dropdown.
- [ ] Historical `C1-C2` booking detail opens.
- [ ] Historical `C1-C2` billing opens.
- [ ] Historical `C1-C2` appears safely in history/reports where linked.

### Billing
- [ ] Add charge.
- [ ] Delete charge.
- [ ] Record payment.
- [ ] Apply discount.
- [ ] Generate invoice.
- [ ] Print invoice section.
- [ ] Pending amount updates correctly.
- [ ] Checkout blocked when pending exists.

### Reports
- [ ] Reports dashboard loads.
- [ ] Revenue report filters by `created_at` date range.
- [ ] Bookings report loads/search/filters.
- [ ] Cottages report loads/search/filters.
- [ ] Check-in/check-out report filters by stay dates.
- [ ] CSV exports work.
- [ ] Refund rows reduce paid totals correctly.

### Public home
- [ ] Homepage loads.
- [ ] Cottage cards display expected active set and no archived `C1-C2` row.
- [ ] Mobile layout remains clean.
- [ ] Attractions section renders correctly.
- [ ] Location/how-to-reach section avoids exact public pin.
- [ ] Book Now CTA keeps correct cottage slug.

### Admin layout
- [ ] Sidebar works on mobile open/close.
- [ ] Desktop content spacing aligns with sidebar width.
- [ ] Reports appears as a single nav item.

## 13) Known limitations or future improvements

- Build in this environment still depends on external env setup for full runtime data rendering paths; dynamic mode was applied to cottage detail route to avoid one build-time failure path.
- Multiple lint warnings remain related to `<img>` usage and some unused variables; these are non-blocking but should be cleaned in a dedicated UI/perf pass.
- End-to-end verification of DB mutation flows (booking creation, payments, reports CSV data correctness) requires connected Supabase credentials and seeded staging data.
