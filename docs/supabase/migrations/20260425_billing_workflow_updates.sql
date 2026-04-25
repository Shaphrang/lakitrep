-- Billing workflow support: non-breaking indexes and guardrails

begin;

create index if not exists idx_booking_charges_booking_id on public.booking_charges(booking_id);
create index if not exists idx_booking_payments_booking_id on public.booking_payments(booking_id);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status);

alter table public.booking_charges
  drop constraint if exists booking_charges_amount_check;
alter table public.booking_charges
  add constraint booking_charges_amount_check check (amount >= 0);

commit;
