begin;

create index if not exists idx_bookings_check_in_out on public.bookings(check_in_date, check_out_date);
create index if not exists idx_bookings_cottage_id on public.bookings(cottage_id);
create index if not exists idx_bookings_customer_id on public.bookings(customer_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_booking_payments_booking_date on public.booking_payments(booking_id, payment_date);
create index if not exists idx_invoices_booking_id on public.invoices(booking_id);
create index if not exists idx_invoices_invoice_number on public.invoices(invoice_number);
create index if not exists idx_cottage_blocks_cottage_dates on public.cottage_blocks(cottage_id, start_date, end_date);

commit;
