-- Resort billing indexes

begin;

create index if not exists idx_booking_payments_booking_id on public.booking_payments(booking_id);
create index if not exists idx_booking_charges_booking_id on public.booking_charges(booking_id);
create index if not exists idx_invoices_booking_id_v2 on public.invoices(booking_id);
create index if not exists idx_bookings_payment_status on public.bookings(payment_status);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_stay_dates on public.bookings(check_in_date, check_out_date);

commit;
