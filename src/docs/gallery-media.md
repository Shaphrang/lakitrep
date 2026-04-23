# Gallery Media Management

## Bucket
- Bucket name: `property-media`.
- Bucket scope: a single shared bucket for all resort property galleries.

## Folder Structure
Files are uploaded under:

`properties/{propertyId}/{categorySlug}/{timestamp}-{randomId}.webp`

Example:

`properties/7ab1.../exterior-view/1713869032332-3de8f....webp`

## Category Slugs (authoritative)
- `exterior-view` (Exterior View of Property)
- `interior-view` (Interior View)
- `premium-cottage` (Premium Cottage Photos)
- `standard-cottage` (Standard Cottage Photos)
- `swimming-pool` (Swimming Pool Area)
- `restaurant-dining` (Restaurant / Dining Area)
- `outdoor-garden` (Outdoor / Garden Spaces)
- `scenic-views` (Scenic Views / Surroundings)
- `activities-experiences` (Activities / Experiences)

## DB Schema
Table: `public.property_gallery_media`

Columns:
- `id`
- `property_id`
- `category_slug`
- `title`
- `alt_text`
- `caption`
- `storage_bucket`
- `storage_path`
- `public_url`
- `sort_order`
- `is_featured`
- `width`
- `height`
- `file_size`
- `mime_type`
- `created_at`
- `updated_at`

Source of truth: **`property_gallery_media` table**.
Do not render from bucket listing alone.

## Upload Flow
1. Admin selects a category and multiple image files.
2. Client validates type (`jpeg/png/webp`) and max file size.
3. Files are optimized in browser (ratio preserved, converted to WebP).
4. File uploads to Supabase Storage `property-media`.
5. API inserts metadata row into `property_gallery_media`.
6. If metadata insert fails, uploaded storage object is removed.
7. Admin UI updates immediately with cache-busted preview URL.

## Rendering Flow
### Admin
- Fetches gallery rows by `property_id`.
- Filters by selected category.
- Shows image grid, metadata form, featured toggle, and reorder buttons.

### Public
- Uses `getPropertyGalleryByCategory(propertyId)` from `src/lib/public-site.ts`.
- Returns grouped data shape:
  - `exteriorView`
  - `interiorView`
  - `premiumCottage`
  - `standardCottage`
  - `swimmingPool`
  - `restaurantDining`
  - `outdoorGarden`
  - `scenicViews`
  - `activitiesExperiences`
- Ordered by: `is_featured desc`, `sort_order asc`, `created_at asc`.

## Policy Assumptions
- Public `select` is allowed on `property_gallery_media` for website rendering.
- Admin write operations require `public.is_admin_user()` policy.
- Existing `public.set_updated_at()` trigger function is available.

## Troubleshooting
- **Invalid file type**: Ensure JPEG/PNG/WebP only.
- **File too large**: Reduce source size and retry.
- **Storage upload failed**: Confirm bucket exists and user has storage access.
- **Metadata insert failed**: Check RLS policies, DB constraints, and admin auth.
- **Delete failed**: If DB row deleted but storage failed, manually remove object from `property-media`.
- **Stale previews**: UI appends cache-busting query param based on update time.
