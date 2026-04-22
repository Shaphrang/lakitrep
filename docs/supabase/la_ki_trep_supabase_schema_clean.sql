
-- ============================================================
-- LA KI TREP RESORT - SUPABASE SQL SCHEMA (CLEAN FIXED VERSION)
-- Production-safe, intentionally simple
-- Scope: website + cottages + booking requests + admin dashboard
-- Payment model: PAY ON ARRIVAL
-- No complicated hold/block/availability engine
-- ============================================================

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type public.booking_status as enum ('pending','confirmed','cancelled','completed','rejected','no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('pay_on_arrival');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid','paid_on_arrival','partially_paid','waived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cottage_status as enum ('active','inactive','maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inquiry_status as enum ('new','contacted','closed','spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_inquiry_status as enum ('new','contacted','quoted','confirmed','cancelled','closed');
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
  gallery_images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admin_profiles_updated_at on public.admin_profiles;
create trigger trg_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_admin_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.is_active = true
  );
$$;

create table if not exists public.cottages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  code text not null unique,
  name text not null,
  slug text not null unique,
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
  component_codes text[] not null default '{}',
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_bookable boolean not null default true,
  status public.cottage_status not null default 'active',
  cover_image text,
  gallery_images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_cottages_updated_at on public.cottages;
create trigger trg_cottages_updated_at
before update on public.cottages
for each row execute function public.set_updated_at();

create table if not exists public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_amenities_updated_at on public.amenities;
create trigger trg_amenities_updated_at
before update on public.amenities
for each row execute function public.set_updated_at();

create table if not exists public.cottage_amenities (
  cottage_id uuid not null references public.cottages(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (cottage_id, amenity_id)
);

create table if not exists public.cottage_prices (
  id uuid primary key default gen_random_uuid(),
  cottage_id uuid not null unique references public.cottages(id) on delete cascade,
  weekday_rate numeric(10,2) not null check (weekday_rate >= 0),
  weekend_rate numeric(10,2) not null check (weekend_rate >= 0),
  child_rate numeric(10,2) default 0 check (child_rate >= 0),
  extra_bed_rate numeric(10,2) default 0 check (extra_bed_rate >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_cottage_prices_updated_at on public.cottage_prices;
create trigger trg_cottage_prices_updated_at
before update on public.cottage_prices
for each row execute function public.set_updated_at();

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  title text,
  category text,
  storage_path text not null,
  alt_text text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.attractions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  description text,
  distance_text text,
  cover_image text,
  gallery_images text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_attractions_updated_at on public.attractions;
create trigger trg_attractions_updated_at
before update on public.attractions
for each row execute function public.set_updated_at();

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  policy_key text not null unique,
  title text not null,
  content text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_policies_updated_at on public.policies;
create trigger trg_policies_updated_at
before update on public.policies
for each row execute function public.set_updated_at();

create table if not exists public.guests (
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

drop trigger if exists trg_guests_updated_at on public.guests;
create trigger trg_guests_updated_at
before update on public.guests
for each row execute function public.set_updated_at();

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete restrict,
  booking_code text not null unique,
  guest_id uuid not null references public.guests(id) on delete restrict,
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
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out_date > check_in_date)
);

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create or replace function public.generate_booking_code()
returns text
language plpgsql
as $$
declare
  next_no integer;
  code text;
begin
  select coalesce(count(*), 0) + 1
  into next_no
  from public.bookings
  where created_at::date = current_date;

  code := 'LKT-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(next_no::text, 3, '0');
  return code;
end;
$$;

create table if not exists public.booking_cottages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  cottage_id uuid not null references public.cottages(id) on delete restrict,
  cottage_name_snapshot text not null,
  category_snapshot text,
  weekday_rate_snapshot numeric(10,2),
  weekend_rate_snapshot numeric(10,2),
  nights integer not null check (nights >= 1),
  created_at timestamptz not null default now(),
  unique (booking_id, cottage_id)
);

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_status public.booking_status,
  new_status public.booking_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.log_booking_status_change()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    insert into public.booking_status_history (
      booking_id, old_status, new_status, changed_by, notes
    ) values (
      new.id, old.status, new.status, auth.uid(), null
    );

    if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
      new.confirmed_at = coalesce(new.confirmed_at, now());
    end if;

    if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
      new.cancelled_at = coalesce(new.cancelled_at, now());
    end if;

    if new.status = 'completed' and old.status is distinct from 'completed' then
      new.completed_at = coalesce(new.completed_at, now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_booking_status_history on public.bookings;
create trigger trg_booking_status_history
before update on public.bookings
for each row execute function public.log_booking_status_change();

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  full_name text not null,
  phone text,
  email citext,
  message text not null,
  preferred_contact_method text,
  status public.inquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

create table if not exists public.event_inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email citext,
  event_type text,
  event_date date,
  guest_count integer check (guest_count is null or guest_count >= 1),
  stay_required boolean not null default false,
  full_property_required boolean not null default false,
  message text,
  status public.event_inquiry_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_event_inquiries_updated_at on public.event_inquiries;
create trigger trg_event_inquiries_updated_at
before update on public.event_inquiries
for each row execute function public.set_updated_at();

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_cottages_property_id on public.cottages(property_id);
create index if not exists idx_cottages_status on public.cottages(status);
create index if not exists idx_gallery_images_property_id on public.gallery_images(property_id);
create index if not exists idx_attractions_property_id on public.attractions(property_id);
create index if not exists idx_policies_property_id on public.policies(property_id);
create index if not exists idx_guests_phone on public.guests(phone);
create index if not exists idx_guests_email on public.guests(email);
create index if not exists idx_bookings_guest_id on public.bookings(guest_id);
create index if not exists idx_bookings_property_id on public.bookings(property_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_check_in_date on public.bookings(check_in_date);
create index if not exists idx_bookings_check_out_date on public.bookings(check_out_date);
create index if not exists idx_booking_cottages_booking_id on public.booking_cottages(booking_id);
create index if not exists idx_booking_cottages_cottage_id on public.booking_cottages(cottage_id);
create index if not exists idx_inquiries_property_id on public.inquiries(property_id);
create index if not exists idx_event_inquiries_property_id on public.event_inquiries(property_id);

-- ============================================================
-- PUBLIC BOOKING RPC
-- ============================================================
create or replace function public.create_booking_request(
  p_property_slug text,
  p_cottage_slug text,
  p_full_name text,
  p_phone text,
  p_whatsapp_number text,
  p_email text,
  p_check_in_date date,
  p_check_out_date date,
  p_adults integer,
  p_children integer,
  p_infants integer,
  p_special_requests text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties;
  v_cottage public.cottages;
  v_price public.cottage_prices;
  v_guest_id uuid;
  v_booking_id uuid;
  v_nights integer;
  v_guest_total integer;
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

  select * into v_property
  from public.properties
  where slug = p_property_slug and is_active = true
  limit 1;

  if v_property.id is null then
    raise exception 'Property not found';
  end if;

  select * into v_cottage
  from public.cottages
  where slug = p_cottage_slug
    and property_id = v_property.id
    and is_bookable = true
    and status = 'active'
  limit 1;

  if v_cottage.id is null then
    raise exception 'Cottage not found or not bookable';
  end if;

  v_guest_total := coalesce(p_adults, 0) + coalesce(p_children, 0) + coalesce(p_infants, 0);

  if coalesce(p_adults, 0) > v_cottage.max_adults then
    raise exception 'Adult count exceeds cottage limit';
  end if;

  if coalesce(p_children, 0) > v_cottage.max_children then
    raise exception 'Children count exceeds cottage limit';
  end if;

  if coalesce(p_infants, 0) > v_cottage.max_infants then
    raise exception 'Infant count exceeds cottage limit';
  end if;

  if v_guest_total > v_cottage.max_total_guests then
    raise exception 'Total guest count exceeds cottage limit';
  end if;

  select * into v_price
  from public.cottage_prices
  where cottage_id = v_cottage.id
  limit 1;

  insert into public.guests (full_name, phone, whatsapp_number, email)
  values (
    trim(p_full_name),
    trim(p_phone),
    nullif(trim(coalesce(p_whatsapp_number, '')), ''),
    nullif(trim(coalesce(p_email, '')), '')::citext
  )
  returning id into v_guest_id;

  insert into public.bookings (
    property_id, booking_code, guest_id, status, payment_method, payment_status, source,
    check_in_date, check_out_date, adults, children, infants, special_requests
  ) values (
    v_property.id,
    public.generate_booking_code(),
    v_guest_id,
    'pending',
    'pay_on_arrival',
    'unpaid',
    'website',
    p_check_in_date,
    p_check_out_date,
    p_adults,
    p_children,
    p_infants,
    p_special_requests
  )
  returning id into v_booking_id;

  v_nights := (p_check_out_date - p_check_in_date);

  insert into public.booking_cottages (
    booking_id, cottage_id, cottage_name_snapshot, category_snapshot,
    weekday_rate_snapshot, weekend_rate_snapshot, nights
  ) values (
    v_booking_id, v_cottage.id, v_cottage.name, v_cottage.category,
    coalesce(v_price.weekday_rate, 0), coalesce(v_price.weekend_rate, 0), v_nights
  );

  insert into public.booking_status_history (
    booking_id, old_status, new_status, changed_by, notes
  ) values (
    v_booking_id, null, 'pending', null, 'Booking request submitted from website'
  );

  return jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'booking_code', (select booking_code from public.bookings where id = v_booking_id),
    'status', 'pending',
    'message', 'Booking request submitted successfully'
  );
end;
$$;

grant execute on function public.create_booking_request(
  text, text, text, text, text, text, date, date, integer, integer, integer, text
) to anon, authenticated;

-- ============================================================
-- VIEWS
-- ============================================================
create or replace view public.v_public_cottages as
select
  c.id,
  c.property_id,
  c.code,
  c.name,
  c.slug,
  c.category,
  c.short_description,
  c.full_description,
  c.bed_type,
  c.max_adults,
  c.max_children,
  c.max_infants,
  c.max_total_guests,
  c.room_count,
  c.has_ac,
  c.breakfast_included,
  c.extra_bed_allowed,
  c.is_combined_unit,
  c.component_codes,
  c.sort_order,
  c.is_featured,
  cp.weekday_rate,
  cp.weekend_rate,
  cp.child_rate,
  cp.extra_bed_rate,
  c.cover_image,
  c.gallery_images
from public.cottages c
left join public.cottage_prices cp on cp.cottage_id = c.id
where c.status = 'active' and c.is_bookable = true;

create or replace view public.v_admin_booking_list as
select
  b.id,
  b.booking_code,
  b.status,
  b.payment_method,
  b.payment_status,
  b.check_in_date,
  b.check_out_date,
  b.adults,
  b.children,
  b.infants,
  g.full_name as guest_name,
  g.phone as guest_phone,
  g.email as guest_email,
  bc.cottage_name_snapshot as cottage_name,
  b.created_at,
  b.requested_at,
  b.confirmed_at,
  b.cancelled_at,
  b.completed_at
from public.bookings b
join public.guests g on g.id = b.guest_id
left join public.booking_cottages bc on bc.booking_id = b.id;

-- ============================================================
-- RLS
-- ============================================================
alter table public.properties enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.cottages enable row level security;
alter table public.amenities enable row level security;
alter table public.cottage_amenities enable row level security;
alter table public.cottage_prices enable row level security;
alter table public.gallery_images enable row level security;
alter table public.attractions enable row level security;
alter table public.policies enable row level security;
alter table public.guests enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_cottages enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.inquiries enable row level security;
alter table public.event_inquiries enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "public_read_properties" on public.properties;
create policy "public_read_properties" on public.properties for select using (is_active = true);

drop policy if exists "public_read_cottages" on public.cottages;
create policy "public_read_cottages" on public.cottages for select using (status = 'active' and is_bookable = true);

drop policy if exists "public_read_amenities" on public.amenities;
create policy "public_read_amenities" on public.amenities for select using (is_active = true);

drop policy if exists "public_read_cottage_amenities" on public.cottage_amenities;
create policy "public_read_cottage_amenities" on public.cottage_amenities for select using (true);

drop policy if exists "public_read_cottage_prices" on public.cottage_prices;
create policy "public_read_cottage_prices" on public.cottage_prices for select using (true);

drop policy if exists "public_read_gallery_images" on public.gallery_images;
create policy "public_read_gallery_images" on public.gallery_images for select using (is_active = true);

drop policy if exists "public_read_attractions" on public.attractions;
create policy "public_read_attractions" on public.attractions for select using (is_active = true);

drop policy if exists "public_read_policies" on public.policies;
create policy "public_read_policies" on public.policies for select using (is_active = true);

drop policy if exists "public_read_site_settings" on public.site_settings;
create policy "public_read_site_settings" on public.site_settings for select using (true);

drop policy if exists "public_insert_inquiries" on public.inquiries;
create policy "public_insert_inquiries" on public.inquiries for insert with check (true);

drop policy if exists "public_insert_event_inquiries" on public.event_inquiries;
create policy "public_insert_event_inquiries" on public.event_inquiries for insert with check (true);

drop policy if exists "admin_all_properties" on public.properties;
create policy "admin_all_properties" on public.properties for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_site_settings" on public.site_settings;
create policy "admin_all_site_settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_admin_profiles" on public.admin_profiles;
create policy "admin_all_admin_profiles" on public.admin_profiles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_cottages" on public.cottages;
create policy "admin_all_cottages" on public.cottages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_amenities" on public.amenities;
create policy "admin_all_amenities" on public.amenities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_cottage_amenities" on public.cottage_amenities;
create policy "admin_all_cottage_amenities" on public.cottage_amenities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_cottage_prices" on public.cottage_prices;
create policy "admin_all_cottage_prices" on public.cottage_prices for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_gallery_images" on public.gallery_images;
create policy "admin_all_gallery_images" on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_attractions" on public.attractions;
create policy "admin_all_attractions" on public.attractions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_policies" on public.policies;
create policy "admin_all_policies" on public.policies for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_guests" on public.guests;
create policy "admin_all_guests" on public.guests for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_bookings" on public.bookings;
create policy "admin_all_bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_booking_cottages" on public.booking_cottages;
create policy "admin_all_booking_cottages" on public.booking_cottages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_booking_status_history" on public.booking_status_history;
create policy "admin_all_booking_status_history" on public.booking_status_history for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_inquiries" on public.inquiries;
create policy "admin_all_inquiries" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_event_inquiries" on public.event_inquiries;
create policy "admin_all_event_inquiries" on public.event_inquiries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all_activity_logs" on public.activity_logs;
create policy "admin_all_activity_logs" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- SEED DATA
-- Pricing note: the client document had Cottage 4 / Cottage 5 pricing
-- mismatch in two sections. This seed uses the ROOM DETAILS section:
-- Cottage 4 = 5000 / 6000
-- Cottage 5 = 4000 / 5000
-- Confirm before launch.
-- ============================================================
insert into public.properties (
  name, slug, tagline, short_intro, full_description, property_type,
  address_line, district, state, country, phone_number, whatsapp_number,
  instagram_handle, instagram_url, maps_note, booking_note,
  check_in_time, check_out_time, is_active
)
values (
  'La Ki Trep Resort',
  'la-ki-trep-resort',
  'A quiet boutique resort in Meghalaya',
  'La Ki Trep Resort is an exclusive boutique B&B in Umran, Ri Bhoi, tucked into the hills and surrounded by trees. With only five cottages, a swimming pool, outdoor spaces and an in-house restaurant, it is designed for quiet getaways, slow mornings, long conversations and private time with family or friends.',
  'La Ki Trep Resort is a private cottage stay set on a 4-acre property in Umran, Ri Bhoi District, Meghalaya. The property has only five cottages and is designed to offer a calm, private and peaceful experience close to Umiam Lake while remaining accessible from Shillong and Guwahati.',
  'Boutique Resort',
  'Umran, Ri Bhoi District, Meghalaya',
  'Ri Bhoi District',
  'Meghalaya',
  'India',
  '6009044450',
  '6009044450',
  '@lakitrep',
  'https://instagram.com/lakitrep',
  'Precise location / Google Maps pin shared only after booking confirmation',
  'Pre-booking required. Walk-ins not permitted. Bookings handled directly via WhatsApp / Instagram DM.',
  '14:00',
  '11:00',
  true
)
on conflict (slug) do update
set
  name = excluded.name,
  tagline = excluded.tagline,
  short_intro = excluded.short_intro,
  full_description = excluded.full_description,
  property_type = excluded.property_type,
  address_line = excluded.address_line,
  district = excluded.district,
  state = excluded.state,
  country = excluded.country,
  phone_number = excluded.phone_number,
  whatsapp_number = excluded.whatsapp_number,
  instagram_handle = excluded.instagram_handle,
  instagram_url = excluded.instagram_url,
  maps_note = excluded.maps_note,
  booking_note = excluded.booking_note,
  check_in_time = excluded.check_in_time,
  check_out_time = excluded.check_out_time,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.site_settings (property_id, setting_key, setting_value)
select p.id, 'homepage_hero', jsonb_build_object(
  'headline', 'A Quiet Boutique Escape in Meghalaya',
  'subheadline', 'Private cottages, a swimming pool, in-house dining, and slow, peaceful stays in the hills of Umran.',
  'trust_line', 'Only 5 cottages • Pre-booking required'
)
from public.properties p
where p.slug = 'la-ki-trep-resort'
on conflict (setting_key) do update
set setting_value = excluded.setting_value, updated_at = now();

insert into public.site_settings (property_id, setting_key, setting_value)
select p.id, 'seo_homepage', jsonb_build_object(
  'title', 'La Ki Trep Resort — Boutique B&B in Meghalaya',
  'description', 'La Ki Trep Resort in Ri Bhoi, Meghalaya — private cottages, swimming pool, in-house restaurant. Pre-booking required. Contact us on WhatsApp for reservations.'
)
from public.properties p
where p.slug = 'la-ki-trep-resort'
on conflict (setting_key) do update
set setting_value = excluded.setting_value, updated_at = now();

insert into public.amenities (name, slug, icon, description, is_active)
values
  ('Air Conditioning', 'air-conditioning', 'snowflake', 'Air-conditioned stay', true),
  ('Complimentary Breakfast', 'complimentary-breakfast', 'utensils', 'Breakfast included', true),
  ('Swimming Pool Access', 'swimming-pool-access', 'waves', 'Pool access for guests', true),
  ('Designated Parking', 'designated-parking', 'car', 'Parking available', true),
  ('Balcony Sit-Out', 'balcony-sitout', 'home', 'Balcony seating area', true),
  ('Private Sit-Out', 'private-sitout', 'tree', 'Private outdoor seating', true),
  ('Pool View', 'pool-view', 'droplets', 'Pool-facing cottage', true),
  ('Garden View', 'garden-view', 'leaf', 'Garden-facing cottage', true),
  ('Non-AC', 'non-ac', 'fan', 'Non-air-conditioned cottage', true),
  ('Extra Bed On Request', 'extra-bed-on-request', 'bed', 'Extra bed subject to availability', true),
  ('In-house Restaurant', 'in-house-restaurant', 'cloche', 'Meals at the restaurant', true),
  ('Outdoor Spaces', 'outdoor-spaces', 'trees', 'Outdoor seating and open areas', true)
on conflict (slug) do update
set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.cottages (
  property_id, code, name, slug, category, short_description, full_description,
  bed_type, max_adults, max_children, max_infants, max_total_guests, room_count,
  has_ac, breakfast_included, extra_bed_allowed, is_combined_unit, component_codes,
  sort_order, is_featured, is_bookable, status
)
select p.id, x.code, x.name, x.slug, x.category, x.short_description, x.full_description,
       x.bed_type, x.max_adults, x.max_children, x.max_infants, x.max_total_guests, x.room_count,
       x.has_ac, x.breakfast_included, x.extra_bed_allowed, x.is_combined_unit, x.component_codes,
       x.sort_order, x.is_featured, x.is_bookable, 'active'::public.cottage_status
from public.properties p
cross join (
  values
  ('C1A','Premium Cottage A','premium-cottage-a','Premium Cottage',
   'Spacious AC cottage with pool or garden view, balcony sit-out and complimentary breakfast included.',
   'The Premium Cottage A is a spacious AC cottage suited for couples or two adults travelling with an infant below 2 years. It offers a pool-facing or garden-facing setting, a balcony sit-out, complimentary breakfast, swimming pool access during guest hours and designated parking.',
   'Double bed / queen-size bed',2,0,1,3,2,true,true,false,false,ARRAY[]::text[],1,true,true),
  ('C1B','Premium Cottage B','premium-cottage-b','Premium Cottage',
   'Spacious AC cottage with garden hedge setting and a private sit-out space for bonfires, complimentary breakfast included.',
   'The Premium Cottage B is La Ki Trep''s most spacious stay option with a garden hedge setting and private sit-out. It is suited for couples or two adults with an infant below 2 years and includes complimentary breakfast, pool access during guest hours and designated parking.',
   'Double bed / queen-size bed',2,0,1,3,1,true,true,false,false,ARRAY[]::text[],2,true,true),
  ('C4','Cottage 4','cottage-4','Standard Cottage',
   'Comfortable non-AC cottage, extra bed available on request, complimentary breakfast included.',
   'Cottage 4 is a comfortable standard non-AC cottage suited for two adults and one infant below 2 years. It includes a terrace sit-out, complimentary breakfast, pool access during guest hours and designated parking.',
   'Single beds / extra bed available on request',2,0,1,3,1,false,true,true,false,ARRAY[]::text[],3,false,true),
  ('C5','Cottage 5','cottage-5','Standard Cottage',
   'Cosy non-AC cottage with single beds, ideal for two guests, complimentary breakfast included.',
   'Cottage 5 is a cosy standard non-AC cottage with single beds, best suited for two adults. It includes complimentary breakfast, pool access during guest hours and designated parking.',
   'Single beds',2,0,0,2,1,false,true,false,false,ARRAY[]::text[],4,false,true),
  ('FC45','Family Cottage','family-cottage','Family Cottage',
   'Two cottages with a shared private compound — ideal for families or small groups.',
   'The Family Cottage combines Cottage 4 and Cottage 5 within a shared private compound, suitable for families or small groups who want to stay close together while still having separate cottage spaces. Complimentary breakfast, pool access during guest hours and designated parking are included.',
   'Single beds + extra bed available on request',5,0,0,5,1,false,true,true,true,ARRAY['C4','C5']::text[],5,true,true)
) as x(
  code, name, slug, category, short_description, full_description, bed_type,
  max_adults, max_children, max_infants, max_total_guests, room_count,
  has_ac, breakfast_included, extra_bed_allowed, is_combined_unit, component_codes,
  sort_order, is_featured, is_bookable
)
where p.slug = 'la-ki-trep-resort'
on conflict (slug) do update
set
  property_id = excluded.property_id,
  code = excluded.code,
  name = excluded.name,
  category = excluded.category,
  short_description = excluded.short_description,
  full_description = excluded.full_description,
  bed_type = excluded.bed_type,
  max_adults = excluded.max_adults,
  max_children = excluded.max_children,
  max_infants = excluded.max_infants,
  max_total_guests = excluded.max_total_guests,
  room_count = excluded.room_count,
  has_ac = excluded.has_ac,
  breakfast_included = excluded.breakfast_included,
  extra_bed_allowed = excluded.extra_bed_allowed,
  is_combined_unit = excluded.is_combined_unit,
  component_codes = excluded.component_codes,
  sort_order = excluded.sort_order,
  is_featured = excluded.is_featured,
  is_bookable = excluded.is_bookable,
  status = excluded.status,
  updated_at = now();

insert into public.cottage_prices (
  cottage_id, weekday_rate, weekend_rate, child_rate, extra_bed_rate, notes
)
select c.id, x.weekday_rate, x.weekend_rate, x.child_rate, x.extra_bed_rate, x.notes
from public.cottages c
join (
  values
    ('premium-cottage-a', 6000, 8000, 0, 0, 'Breakfast included'),
    ('premium-cottage-b', 6000, 8000, 0, 0, 'Breakfast included'),
    ('cottage-4', 5000, 6000, 500, 0, 'Breakfast included; extra bed on request'),
    ('cottage-5', 4000, 5000, 500, 0, 'Breakfast included'),
    ('family-cottage', 8000, 10000, 500, 0, 'Breakfast included; extra bed on request')
) as x(slug, weekday_rate, weekend_rate, child_rate, extra_bed_rate, notes)
  on c.slug = x.slug
on conflict (cottage_id) do update
set
  weekday_rate = excluded.weekday_rate,
  weekend_rate = excluded.weekend_rate,
  child_rate = excluded.child_rate,
  extra_bed_rate = excluded.extra_bed_rate,
  notes = excluded.notes,
  updated_at = now();

insert into public.cottage_amenities (cottage_id, amenity_id)
select c.id, a.id
from public.cottages c
join public.amenities a on (
  (c.slug in ('premium-cottage-a','premium-cottage-b') and a.slug in ('air-conditioning','complimentary-breakfast','swimming-pool-access','designated-parking'))
  or (c.slug = 'cottage-4' and a.slug in ('non-ac','extra-bed-on-request','complimentary-breakfast','swimming-pool-access','designated-parking'))
  or (c.slug = 'cottage-5' and a.slug in ('non-ac','complimentary-breakfast','swimming-pool-access','designated-parking'))
  or (c.slug = 'family-cottage' and a.slug in ('non-ac','extra-bed-on-request','complimentary-breakfast','swimming-pool-access','designated-parking'))
)
on conflict do nothing;

insert into public.attractions (
  property_id, name, description, sort_order, is_active
)
select p.id, x.name, x.description, x.sort_order, true
from public.properties p
cross join (
  values
    ('Umiam Lake / Barapani', 'Popular lake destination near the resort', 1),
    ('Umiam Boating Point / Water Sports Complex', 'Boating and lakeside activities nearby', 2),
    ('Lum Nehru Park', 'Nearby park and viewpoint area', 3),
    ('Lum Sohpetbneng', 'Well-known hill and cultural attraction', 4),
    ('Umden-Diwon Eri Silk Village', 'Local countryside and silk village experience', 5),
    ('Tea Garden & Mini Golf Course, Umran', 'Nearby leisure stop in Umran', 6)
) as x(name, description, sort_order)
where p.slug = 'la-ki-trep-resort'
on conflict (property_id, name) do update
set
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.policies (property_id, policy_key, title, content, sort_order, is_active)
select p.id, x.policy_key, x.title, x.content, x.sort_order, true
from public.properties p
cross join (
  values
    ('check-in-policy','Check-in','Check-in time is 2:00 PM. Early check-in is subject to availability and must be arranged in advance.',1),
    ('check-out-policy','Check-out','Check-out time is 11:00 AM. Late check-out charges apply as per management policy.',2),
    ('child-policy','Child Policy','Children aged 2–12 years are charged ₹500 per child. Infants below 2 years are free. Children 15 years and above are treated as adults.',3),
    ('cancellation-policy','Cancellation Policy','Advance payment is non-refundable for no-shows. Rescheduling may be offered where possible.',4),
    ('pet-policy','Pet Policy','Pets are not permitted on the property.',5),
    ('smoking-policy','Smoking Policy','Smoking is permitted only in designated areas such as the restaurant balcony, cottage balcony, and seating area in front of cottages. Smoking inside rooms, restaurant, and pool area is prohibited.',6),
    ('outside-food-policy','Outside Food & Beverages','Outside food and beverages are not permitted. All meals must be from the in-house restaurant.',7),
    ('outside-alcohol-policy','Outside Alcohol','Outside alcohol is not permitted. Corkage charge may apply if found.',8),
    ('pool-policy','Swimming Pool','Appropriate swimwear is required. Guests should shower before entering. Children must be supervised.',9),
    ('id-proof-policy','ID Proof Required','Valid government-issued photo ID is required for all adult guests at check-in.',10),
    ('non-guest-policy','Non-Guest Access','Non-registered visitors, friends, or family of guests are not permitted on the property.',11)
) as x(policy_key, title, content, sort_order)
where p.slug = 'la-ki-trep-resort'
on conflict (policy_key) do update
set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

commit;
