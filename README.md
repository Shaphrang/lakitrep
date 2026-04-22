# La Ki Trep Resort Admin (Next.js + Supabase)

## Run locally

```bash
npm install
npm run dev
```

## Required environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Optional (defaults to lakitrep-media)
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=lakitrep-media
```

### Where to find keys

In Supabase Dashboard:

1. Open your project.
2. Go to **Project Settings → API**.
3. Copy **Project URL** and **anon public key**.

### Security note

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intended for frontend use.
- Access is still protected by Supabase Row Level Security (RLS) policies.
- **Never** expose the service role key in frontend code or any `NEXT_PUBLIC_*` variable.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
