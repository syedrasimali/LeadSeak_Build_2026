# LeadSeak

**AI-Powered Prospect Discovery & CRM** — built for the Alibaba Cloud AI Hackathon Pakistan 2026.

**Live Demo:** [leadseak.vercel.app](https://leadseak.vercel.app)

LeadSeak turns a one-line description of your ideal customer into a pipeline of qualified, scored prospects. Describe who you're looking for — *"Series A SaaS founders in Europe, 10-50 employees"* — and LeadSeak surfaces real companies, contacts, and buying signals, scored and ready for outreach.

---

## Features

- **Natural-language discovery** — describe your ICP in plain English; Exa AI translates it into structured web search and returns real companies with contact details
- **6-signal qualification engine** — every prospect is scored 0–100 across fit, signal strength, and recency, then bucketed into hot / warm / cold
- **Campaign-based pipeline** — group discovery runs into campaigns, track status (draft / active / paused / completed), and re-run discovery as markets shift
- **Smart deduplication** — domain + normalized company name matching prevents duplicate leads across runs
- **Full CRM surface** — leads table with filters (status, temperature, industry, location, search), analytics dashboard with distributions and campaign performance, profile with avatar upload
- **CSV export** — export filtered leads as CSV for outreach tools
- **Activity feed** — real-time workspace events (discovery runs, score changes, stage moves, exports) surfaced on the overview
- **Workspace settings** — persistent workspace name, region, notification preferences, and scoring thresholds
- **Command menu** — `⌘K` quick navigation across all dashboard sections
- **100-lead free tier** — hard limit enforced at discovery time, surfaced on profile and sidebar
- **Google OAuth** — one-click social sign-in alongside email/password auth
- **Animated UI** — GSAP scroll/entrance animations, Three.js particle background, polished dark theme

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, Radix UI primitives, Geist font |
| Animation | GSAP (scroll + entrance), Three.js / react-three-fiber (particle background) |
| Auth & DB | Supabase (Postgres + RLS + Storage + Auth + Google OAuth) |
| Discovery | Exa AI API |
| Notifications | Sonner toast system |
| Deployment | Vercel (auto-deploy from GitHub) |

## Architecture

```
app/
  page.tsx                 # Landing page (animated sections)
  login/ signup/           # Auth flows (email/password + Google OAuth)
  auth/callback/           # OAuth callback handler
  dashboard/
    page.tsx               # Overview — counts, charts, activity feed
    campaigns/             # Campaign CRUD + discovery trigger
    leads/                 # Leads table with filters + score cards
    analytics/             # Distributions, campaign performance
    profile/               # Avatar upload, name edit, usage meter
    settings/              # Workspace / notifications / scoring / danger zone
services/                  # Server-side data access (Supabase queries)
  exa.ts                   # Exa AI client + response normalization
  campaigns.ts             # Campaign CRUD with ownership checks
  leads.ts                 # Lead CRUD, filters, counts
  analytics.ts             # Aggregated metrics
  profiles.ts              # Profile + avatar storage
  activities.ts            # Activity feed queries
  qualification.ts         # 6-signal scoring engine
app/actions/               # Server Actions (discovery, profile, campaign mutations, notifications)
lib/
  supabase/                # Server + browser Supabase clients (SSR-safe cookies)
  motion.ts                # GSAP registration + timing utilities
  navigation.ts            # Sidebar + topbar nav config
components/
  layout/                  # Shell, sidebar, topbar, auth shell
  dashboard/               # Charts, feeds, command menu, metric cards
  ui/                      # Primitives (button, input, badge, dialog, etc.)
  three-background/        # Animated particle background
proxy.ts                   # Next.js 16 route protection (replaces middleware.ts)
```

## Security

- **Row-Level Security** on every Supabase table — users can only read/write their own rows
- **Defense-in-depth** — service layer re-checks `user_id` ownership before every update/delete, even though RLS already enforces it
- **No secrets in code** — `.env.local` is gitignored, `.env.example` ships with placeholders only
- **Auth-gated routes** — `proxy.ts` redirects unauthenticated users from `/dashboard/*` to `/login`
- **OAuth PKCE flow** — Google sign-in uses Supabase's secure PKCE authentication flow

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/syedrasimali/LeadSeak_Build_2026.git
cd LeadSeak_Build_2026
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page |
| `EXA_API_KEY` | [exa.ai](https://exa.ai) dashboard |

### 3. Set up Supabase

Run the migration in `supabase/migrations/001_init.sql` against your Supabase project (via the Supabase CLI or the SQL editor). This creates all tables (`profiles`, `campaigns`, `leads`, `lead_scores`, `lead_searches`, `activities`), RLS policies, and the storage bucket for avatars.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with any email or use Google OAuth.

## Key Flows

1. **Sign up** → land on the dashboard overview
2. **Create a campaign** → name, industry, location, keywords, target description
3. **Run discovery** → click "Discover prospects" on the campaign card; Exa returns ~10 real leads per run
4. **Review leads** → see scores, temperatures, contact details; filter by status / temperature / industry
5. **Check analytics** → lead distributions, campaign performance charts, pipeline breakdown
6. **Export leads** → download filtered leads as CSV
7. **Profile** → upload avatar, see your lead usage meter (0/100 on free tier)

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check without emit
```

## Project Structure Highlights

- **Server Actions** handle all mutations — no separate API routes needed
- **Supabase SSR** pattern with cookie-based auth that works across server and client
- **GSAP + Three.js** for cinematic animations without sacrificing performance (dynamic imports, reduced-motion support)
- **Command menu** (`⌘K`) for fast keyboard-driven navigation
- **Responsive** across desktop, tablet, and mobile with a collapsible sidebar drawer

## License

MIT
