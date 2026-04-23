# Supabase media upload flow

This project stores admin-managed images in a **single public bucket** and saves the resulting public URLs into table columns.

## Bucket

- Bucket name: `lakitrep-media` (override via `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET`)
- Bucket visibility: **public**
- Browser upload utility: `src/lib/supabase/upload-admin-image.ts`
- Browser optimization utility: `src/lib/supabase/optimize-admin-image.ts`

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

## Client-side optimization before upload

All admin image uploads are optimized in the browser **before** uploading to Supabase Storage.

### What happens

1. Admin selects one or more images.
2. The app validates that each file is an image.
3. The browser resizes each image without upscaling (aspect ratio preserved).
4. The browser compresses output and converts it to `image/webp`.
5. The optimized WebP file is uploaded to `lakitrep-media`.
6. Returned public URL is saved to form state and then persisted in DB.

### Sizing and format strategy

- Output format: **WebP** (`image/webp`)
- Cover/OG style uploads (`*/cover`, `seo/og`): max width **1600px**
- Gallery uploads (`*/gallery`): max width **1400px**
- Height scales automatically to preserve aspect ratio
- Smaller source images are **not upscaled**

### Compression targets

- Target output size: around **450 KB**
- Soft ceiling: around **500 KB** when possible
- Quality is reduced in a few safe steps to keep images visually strong while reducing file size
- If an image is still above 500 KB after resizing/compression, the best available optimized output is uploaded

## How DB columns are stored

- `cover_image` / `og_image`: one public URL string
- `gallery_images`: array of URL strings

The UI stores gallery URLs in a hidden textarea-like payload (newline separated) and server actions convert them into `text[]`.

## Admin upload UX

Reusable components:

- `ImageUploadField` for single images
- `MultiImageUploadField` for galleries

Flow:

1. Admin selects file(s).
2. UI shows optimizing/uploading state.
3. Optimized file(s) upload directly to Supabase Storage from browser.
4. Public URL(s) are returned to the component.
5. URL(s) are written into hidden form inputs.
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

## Admin usage recommendations

- Upload good quality originals from your local archive; the dashboard creates the web-ready version automatically.
- Prefer landscape images for cover/gallery slots for better visual consistency.
- If a photo looks too soft after upload, retry with a sharper source image/crop.
- Keep your full-resolution master files offline; Supabase stores the website-ready optimized versions only.

> Note: Current flow does not delete old files from the bucket automatically. If needed, remove old files manually from Supabase Storage.
