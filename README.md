# Purrfect Pixel Studio

A Next.js pixel cat customization studio.

Users can upload a cat photo, generate a fixed-silhouette pixel cat, adjust fur regions, switch facial overlays and decorations, create a bead-style name tag, and save the final kitty image.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- HTML Canvas
- OpenAI API for cat appearance analysis
- Supabase for email login, image storage, and admin gallery

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/pixel-cat`.

## Build

```bash
npm run build
```

## Vercel Environment Variables

Add this in Vercel Project Settings:

```bash
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=your_admin_email@example.com
```

The app UI and local editing tools work in the browser. The cat photo analysis API uses `OPENAI_API_KEY`.
Email login, saved kitty images, and `/admin` use Supabase.

See `docs/supabase-setup.md` for the required storage bucket and table.
