-- Resort billing schema guardrails
-- Apply after docs/sql/resort-management-schema.sql

begin;

-- Ensure charge amount remains non-negative.
alter table public.booking_charges
  drop constraint if exists booking_charges_amount_check;
alter table public.booking_charges
  add constraint booking_charges_amount_check check (amount >= 0);

-- Keep booking financial fields non-negative.
alter table public.bookings
  add constraint bookings_discount_amount_non_negative check (discount_amount >= 0) not valid;
alter table public.bookings
  add constraint bookings_extra_charges_non_negative check (extra_charges_total >= 0) not valid;
alter table public.bookings
  add constraint bookings_final_total_non_negative check (final_total >= 0) not valid;
alter table public.bookings
  add constraint bookings_amount_paid_non_negative check (amount_paid >= 0) not valid;
alter table public.bookings
  add constraint bookings_amount_pending_non_negative check (amount_pending >= 0) not valid;

commit;
