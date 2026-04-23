begin;

create table if not exists public.property_gallery_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  category_slug text not null check (
    category_slug in (
      'exterior-view',
      'interior-view',
      'premium-cottage',
      'standard-cottage',
      'swimming-pool',
      'restaurant-dining',
      'outdoor-garden',
      'scenic-views',
      'activities-experiences'
    )
  ),
  title text,
  alt_text text,
  caption text,
  storage_bucket text not null,
  storage_path text not null unique,
  public_url text not null,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  width integer,
  height integer,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_property_gallery_media_property_id
  on public.property_gallery_media(property_id);

create index if not exists idx_property_gallery_media_category_slug
  on public.property_gallery_media(category_slug);

create index if not exists idx_property_gallery_media_sort_order
  on public.property_gallery_media(sort_order);

create index if not exists idx_property_gallery_media_property_category_sort
  on public.property_gallery_media(property_id, category_slug, sort_order);

drop trigger if exists trg_property_gallery_media_updated_at on public.property_gallery_media;
create trigger trg_property_gallery_media_updated_at
before update on public.property_gallery_media
for each row execute function public.set_updated_at();

alter table public.property_gallery_media enable row level security;

drop policy if exists "public_read_property_gallery_media" on public.property_gallery_media;
create policy "public_read_property_gallery_media"
on public.property_gallery_media
for select
using (true);

drop policy if exists "admin_all_property_gallery_media" on public.property_gallery_media;
create policy "admin_all_property_gallery_media"
on public.property_gallery_media
for all
using (public.is_admin_user())
with check (public.is_admin_user());

commit;
