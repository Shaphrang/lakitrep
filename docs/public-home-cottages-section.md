# Public Home Cottages Section Update

## What changed

The public home page cottage section now uses the latest cottage behaviour and only displays **active + bookable** cottages in a fixed two-column layout on medium/desktop screens.

### Behaviour change summary

- **C1 and C2 are shown separately** as two distinct premium stay options.
- **C1-C2 archive is hidden** because it is not a public bookable stay option.
- **FC45 is shown once** as the Family Cottage combined stay option (C4 + C5 combined/shared private compound messaging).

## Data fetching and query rules

Updated the public cottage query in `src/lib/public-site.ts`:

- Added full field coverage required for public cottage rendering:
  - `id`, `property_id`, `code`, `name`, `slug`, `category`
  - `short_description`, `full_description`, `bed_type`
  - `max_adults`, `max_children`, `max_infants`, `max_total_guests`
  - `room_count`, `has_ac`, `breakfast_included`
  - `extra_bed_allowed`, `is_combined_unit`, `component_codes`
  - `amenities`, `weekday_price`, `weekend_price`, `child_price`, `pricing_note`
  - `cover_image`, `gallery_images`, `sort_order`, `is_featured`, `is_bookable`, `status`
- Filters remain:
  - `status = active`
  - `is_bookable = true`
- Order now:
  - `sort_order ASC`
  - `name ASC`

## UI and responsive behaviour

Refined `src/components/public/home/sections/CottagesSection.tsx` to provide:

- Header block:
  - Label: `Cottage Stays`
  - Title: `Stay in Our Cottages`
  - Subtitle for premium/standard/family options
  - Helper line: `All stays include complimentary breakfast.`
- Card grid:
  - Mobile: `1` column
  - Tablet/Desktop: `2` columns (`md:grid-cols-2`), resulting in `2 + 2 + 2` for six cottages
- Card content:
  - Cover image -> gallery fallback -> premium placeholder fallback
  - Category badge normalization (Premium / Standard / Family)
  - Capacity text that avoids children when max children is `0`
  - Feature chips from AC/non-AC, breakfast, amenities, combined unit hints, extra bed on request
  - Weekday + weekend pricing rows
  - `View Details` + `Book Now` CTAs

## Booking flow safety

- `Book Now` continues to pass `cottage.slug` to the existing booking flow (`BookNowButton`), preserving compatibility with booking state and form prefill.
- No archived cottage code is manually injected or hardcoded.

## Files changed

- `src/lib/public-site.ts`
- `src/components/public/home/sections/CottagesSection.tsx`
- `docs/public-home-cottages-section.md`

## Verification checklist

- Home page compiles with updated cottage section.
- Public cottage query remains active/bookable only.
- Desktop grid renders in 2-column layout for six cottages.
- Mobile layout is single-column.
- FC45 family unit appears as one combined option.
- Archived C1-C2 does not appear (depends on `is_bookable=false` and/or non-active status in data).
