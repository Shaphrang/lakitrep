-- ============================================================
-- LA KI TREP RESORT - SUPABASE PATCH V3
-- Built against the user's current working schema
-- Adds:
-- 1) booking_contact_logs
-- 2) simple overlap prevention for confirmed bookings only
-- 3) admin dashboard helper views
-- ============================================================

begin;

-- ============================================================
-- BOOKING CONTACT LOGS
-- ============================================================
create table if not exists public.booking_contact_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  contact_method text not null,
  contact_summary text,
  contacted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_booking_contact_logs_booking_id
  on public.booking_contact_logs(booking_id);
create index if not exists idx_booking_contact_logs_contacted_by
  on public.booking_contact_logs(contacted_by);
create index if not exists idx_booking_contact_logs_created_at
  on public.booking_contact_logs(created_at desc);

alter table public.booking_contact_logs enable row level security;

drop policy if exists "admin_all_booking_contact_logs" on public.booking_contact_logs;
create policy "admin_all_booking_contact_logs"
  on public.booking_contact_logs
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- SIMPLE OVERLAP PREVENTION
-- Rule: only CONFIRMED bookings block other CONFIRMED bookings
-- No holds, no temporary locks, no complicated availability engine
-- ============================================================

create or replace function public.check_confirmed_booking_overlap_for_cottage(
  p_booking_id uuid,
  p_cottage_id uuid
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.bookings b_current
    join public.booking_cottages bc_current
      on bc_current.booking_id = b_current.id
    join public.bookings b_other
      on b_other.id <> b_current.id
    join public.booking_cottages bc_other
      on bc_other.booking_id = b_other.id
     and bc_other.cottage_id = bc_current.cottage_id
    where b_current.id = p_booking_id
      and bc_current.cottage_id = p_cottage_id
      and b_current.status = 'confirmed'
      and b_other.status = 'confirmed'
      and b_current.check_in_date < b_other.check_out_date
      and b_current.check_out_date > b_other.check_in_date
  );
$$;

create or replace function public.enforce_no_overlap_when_confirming_booking()
returns trigger
language plpgsql
as $$
declare
  v_conflict_exists boolean;
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    select exists (
      select 1
      from public.booking_cottages bc
      where bc.booking_id = new.id
        and public.check_confirmed_booking_overlap_for_cottage(new.id, bc.cottage_id)
    ) into v_conflict_exists;

    if v_conflict_exists then
      raise exception 'Cannot confirm booking because the selected cottage is already booked for overlapping dates';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_no_overlap_when_confirming_booking on public.bookings;
create trigger trg_enforce_no_overlap_when_confirming_booking
before update on public.bookings
for each row
execute function public.enforce_no_overlap_when_confirming_booking();

create or replace function public.enforce_no_overlap_when_editing_confirmed_booking_cottage()
returns trigger
language plpgsql
as $$
declare
  v_booking_status public.booking_status;
  v_conflict_exists boolean;
begin
  select status into v_booking_status
  from public.bookings
  where id = new.booking_id;

  if v_booking_status = 'confirmed' then
    select public.check_confirmed_booking_overlap_for_cottage(new.booking_id, new.cottage_id)
    into v_conflict_exists;

    if v_conflict_exists then
      raise exception 'This cottage already has a confirmed booking for overlapping dates';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_no_overlap_when_editing_confirmed_booking_cottage on public.booking_cottages;
create trigger trg_enforce_no_overlap_when_editing_confirmed_booking_cottage
before insert or update on public.booking_cottages
for each row
execute function public.enforce_no_overlap_when_editing_confirmed_booking_cottage();

-- ============================================================
-- ADMIN DASHBOARD VIEWS
-- ============================================================

create or replace view public.booking_list_view as
select
  b.id,
  b.booking_code,
  b.status,
  b.payment_method,
  b.payment_status,
  b.source,
  b.check_in_date,
  b.check_out_date,
  b.adults,
  b.children,
  b.infants,
  g.full_name as guest_name,
  g.phone as guest_phone,
  g.whatsapp_number as guest_whatsapp,
  g.email as guest_email,
  bc.cottage_id,
  bc.cottage_name_snapshot as cottage_name,
  bc.category_snapshot as cottage_category,
  b.requested_at,
  b.confirmed_at,
  b.cancelled_at,
  b.completed_at,
  b.created_at,
  b.updated_at
from public.bookings b
join public.guests g on g.id = b.guest_id
left join public.booking_cottages bc on bc.booking_id = b.id
order by b.created_at desc;

create or replace view public.pending_bookings_view as
select *
from public.booking_list_view
where status = 'pending'
order by created_at desc;

create or replace view public.confirmed_bookings_view as
select *
from public.booking_list_view
where status = 'confirmed'
order by check_in_date asc, created_at desc;

create or replace view public.upcoming_arrivals_view as
select *
from public.booking_list_view
where status = 'confirmed'
  and check_in_date >= current_date
order by check_in_date asc, created_at asc;

commit;
