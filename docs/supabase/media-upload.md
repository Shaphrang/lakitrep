# Supabase media upload flow

This project stores admin-managed images in a **single public bucket** and saves the resulting public URLs into table columns.

## Bucket

- Bucket name: `lakitrep-media` (override via `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET`)
- Bucket visibility: **public**
- Upload action: `src/actions/admin/media.ts`

## Folder/path convention

Uploads are grouped by module and purpose:

- `properties/cover/*`
- `properties/gallery/*`
- `cottages/cover/*`
- `cottages/gallery/*`
- `attractions/cover/*`
- `attractions/gallery/*`
- `seo/og/*`

File names are generated as:

`{folder}/{timestamp}-{uuid}.{ext}`

## How DB columns are stored

- `cover_image` / `og_image`: one public URL string
- `gallery_images`: array of URL strings

The UI stores gallery URLs in a hidden textarea-like payload (newline separated) and server actions convert them into `text[]`.

## Admin upload UX

Reusable components:

- `ImageUploadField` for single images
- `MultiImageUploadField` for galleries

Flow:

1. Admin selects a file.
2. Component calls `uploadAdminImageAction`.
3. Server action validates admin session and uploads to Storage.
4. Public URL is returned to the component.
5. URL is written into hidden form inputs.
6. Normal create/update action persists URL(s) to DB.

## Preview/display behavior

- Forms show immediate thumbnail previews once upload succeeds.
- Removing an image only removes it from current form state.
- Existing DB values are shown as initial previews in edit mode.

## Replace / update / remove

- Replace cover image: upload a new one and save form.
- Add gallery images: upload more and save form.
- Remove gallery images: click remove for each entry and save form.
- Remove cover image: click remove and save form.

> Note: Current flow does not delete old files from the bucket automatically. If needed, remove old files manually from Supabase Storage.
