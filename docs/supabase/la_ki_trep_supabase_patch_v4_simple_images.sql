-- ============================================================
-- LA KI TREP RESORT - SUPABASE PATCH V4 (SIMPLE IMAGES)
-- Purpose:
-- 1) Move image handling to direct columns in main tables
-- 2) Keep gallery_images table for common public resort gallery
-- 3) Keep cottage_images table as legacy/read-only fallback (not used by app)
-- ============================================================

begin;

alter table public.properties
  add column if not exists cover_image text,
  add column if not exists gallery_images text[] not null default '{}';

alter table public.cottages
  add column if not exists cover_image text,
  add column if not exists gallery_images text[] not null default '{}';

alter table public.attractions
  add column if not exists cover_image text,
  add column if not exists gallery_images text[] not null default '{}';

-- Backfill cottages from legacy cottage_images table when available.
update public.cottages c
set
  cover_image = coalesce(
    c.cover_image,
    (
      select ci.storage_path
      from public.cottage_images ci
      where ci.cottage_id = c.id
      order by ci.is_cover desc, ci.sort_order asc, ci.created_at asc
      limit 1
    )
  ),
  gallery_images = case
    when array_length(c.gallery_images, 1) is null or array_length(c.gallery_images, 1) = 0 then
      coalesce(
        (
          select array_agg(ci.storage_path order by ci.sort_order asc, ci.created_at asc)
          from public.cottage_images ci
          where ci.cottage_id = c.id
        ),
        '{}'
      )
    else c.gallery_images
  end;

-- Backfill attractions from legacy image_url if present.
update public.attractions
set cover_image = coalesce(cover_image, image_url)
where image_url is not null and btrim(image_url) <> '';

-- Update public cottage view to read direct columns.
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

commit;
