# Public Attractions Section

## Purpose
The homepage Attractions section helps guests quickly understand nearby outings from La Ki Trep and plan travel comfort (distance, drive, walk reference, and type of experience).

## Data source
- Source: Supabase table `public.attractions` via `getAttractions(propertyId)`.
- Fetch location: `src/lib/public-site.ts`.
- Homepage rendering: `src/components/public/home/sections/AttractionsSection.tsx`.

## Supabase fields used
- `id`
- `name`
- `description`
- `distance_text`
- `cover_image`
- `gallery_images`
- `sort_order`

## Active filter and ordering
`getAttractions(propertyId)` fetches only active rows and sorts records for stable display:
- `property_id = current property`
- `is_active = true`
- `ORDER BY sort_order ASC, name ASC`

## Distance text handling
`parseDistanceText(distance_text)` safely splits travel copy (road distance, drive time, walk reference, extra notes).
- If parsing succeeds, travel chips are shown.
- If parsing fails or format changes, raw `distance_text` is shown to avoid UI breakage.

## Grouping logic
Derived grouping is handled in UI helper `getAttractionGroup(name)`:
- **Nearby Attractions**: most attractions.
- **Half-Day Cultural Experience**: Umden-Diwon / Eri Silk-style entries.

## Derived tags
`getAttractionTags(name)` adds compact experience badges (e.g., Lake View, Boating, Sacred Hill, Eri Silk, Half-Day).

## Image behavior and fallback
- Uses attraction `cover_image` first, then first `gallery_images` fallback.
- URL normalization is handled by `resolveMediaUrl`.
- If no valid image exists, a gradient placeholder with attraction name is shown.
- Featured card image is eager loaded; grid items are lazy loaded.

## Placement on homepage
Section is placed after `CottagesSection` and before `LocationReachSection` in `src/app/(public)/page.tsx`.

## Guest-facing note
Section includes this travel disclaimer:
- Distances/timings are approximate and can vary.
- Vehicle is generally recommended.
- Exact resort map pin is shared after booking confirmation.

## Testing checklist
- [ ] Homepage loads without runtime errors.
- [ ] Attractions section appears after cottages and before location section.
- [ ] Inactive attractions are not displayed.
- [ ] Featured attraction card renders first attraction.
- [ ] Nearby and Half-Day groups render correctly.
- [ ] Travel chips render and fallback to raw text if needed.
- [ ] Missing image fallback card renders cleanly.
- [ ] CTA buttons work (`/attractions`, `/book`, WhatsApp/contact fallback).
- [ ] Mobile layouts (360px/390px) have no horizontal overflow.
- [ ] `npm run lint` passes.
