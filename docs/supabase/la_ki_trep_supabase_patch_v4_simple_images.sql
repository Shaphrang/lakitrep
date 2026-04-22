-- ============================================================
-- LA KI TREP RESORT - SUPABASE PATCH V4 (SIMPLE IMAGES)
-- Purpose:
-- 1) Move image handling to direct columns in main tables
-- 2) Keep gallery_images table for common public resort gallery
-- 3) Keep cottage_images table as legacy/read-only fallback (not used by app)
-- ============================================================
begin;

-- ============================================================
-- ADD / NORMALIZE DIRECT IMAGE COLUMNS
-- ============================================================

alter table public.properties
  add column if not exists cover_image text,
  add column if not exists gallery_images text[];

alter table public.cottages
  add column if not exists cover_image text,
  add column if not exists gallery_images text[];

alter table public.attractions
  add column if not exists cover_image text,
  add column if not exists gallery_images text[];

update public.properties
set gallery_images = '{}'::text[]
where gallery_images is null;

update public.cottages
set gallery_images = '{}'::text[]
where gallery_images is null;

update public.attractions
set gallery_images = '{}'::text[]
where gallery_images is null;

alter table public.properties
  alter column gallery_images set default '{}'::text[],
  alter column gallery_images set not null;

alter table public.cottages
  alter column gallery_images set default '{}'::text[],
  alter column gallery_images set not null;

alter table public.attractions
  alter column gallery_images set default '{}'::text[],
  alter column gallery_images set not null;

-- ============================================================
-- BACKFILL COTTAGES FROM LEGACY cottage_images IF TABLE EXISTS
-- ============================================================

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'cottage_images'
  ) then

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
        when c.gallery_images is null
          or array_length(c.gallery_images, 1) is null
          or array_length(c.gallery_images, 1) = 0
        then coalesce(
          (
            select array_agg(ci.storage_path order by ci.sort_order asc, ci.created_at asc)
            from public.cottage_images ci
            where ci.cottage_id = c.id
          ),
          '{}'::text[]
        )
        else c.gallery_images
      end;

  end if;
end $$;

-- ============================================================
-- BACKFILL PROPERTIES FROM gallery_images TABLE
-- ============================================================

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'gallery_images'
  ) then

    update public.properties p
    set cover_image = coalesce(
      p.cover_image,
      (
        select gi.storage_path
        from public.gallery_images gi
        where gi.property_id = p.id
        order by gi.is_featured desc, gi.sort_order asc, gi.created_at asc
        limit 1
      )
    );

    update public.properties p
    set gallery_images = case
      when p.gallery_images is null
        or array_length(p.gallery_images, 1) is null
        or array_length(p.gallery_images, 1) = 0
      then coalesce(
        (
          select array_agg(gi.storage_path order by gi.is_featured desc, gi.sort_order asc, gi.created_at asc)
          from public.gallery_images gi
          where gi.property_id = p.id
        ),
        '{}'::text[]
      )
      else p.gallery_images
    end;

  end if;
end $$;

-- ============================================================
-- BACKFILL ATTRACTIONS FROM OLD image_url IF COLUMN EXISTS
-- ============================================================

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attractions'
      and column_name = 'image_url'
  ) then
    execute $sql$
      update public.attractions
      set
        cover_image = coalesce(cover_image, image_url),
        gallery_images = case
          when gallery_images is null
            or array_length(gallery_images, 1) is null
            or array_length(gallery_images, 1) = 0
          then case
            when image_url is not null and btrim(image_url) <> '' then array[image_url]::text[]
            else '{}'::text[]
          end
          else gallery_images
        end
      where image_url is not null and btrim(image_url) <> ''
    $sql$;
  end if;
end $$;

-- ============================================================
-- UPDATE PUBLIC COTTAGE VIEW
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

-- ============================================================
-- MAKE ATTRACTIONS RERUN-SAFE
-- ============================================================

delete from public.attractions a
where a.id in (
  select id
  from (
    select
      id,
      row_number() over (
        partition by property_id, name
        order by created_at desc, id desc
      ) as rn
    from public.attractions
  ) t
  where t.rn > 1
);

create unique index if not exists ux_attractions_property_name
  on public.attractions(property_id, name);

commit;