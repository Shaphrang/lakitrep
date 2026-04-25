-- Resort Management Schema Extension
-- Safe to run after the base docs/supabase/schema.sql

begin;

-- ===============================
-- ENUM EXTENSIONS (non-breaking)
-- ===============================
do $$ begin
  alter type public.booking_status add value if not exists 'new_request';
  alter type public.booking_status add value if not exists 'contacted';
  alter type public.booking_status add value if not exists 'advance_paid';
  alter type public.booking_status add value if not exists 'checked_in';
  alter type public.booking_status add value if not exists 'checked_out';
  alter type public.booking_status add value if not exists 'no_show';
exception when others then null; end $$;

do $$ begin
  alter type public.payment_status add value if not exists 'advance_paid';
  alter type public.payment_status add value if not exists 'partially_paid';
  alter type public.payment_status add value if not exists 'paid';
  alter type public.payment_status add value if not exists 'pending';
  alter type public.payment_status add value if not exists 'refunded';
exception when others then null; end $$;

-- ===============================
-- BOOKING GUESTS AS CUSTOMERS
-- ===============================
alter table public.booking_guests
  add column if not exists address text,
  add column if not exists customer_type text default 'other',
  add column if not exists source text default 'website';

-- ===============================
-- BOOKING FINANCIAL FIELDS
-- ===============================
alter table public.bookings
  add column if not exists customer_id uuid references public.booking_guests(id) on delete restrict,
  add column if not exists booking_total numeric(10,2) not null default 0,
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists extra_charges_total numeric(10,2) not null default 0,
  add column if not exists final_total numeric(10,2) not null default 0,
  add column if not exists amount_paid numeric(10,2) not null default 0,
  add column if not exists amount_pending numeric(10,2) not null default 0,
  add column if not exists internal_notes text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists actual_check_in_at timestamptz,
  add column if not exists actual_check_out_at timestamptz;

update public.bookings
set
  customer_id = coalesce(customer_id, booking_guest_id),
  booking_total = coalesce(booking_total, total_amount, 0),
  final_total = case
    when final_total = 0 then coalesce(total_amount, 0)
    else final_total
  end,
  amount_pending = case
    when amount_pending = 0 then greatest(0, coalesce(total_amount, 0) - coalesce(amount_paid, 0))
    else amount_pending
  end
where true;

-- ===============================
-- NEW TABLES
-- ===============================
create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  payment_mode text not null default 'cash' check (payment_mode in ('cash','upi','card','bank_transfer','other')),
  payment_type text not null default 'part_payment' check (payment_type in ('advance','part_payment','final_payment','refund')),
  reference_number text,
  notes text,
  received_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_charges (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  charge_type text not null default 'other' check (charge_type in ('room','extra_bed','extra_person','food_bill','food','bonfire','transport','laundry','decoration','late_checkout','damage_charge','damage','discount_adjustment','other')),
  description text,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null default 0 check (unit_price >= 0),
  amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  invoice_date date not null default current_date,
  subtotal numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  amount_paid numeric(10,2) not null default 0,
  amount_pending numeric(10,2) not null default 0,
  status text not null default 'draft' check (status in ('draft','issued','paid','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.cottage_blocks (
  id uuid primary key default gen_random_uuid(),
  cottage_id uuid not null references public.cottages(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'maintenance',
  notes text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

commit;
