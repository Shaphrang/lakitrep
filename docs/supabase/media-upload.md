# Supabase media upload flow

This project stores admin-managed images in a **single public bucket** and saves the resulting public URLs into table columns.

## Bucket

- Bucket name: `lakitrep-media` (override via `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET`)
- Bucket visibility: **public**
- Upload implementation: browser upload in reusable media components (`src/components/admin/media/*`)

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

The UI stores gallery URLs in hidden form inputs (newline separated), and server actions convert them into `text[]`.

## Admin upload UX

Reusable components:

- `ImageUploadField` for single images
- `MultiImageUploadField` for galleries

Flow:

1. Admin selects image file(s).
2. Selected images immediately show preview in the UI.
3. Admin uploads selected images to Supabase Storage.
4. Component receives public URL(s) and updates hidden form input values.
5. Normal create/update action persists URL(s) to DB.

## Preview/display behavior

- Single-image field displays selected preview immediately.
- Gallery field supports selecting multiple images and previewing all selected files.
- Uploaded images show with an **X remove button**.
- Removing an image updates only current form state until save.

## Replace / update / remove

- Replace cover image: select/upload new image, then save form.
- Add gallery images: select multiple files, upload, then save form.
- Remove images: click X on preview and save form.

> Note: Current flow does not auto-delete old files in Storage when you replace/remove URLs in DB. Remove stale bucket files manually when needed.
