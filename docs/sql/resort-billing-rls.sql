-- Resort billing RLS helpers
-- Apply only where RLS is enabled and public.is_admin_user() exists.

begin;

alter table public.booking_payments enable row level security;
alter table public.booking_charges enable row level security;
alter table public.invoices enable row level security;

create policy if not exists "billing_admin_all_payments"
on public.booking_payments
for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy if not exists "billing_admin_all_charges"
on public.booking_charges
for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy if not exists "billing_admin_all_invoices"
on public.invoices
for all
using (public.is_admin_user())
with check (public.is_admin_user());

revoke all on public.booking_payments from anon;
revoke all on public.booking_charges from anon;
revoke all on public.invoices from anon;

commit;
