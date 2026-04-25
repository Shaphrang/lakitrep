-- RLS Strategy for Resort Management (Supabase)
-- NOTE: Apply only if RLS is already enabled in your deployment.

begin;

alter table public.booking_payments enable row level security;
alter table public.booking_charges enable row level security;
alter table public.invoices enable row level security;
alter table public.cottage_blocks enable row level security;

-- Admin full access
create policy if not exists "admin_all_booking_payments"
on public.booking_payments
for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy if not exists "admin_all_booking_charges"
on public.booking_charges
for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy if not exists "admin_all_invoices"
on public.invoices
for all
using (public.is_admin_user())
with check (public.is_admin_user());

create policy if not exists "admin_all_cottage_blocks"
on public.cottage_blocks
for all
using (public.is_admin_user())
with check (public.is_admin_user());

-- Public booking form should not directly read billing tables.
revoke all on public.booking_payments from anon;
revoke all on public.booking_charges from anon;
revoke all on public.invoices from anon;
revoke all on public.cottage_blocks from anon;

commit;
