# Minimal Messenger AI Auto-Chat Platform

AI-powered auto-replies for Facebook Messenger pages. Built with Next.js 15, Supabase, Vercel AI SDK, and Meta Graph API.

## Features

- Connect Facebook Pages via OAuth
- Per-page system prompts
- Toggle auto-chat on/off (auto-subscribes webhooks)
- Context-aware replies (last 5 messages)
- Supports OpenAI (`gpt-4o-mini`) or Google Gemini (`gemini-1.5-flash`)
- Live activity log on dashboard

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui style components
- **Database & Auth**: Supabase (PostgreSQL)
- **AI**: Vercel AI SDK
- **Deploy**: Vercel

## Quick Start

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase-schema.sql` in the SQL Editor
3. Copy Project URL, anon key, and service_role key

### 2. Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → type **Business**
3. Add products: **Messenger** and **Facebook Login**
4. In Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `https://your-domain.vercel.app/api/auth/callback`
5. In Messenger → Settings:
   - Webhook: `https://your-domain.vercel.app/api/webhook/messenger`
   - Verify Token: any random string (same as `META_VERIFY_TOKEN`)
   - Subscribe to: `messages`, `messaging_postbacks`
6. Copy App ID and App Secret

### 3. Environment Variables

Copy `.env.example` → `.env.local` (or set in Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

META_APP_ID=...
META_APP_SECRET=...
META_VERIFY_TOKEN=your-random-token

OPENAI_API_KEY=...          # or GEMINI_API_KEY=...

NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Local Development

```bash
npm install
npm run dev
```

For webhooks locally use Cloudflare Tunnel or ngrok (HTTPS required by Meta).

### 5. Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and import the repo in the Vercel dashboard. Set all environment variables in Project Settings → Environment Variables.

After deploy:

1. Update Meta OAuth redirect URI and Webhook URL to your Vercel domain
2. Visit `/dashboard` → Connect Facebook → enable Auto-Chat on a page

## Architecture

```
Facebook User → Meta Graph API (webhook) → Next.js /api/webhook/messenger
  → Supabase (page settings + history) → AI (OpenAI/Gemini)
  → Meta Graph API (send reply) → Facebook User
```

## Notes

- This is a minimal “vibe coding” implementation. Production apps should add proper user authentication (Supabase Auth), RLS policies per user, rate limiting, and token refresh handling.
- Page access tokens from `/me/accounts` are long-lived when obtained via a long-lived user token.
- Always return HTTP 200 from the webhook immediately to prevent Meta retry storms.
