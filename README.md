# Purrfect Pixel Studio

A Next.js pixel cat customization studio.

Users can upload a cat photo, generate a fixed-silhouette pixel cat, adjust fur regions, switch facial overlays and decorations, create a bead-style name tag, and save the final kitty image.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- HTML Canvas
- OpenAI API for cat appearance analysis

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
```

The app UI and local editing tools work in the browser. The cat photo analysis API uses `OPENAI_API_KEY`.
