-- Resort management migration snapshot.
-- Keep in sync with docs/sql/resort-management-*.sql.

begin;

alter table public.booking_guests
  add column if not exists address text,
  add column if not exists customer_type text default 'other',
  add column if not exists source text default 'website';

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

create table if not exists public.booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_date date not null default current_date,
  amount numeric(10,2) not null check (amount > 0),
  payment_mode text not null default 'cash',
  payment_type text not null default 'part_payment',
  reference_number text,
  notes text,
  received_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_charges (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  charge_type text not null default 'other',
  description text,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
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
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.cottage_blocks (
  id uuid primary key default gen_random_uuid(),
  cottage_id uuid not null references public.cottages(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'maintenance',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_check_in_out on public.bookings(check_in_date, check_out_date);
create index if not exists idx_bookings_customer_id on public.bookings(customer_id);
create index if not exists idx_booking_payments_booking_date on public.booking_payments(booking_id, payment_date);
create index if not exists idx_invoices_booking_id on public.invoices(booking_id);
create index if not exists idx_invoices_invoice_number on public.invoices(invoice_number);

commit;
