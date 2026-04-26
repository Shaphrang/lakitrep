begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type public.booking_status as enum (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum (
    'pay_on_arrival'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'unpaid',
    'paid_on_arrival',
    'waived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cottage_status as enum (
    'active',
    'inactive',
    'maintenance'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- COMMON FUNCTION
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- ADMIN ACCESS
-- Simple admin table mapped to auth.users
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admin_users_updated_at on public.admin_users;
create trigger trg_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = auth.uid()
      and au.is_active = true
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

-- ============================================================
-- CORE TABLES
-- ============================================================
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  short_intro text,
  full_description text,
  property_type text,
  address_line text,
  district text,
  state text default 'Meghalaya',
  country text default 'India',
  postal_code text,
  phone_number text,
  whatsapp_number text,
  email citext,
  instagram_handle text,
  instagram_url text,
  facebook_url text,
  maps_note text,
  booking_note text,
  check_in_time time,
  check_out_time time,
  cover_image text,
  gallery_images text[] not null default '{}'::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create table if not exists public.cottages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,

  code text not null,
  name text not null,
  slug text not null,
  category text not null,

  short_description text,
  full_description text,
  bed_type text,

  max_adults integer not null default 2 check (max_adults >= 1),
  max_children integer not null default 0 check (max_children >= 0),
  max_infants integer not null default 0 check (max_infants >= 0),
  max_total_guests integer not null check (max_total_guests >= 1),

  room_count integer not null default 1 check (room_count >= 1),

  has_ac boolean not null default false,
  breakfast_included boolean not null default true,
  extra_bed_allowed boolean not null default false,

  is_combined_unit boolean not null default false,
  component_codes text[] not null default '{}'::text[],

  amenities jsonb not null default '[]'::jsonb
    check (jsonb_typeof(amenities) = 'array'),

  weekday_price numeric(10,2) not null default 0 check (weekday_price >= 0),
  weekend_price numeric(10,2) not null default 0 check (weekend_price >= 0),
  child_price numeric(10,2) not null default 0 check (child_price >= 0),
  extra_bed_price numeric(10,2) not null default 0 check (extra_bed_price >= 0),
  pricing_note text,

  cover_image text,
  gallery_images text[] not null default '{}'::text[],

  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_bookable boolean not null default true,
  status public.cottage_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (property_id, code),
  unique (property_id, slug)
);

drop trigger if exists trg_cottages_updated_at on public.cottages;
create trigger trg_cottages_updated_at
before update on public.cottages
for each row execute function public.set_updated_at();

create table if not exists public.attractions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  description text,
  distance_text text,
  cover_image text,
  gallery_images text[] not null default '{}'::text[],
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, name)
);

drop trigger if exists trg_attractions_updated_at on public.attractions;
create trigger trg_attractions_updated_at
before update on public.attractions
for each row execute function public.set_updated_at();

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  policy_key text not null,
  title text not null,
  content text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, policy_key)
);

drop trigger if exists trg_policies_updated_at on public.policies;
create trigger trg_policies_updated_at
before update on public.policies
for each row execute function public.set_updated_at();

create table if not exists public.seo (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  page_key text not null,
  meta_title text,
  meta_description text,
  meta_keywords text[] not null default '{}'::text[],
  og_image text,
  canonical_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, page_key)
);

drop trigger if exists trg_seo_updated_at on public.seo;
create trigger trg_seo_updated_at
before update on public.seo
for each row execute function public.set_updated_at();

create table if not exists public.booking_guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp_number text,
  email citext,
  city text,
  state text,
  country text default 'India',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_booking_guests_updated_at on public.booking_guests;
create trigger trg_booking_guests_updated_at
before update on public.booking_guests
for each row execute function public.set_updated_at();

create sequence if not exists public.booking_code_seq start 1;

create or replace function public.generate_booking_code()
returns text
language plpgsql
as $$
declare
  v_next bigint;
begin
  v_next := nextval('public.booking_code_seq');
  return 'LKT-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(v_next::text, 6, '0');
end;
$$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete restrict,
  booking_guest_id uuid not null references public.booking_guests(id) on delete restrict,
  cottage_id uuid not null references public.cottages(id) on delete restrict,

  booking_code text not null unique default public.generate_booking_code(),

  status public.booking_status not null default 'pending',
  payment_method public.payment_method not null default 'pay_on_arrival',
  payment_status public.payment_status not null default 'unpaid',
  source text not null default 'website',

  check_in_date date not null,
  check_out_date date not null,

  adults integer not null default 1 check (adults >= 1),
  children integer not null default 0 check (children >= 0),
  infants integer not null default 0 check (infants >= 0),

  special_requests text,
  admin_notes text,

  nights integer not null default 1 check (nights >= 1),
  base_amount numeric(10,2) not null default 0 check (base_amount >= 0),
  child_amount numeric(10,2) not null default 0 check (child_amount >= 0),
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (check_out_date > check_in_date)
);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

-- ============================================================
-- SIMPLE PUBLIC BOOKING FUNCTION
-- public website creates guest + booking together
-- ============================================================
create or replace function public.create_booking_request(
  p_property_slug text,
  p_cottage_slug text,
  p_full_name text,
  p_phone text,
  p_whatsapp_number text,
  p_email text,
  p_city text,
  p_state text,
  p_country text,
  p_check_in_date date,
  p_check_out_date date,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_special_requests text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties;
  v_cottage public.cottages;
  v_conflict_cottage_ids uuid[];
  v_guest_id uuid;
  v_booking_id uuid;
  v_total_guests integer;
  v_nights integer;
  v_weekday_nights integer := 0;
  v_weekend_nights integer := 0;
  v_base_amount numeric(10,2) := 0;
  v_child_amount numeric(10,2) := 0;
  v_total_amount numeric(10,2) := 0;
  v_date date;
  i integer;
begin
  if p_check_in_date is null or p_check_out_date is null then
    raise exception 'Check-in and check-out are required';
  end if;

  if p_check_out_date <= p_check_in_date then
    raise exception 'Check-out date must be after check-in date';
  end if;

  if p_check_in_date < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;

  if coalesce(p_adults, 0) < 1 then
    raise exception 'At least one adult is required';
  end if;

  select *
  into v_property
  from public.properties
  where slug = p_property_slug
    and is_active = true
  limit 1;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  select *
  into v_cottage
  from public.cottages
  where property_id = v_property.id
    and slug = p_cottage_slug
    and status = 'active'
    and is_bookable = true
  limit 1;

  if v_cottage.id is null then
    raise exception 'Cottage not found or not bookable';
  end if;

  v_total_guests := coalesce(p_adults, 0) + coalesce(p_children, 0) + coalesce(p_infants, 0);

  if coalesce(p_adults, 0) > v_cottage.max_adults then
    raise exception 'Adult count exceeds cottage limit';
  end if;

  if coalesce(p_children, 0) > v_cottage.max_children then
    raise exception 'Children count exceeds cottage limit';
  end if;

  if coalesce(p_infants, 0) > v_cottage.max_infants then
    raise exception 'Infant count exceeds cottage limit';
  end if;

  if v_total_guests > v_cottage.max_total_guests then
    raise exception 'Total guest count exceeds cottage limit';
  end if;

  with selected_and_related_codes as (
    select distinct code
    from public.cottages c
    where c.id = v_cottage.id
      and c.status = 'active'
      and c.is_bookable = true
    union
    select distinct unnest(component_codes)
    from public.cottages c
    where c.id = v_cottage.id
      and c.status = 'active'
      and c.is_bookable = true
    union
    select distinct c.code
    from public.cottages c
    where c.status = 'active'
      and c.is_bookable = true
      and exists (
        select 1
        from public.cottages selected
        where selected.id = v_cottage.id
          and selected.code = any(c.component_codes)
      )
  )
  select array_agg(distinct c.id)
  into v_conflict_cottage_ids
  from public.cottages c
  where c.status = 'active'
    and c.is_bookable = true
    and (
      c.code in (select code from selected_and_related_codes)
      or exists (
        select 1
        from unnest(c.component_codes) as component_code
        where component_code in (select code from selected_and_related_codes)
      )
    );

  if coalesce(array_length(v_conflict_cottage_ids, 1), 0) = 0 then
    v_conflict_cottage_ids := array[v_cottage.id];
  end if;

  if exists (
    select 1
    from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < p_check_out_date
      and b.check_out_date > p_check_in_date
  ) then
    raise exception 'Selected dates are unavailable for confirmed bookings';
  end if;

  if exists (
    select 1
    from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date < p_check_out_date
      and cb.end_date > p_check_in_date
  ) then
    raise exception 'Selected dates are unavailable due to maintenance block';
  end if;

  v_nights := (p_check_out_date - p_check_in_date);

  for i in 0..(v_nights - 1) loop
    v_date := p_check_in_date + i;
    if extract(dow from v_date) in (0, 6) then
      v_weekend_nights := v_weekend_nights + 1;
    else
      v_weekday_nights := v_weekday_nights + 1;
    end if;
  end loop;

  v_base_amount := (v_weekday_nights * v_cottage.weekday_price) + (v_weekend_nights * v_cottage.weekend_price);
  v_child_amount := coalesce(p_children, 0) * v_cottage.child_price * v_nights;
  v_total_amount := v_base_amount + v_child_amount;

  insert into public.booking_guests (
    full_name,
    phone,
    whatsapp_number,
    email,
    city,
    state,
    country
  )
  values (
    trim(p_full_name),
    trim(p_phone),
    nullif(trim(coalesce(p_whatsapp_number, '')), ''),
    nullif(trim(coalesce(p_email, '')), '')::citext,
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_state, '')), ''),
    coalesce(nullif(trim(coalesce(p_country, '')), ''), 'India')
  )
  returning id into v_guest_id;

  insert into public.bookings (
    property_id,
    booking_guest_id,
    cottage_id,
    check_in_date,
    check_out_date,
    adults,
    children,
    infants,
    special_requests,
    nights,
    base_amount,
    child_amount,
    total_amount
  )
  values (
    v_property.id,
    v_guest_id,
    v_cottage.id,
    p_check_in_date,
    p_check_out_date,
    p_adults,
    coalesce(p_children, 0),
    coalesce(p_infants, 0),
    nullif(trim(coalesce(p_special_requests, '')), ''),
    v_nights,
    v_base_amount,
    v_child_amount,
    v_total_amount
  )
  returning id into v_booking_id;

  return jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', (select booking_code from public.bookings where id = v_booking_id),
    'status', 'pending',
    'nights', v_nights,
    'total_amount', v_total_amount,
    'message', 'Booking request submitted successfully'
  );
end;
$$;

revoke all on function public.create_booking_request(
  text, text, text, text, text, text, text, text, text, date, date, integer, integer, integer, text
) from public;

grant execute on function public.create_booking_request(
  text, text, text, text, text, text, text, text, text, date, date, integer, integer, integer, text
) to anon, authenticated;


-- ============================================================
-- PUBLIC AVAILABILITY FUNCTION (READ-ONLY)
-- ============================================================
create or replace function public.get_cottage_unavailability(
  p_property_slug text,
  p_cottage_slug text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property_id uuid;
  v_cottage_id uuid;
  v_conflict_cottage_ids uuid[];
  v_blocked_ranges jsonb := '[]'::jsonb;
  v_unavailable_dates jsonb := '[]'::jsonb;
begin
  select id
  into v_property_id
  from public.properties
  where slug = p_property_slug
    and is_active = true
  limit 1;

  if v_property_id is null then
    raise exception 'Property not found';
  end if;

  select id
  into v_cottage_id
  from public.cottages
  where property_id = v_property_id
    and slug = p_cottage_slug
    and status = 'active'
    and is_bookable = true
  limit 1;

  if v_cottage_id is null then
    raise exception 'Cottage not found';
  end if;

  with selected_and_related_codes as (
    select distinct code
    from public.cottages c
    where c.id = v_cottage_id
      and c.status = 'active'
      and c.is_bookable = true
    union
    select distinct unnest(component_codes)
    from public.cottages c
    where c.id = v_cottage_id
      and c.status = 'active'
      and c.is_bookable = true
    union
    select distinct c.code
    from public.cottages c
    where c.status = 'active'
      and c.is_bookable = true
      and exists (
        select 1
        from public.cottages selected
        where selected.id = v_cottage_id
          and selected.code = any(c.component_codes)
      )
  )
  select array_agg(distinct c.id)
  into v_conflict_cottage_ids
  from public.cottages c
  where c.status = 'active'
    and c.is_bookable = true
    and (
      c.code in (select code from selected_and_related_codes)
      or exists (
        select 1
        from unnest(c.component_codes) as component_code
        where component_code in (select code from selected_and_related_codes)
      )
    );

  if coalesce(array_length(v_conflict_cottage_ids, 1), 0) = 0 then
    v_conflict_cottage_ids := array[v_cottage_id];
  end if;

  -- Pending requests are intentionally excluded to avoid soft-locking inventory.
  with blocked as (
    select b.check_in_date, b.check_out_date
    from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < b.check_out_date
    union all
    select cb.start_date as check_in_date, (cb.end_date + interval '1 day')::date as check_out_date
    from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date <= cb.end_date
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'checkInDate', check_in_date::text,
        'checkOutDate', check_out_date::text
      )
      order by check_in_date
    ),
    '[]'::jsonb
  )
  into v_blocked_ranges
  from blocked;

  -- Checkout date is not blocked; only occupied nights are returned.
  with blocked as (
    select b.check_in_date, b.check_out_date
    from public.bookings b
    where b.cottage_id = any(v_conflict_cottage_ids)
      and b.status in ('confirmed', 'advance_paid', 'checked_in')
      and b.check_in_date < b.check_out_date
    union all
    select cb.start_date as check_in_date, (cb.end_date + interval '1 day')::date as check_out_date
    from public.cottage_blocks cb
    where cb.cottage_id = any(v_conflict_cottage_ids)
      and cb.start_date <= cb.end_date
  ),
  nights as (
    select generate_series(check_in_date, check_out_date - interval '1 day', interval '1 day')::date as blocked_date
    from blocked
  )
  select coalesce(jsonb_agg(distinct blocked_date::text), '[]'::jsonb)
  into v_unavailable_dates
  from nights;

  return jsonb_build_object(
    'unavailableDates', v_unavailable_dates,
    'blockedRanges', v_blocked_ranges
  );
end;
$$;

revoke all on function public.get_cottage_unavailability(text, text) from public;
grant execute on function public.get_cottage_unavailability(text, text) to anon, authenticated;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_cottages_property_id on public.cottages(property_id);
create index if not exists idx_cottages_status on public.cottages(status);
create index if not exists idx_attractions_property_id on public.attractions(property_id);
create index if not exists idx_policies_property_id on public.policies(property_id);
create index if not exists idx_seo_property_id on public.seo(property_id);
create index if not exists idx_booking_guests_phone on public.booking_guests(phone);
create index if not exists idx_booking_guests_email on public.booking_guests(email);
create index if not exists idx_bookings_property_id on public.bookings(property_id);
create index if not exists idx_bookings_guest_id on public.bookings(booking_guest_id);
create index if not exists idx_bookings_cottage_id on public.bookings(cottage_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_check_in_date on public.bookings(check_in_date);
create index if not exists idx_bookings_check_out_date on public.bookings(check_out_date);

-- ============================================================
-- RLS
-- ============================================================
alter table public.admin_users enable row level security;
alter table public.properties enable row level security;
alter table public.cottages enable row level security;
alter table public.attractions enable row level security;
alter table public.policies enable row level security;
alter table public.seo enable row level security;
alter table public.booking_guests enable row level security;
alter table public.bookings enable row level security;

-- admin_users
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read"
on public.admin_users
for select
using (id = auth.uid());

drop policy if exists "admin_users_admin_all" on public.admin_users;
create policy "admin_users_admin_all"
on public.admin_users
for all
using (public.is_admin_user())
with check (public.is_admin_user());

-- public read
drop policy if exists "public_read_properties" on public.properties;
create policy "public_read_properties"
on public.properties
for select
using (is_active = true);

drop policy if exists "public_read_cottages" on public.cottages;
create policy "public_read_cottages"
on public.cottages
for select
using (status = 'active' and is_bookable = true);

drop policy if exists "public_read_attractions" on public.attractions;
create policy "public_read_attractions"
on public.attractions
for select
using (is_active = true);

drop policy if exists "public_read_policies" on public.policies;
create policy "public_read_policies"
on public.policies
for select
using (is_active = true);

drop policy if exists "public_read_seo" on public.seo;
create policy "public_read_seo"
on public.seo
for select
using (is_active = true);

-- admin full access
drop policy if exists "admin_all_properties" on public.properties;
create policy "admin_all_properties"
on public.properties
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_cottages" on public.cottages;
create policy "admin_all_cottages"
on public.cottages
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_attractions" on public.attractions;
create policy "admin_all_attractions"
on public.attractions
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_policies" on public.policies;
create policy "admin_all_policies"
on public.policies
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_seo" on public.seo;
create policy "admin_all_seo"
on public.seo
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_booking_guests" on public.booking_guests;
create policy "admin_all_booking_guests"
on public.booking_guests
for all
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admin_all_bookings" on public.bookings;
create policy "admin_all_bookings"
on public.bookings
for all
using (public.is_admin_user())
with check (public.is_admin_user());

commit;
