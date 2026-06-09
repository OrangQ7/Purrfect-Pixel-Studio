# Supabase Setup

This app uses Supabase for email login, private image storage, and the admin gallery.

## 1. Create the storage bucket

Create a private bucket named:

```text
pixel-cats
```

You can also run this SQL in the Supabase SQL editor:

```sql
insert into storage.buckets (id, name, public)
values ('pixel-cats', 'pixel-cats', false)
on conflict (id) do nothing;
```

## 2. Create the generated image table

Run this SQL:

```sql
create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_email text,
  storage_path text not null,
  source_photo_name text,
  analysis jsonb,
  fur_region_plan jsonb,
  accessory_preset text,
  face_feature_preset text,
  background_color text,
  created_at timestamptz not null default now()
);

create index if not exists generated_images_created_at_idx
  on public.generated_images (created_at desc);

create index if not exists generated_images_user_id_idx
  on public.generated_images (user_id);
```

The app writes and reads this table through server API routes using the Supabase
service role key. The admin API still checks the signed-in user's email against
`ADMIN_EMAILS`.

## 3. Vercel environment variables

Add these variables in Vercel Project Settings:

```text
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=your_admin_email@example.com
```

After adding or changing environment variables, redeploy the Vercel project.

## 4. Pages

- Customer app: `/pixel-cat`
- Admin gallery: `/admin`

Users sign in with an email magic link. When a signed-in user clicks
`Save my kitty`, the app downloads the finished PNG locally and uploads a copy
to the private `pixel-cats` bucket for the admin gallery.
