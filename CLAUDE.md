# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # start dev server (Next.js on localhost:3000)
bun build        # production build
bun lint         # ESLint
bun scan         # dev server + react-scan performance overlay
bun db:init      # seed/init MongoDB (requires .env.local)
bun run generate # regenerate better-auth types from lib/server/auth.ts
bun run ui       # add shadcn components interactively
```

Copy `example.env` to `.env.local` and fill in all values before running locally.

## Architecture

**Next.js 16 app router** with React 19. All routes live under `app/`.

### Route groups

| Group | Purpose |
|---|---|
| `app/(home)/` | Public landing page |
| `app/(auth)/` | Login, signup, reset-password, verify-email |
| `app/(main)/` | Authenticated dashboard (dashboard, properties, appointments, favorites, settings, users, files, ads, analytics, payment) |
| `app/(docs)/` | Documentation pages |
| `app/api/` | API route handlers |

### Auth — `better-auth`

`lib/server/auth.ts` configures `betterAuth` with:
- MongoDB adapter (via `lib/server/db.ts` Mongoose connection)
- Email/password + Google OAuth
- `anonymous` plugin for guest access
- Custom `role` field on the user (`admin | seller | buyer | guest`)

Client-side auth lives in `lib/client/auth-client.ts`. Session is accessed server-side via `lib/server/getSession.ts`.

### RBAC — `lib/rbac/`

`lib/rbac/index.ts` exports `Role`, `Permission`, and `ROLE_PERMISSIONS`. The main layout (`app/(main)/layout.tsx`) enforces permissions client-side via `hasAnyPermission`. API routes do their own server-side checks.

### Data fetching — TanStack Query + SSR HydrationBoundary

**Pattern used across all main pages:**
1. Server component (`page.tsx`) calls `getQueryClient()`, runs `queryClient.prefetchQuery()` using a server-side fetcher from `lib/server/fetchers/`, then wraps children in `<HydrationBoundary state={dehydrate(queryClient)}>`.
2. Client components call `useSuspenseQuery` with the same query key — they reuse the dehydrated cache, no extra network round-trip.

`lib/query-client.ts` is the single source for `getQueryClient()` — it creates a fresh client per server request and reuses a singleton on the browser. `lib/server/query-client.ts` and `lib/client/query-client.ts` both re-export from here.

**Server fetchers** (`lib/server/fetchers/`) query MongoDB directly and resolve signed R2 URLs.  
**Client queries** (`lib/client/queries/`) define `queryOptions`, `useQuery`/`useMutation` hooks, and types for each domain.

### Database — MongoDB / Mongoose

`lib/server/db.ts` manages a single cached Mongoose connection (global `_mongoose`). Models live in `lib/models/` (Property, User, Appointment, Favorite, Files, Ads, Subscription, etc.).

### Storage — Cloudflare R2

`lib/server/r2-client.ts` wraps `@aws-sdk/client-s3` for R2. File metadata is stored in the `Files` model; presigned URLs are generated per-request in server fetchers.

### Payments — eSewa

`lib/payment-provider/generateEsewaSignature.ts` handles eSewa (Nepali payment gateway) HMAC signature generation. Credentials are `ESEWA_MERCHANT_CODE` / `ESEWA_SECRET_KEY`.

### Email — Resend + React Email

Templates in `lib/emails/` are React Email components rendered server-side and sent via `resend`. `EMAIL_SENDER_ADDRESS` must be a verified domain in Resend.

### Real-time — Ably

`lib/ably.ts` and `app/ably-provider.tsx` wrap `@ably/chat` for real-time messaging. Currently disabled (commented out) in `app/providers.tsx`.

### UI

- **shadcn/ui** components in `components/ui/` (Radix primitives + Tailwind)
- **Tailwind CSS v4** — config is in `postcss.config.mjs`, no `tailwind.config.js`
- `next-themes` for dark/light mode via `components/theme-provider.tsx`
- `framer-motion` for animations, `recharts` for charts, `react-leaflet` for maps
