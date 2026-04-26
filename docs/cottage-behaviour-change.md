# Cottage behaviour change audit (C1/C2 split + FC45 conflict rules)

## 1) Why the cottage model changed
The old `C1-C2` row represented two physical cottages in one logical inventory bucket. That made overlap checks by `cottage_id` unsafe and could cause unintended blocking or double-booking risk.

## 2) Old model problem
- `C1-C2` could not represent independent occupancy for C1 vs C2.
- Queries checking only one `cottage_id` could over-block or under-block when the physical reality was two units.

## 3) New cottage structure
Operational/bookable rows are expected to be:
- `C1` Premium Cottage A1
- `C2` Premium Cottage A2
- `C3` Premium Cottage B
- `C4` Cottage 4
- `C5` Cottage 5
- `FC45` Family Cottage (`is_combined_unit = true`, `component_codes = ['C4','C5']`)

## 4) Archive handling for C1-C2
- `C1-C2` must remain for historical bookings.
- It must be `is_bookable = false` and excluded from **new** public/admin selection.
- Historical pages (billing/report/customer history) must still resolve old linked records safely.

## 5) Family Cottage conflict rule
Conflict set is now computed from cottage codes and component codes:
- Booking/availability checks for `FC45` include `FC45`, `C4`, `C5`.
- Checks for `C4` include `C4` and `FC45`.
- Checks for `C5` include `C5` and `FC45`.
- `C1`, `C2`, `C3` remain independent unless explicitly defined as components in future.

## 6) Availability logic explanation
Overlap condition remains:
- `existing.check_in_date < requested_check_out_date`
- `existing.check_out_date > requested_check_in_date`

Blocking booking statuses for conflict checks:
- `confirmed`
- `advance_paid`
- `checked_in`

Also applied to `cottage_blocks` for the same related conflict set.

## 7) Child price correction
Policy enforced as backward-compatible validation/display behavior:
- Children cannot be added where `max_children = 0`.
- Child charges are naturally zero when `child_price = 0` and/or children count is zero.
- Infant allowance remains controlled by `max_infants`.
- Public UI now shows infant-included messaging where applicable and avoids child-charge lines unless amount > 0.

## 8) Files changed
- `src/features/admin/bookings/services/resort-management-service.ts`
- `src/actions/admin/resort-management.ts`
- `src/app/(admin)/admin/(protected)/bookings/new/page.tsx`
- `src/components/admin/bookings/ManualBookingForm.tsx`
- `src/lib/public-site.ts`
- `src/components/public/BookingRequestForm.tsx`
- `src/components/public/booking/HeroBookingWidget.tsx`
- `src/app/(public)/cottages/[slug]/page.tsx`
- `src/app/(admin)/admin/(protected)/availability/page.tsx`
- `src/features/admin/reports/services/reports.service.ts`
- `src/app/(admin)/admin/(protected)/reports/cottages/page.tsx`
- `docs/supabase/schema.sql`
- `docs/supabase/migrations/20260426_cottage_conflict_availability.sql`

## 9) Queries changed
Selection queries for new booking/public display now consistently require:
- `status = 'active'`
- `is_bookable = true`

Historical joins were not globally filtered, preserving old records.

## 10) Testing scenarios to run
- Public and admin booking lists exclude `C1-C2` archive.
- C1 and C2 availability remain independent.
- FC45 / C4 / C5 mutual blocking works for bookings and blocks.
- Old `C1-C2` linked bookings remain visible in billing/history/reports.
- Child controls disabled where `max_children = 0`; infant controls follow `max_infants`.

## 11) Known limitations
- Public availability/booking RPC logic is included in SQL migration/docs updates and must be applied to the DB for production behavior to match code expectations.
- Cottage occupancy reporting uses operational inventory (`active + bookable`) and shows archived cottages separately as historical rows with zero available nights to avoid inventory inflation.
