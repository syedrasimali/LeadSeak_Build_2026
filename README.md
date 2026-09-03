# LeadSeak

**AI-Powered Prospect Discovery & CRM** — built for the Alibaba Cloud AI Hackathon Pakistan 2026.

LeadSeak turns a one-line description of your ideal customer into a pipeline of qualified, scored prospects. Describe who you're looking for ("Series A SaaS founders in Europe, 10-50 employees"), and LeadSeak surfaces real companies, contacts, and buying signals — scored and ready to outreach.

## What it does

- **Natural-language discovery** — describe your ICP in plain English; Exa AI translates it into structured web search and returns real companies
- **6-signal qualification engine** — every prospect is scored 0-100 across fit, signal strength, and recency, then bucketed into hot/warm/cold
- **Campaign-based pipeline** — group discovery runs into campaigns, track status (draft/active/paused/completed), and re-run discovery as markets shift
- **Deduplication** — domain + normalized company name matching prevents duplicate leads across runs
- **Full CRM surface** — leads list with filters (status, temperature, industry, location, search), analytics dashboard with distributions and campaign performance, profile with avatar upload
- **100-lead free tier** — hard limit enforced at discovery time, surfaced on profile and in the sidebar

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack, Server Actions) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, Radix UI primitives, Geist font |
| Animation | GSAP (scroll + entrance), Three.js / react-three-fiber (particle background) |
| Auth & DB | Supabase (Postgres + RLS + Storage + Auth) |
| Discovery | Exa AI API |
| Toast | Sonner |

## Architecture

```
app/
  page.tsx                 # Landing page (animated sections)
  login/ signup/           # Auth flows (Supabase email/password)
  dashboard/
    page.tsx               # Overview — counts, charts, recent activity
    campaigns/             # Campaign CRUD + discovery trigger
    leads/                 # Leads table with filters + score cards
    analytics/             # Distributions, campaign performance
    profile/               # Avatar upload, name edit, usage meter
    settings/              # Workspace / notifications / danger zone
services/                  # Server-side data access (Supabase queries)
  exa.ts                   # Exa AI client + response normalization
  campaigns.ts             # Campaign CRUD with ownership checks
  leads.ts                 # Lead CRUD, filters, counts
  analytics.ts             # Aggregated metrics
  profiles.ts              # Profile + avatar storage
  qualification.ts         # 6-signal scoring engine
app/actions/               # Server Actions (discovery, profile, campaign mutations)
lib/supabase/              # Server + browser Supabase clients (SSR-safe cookies)
components/                # UI primitives + dashboard components
proxy.ts                   # Next.js 16 route protection (replaces middleware.ts)
```

## Security

- **Row-Level Security** on every Supabase table — users can only read/write their own rows
- **Defense-in-depth** — service layer re-checks `user_id` ownership before every update/delete, even though RLS already enforces it
- **No secrets in code** — `.env.local` is gitignored, `.env.example` ships with placeholders only
- **Auth-gated routes** — `proxy.ts` redirects unauthenticated users from `/dashboard/*` to `/login`
- **Temp files gitignored** — `.tmp/` directory (used by seed scripts) is excluded from version control

## Getting started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd leadseak
npm install
```

### 2. Configure environment

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

You need:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page |
| `EXA_API_KEY` | https://exa.ai dashboard |
| `SEED_EMAIL` / `SEED_PASSWORD` | Any Supabase auth account (for seeding) |

### 3. Set up Supabase

Run the migrations in `supabase/migrations/` against your Supabase project (either via the Supabase CLI or the SQL editor in the dashboard). This creates the tables: `profiles`, `campaigns`, `leads`, `lead_scores`, plus RLS policies and the `storage` bucket for avatars.

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. Sign up with any email — confirmation is auto-handled in dev mode.

## Key flows to try

1. **Sign up** → land on empty dashboard
2. **Create a campaign** → give it a name, industry, location, keywords
3. **Run discovery** → click "Discover prospects" on the campaign card; Exa returns ~10 real leads per run
4. **View leads** → see scores, temperatures, contact details; filter by status/temperature/industry
5. **Check analytics** → distributions, campaign performance charts, pipeline breakdown
6. **Profile** → upload avatar, see your 0/100 lead usage meter

## Known limitations (hackathon scope)

- Settings page renders but is non-functional (hardcoded workspace name, no persistence)
- Activity feed on overview uses demo data (not wired to real events yet)
- Export buttons and "Scoring rules" button are UI-only
- Google social login is disabled (placeholder for next phase)
- Delete workspace dialog shows a confirmation toast but does not actually delete

These are intentional phase-1 scope decisions — the core discovery → qualification → pipeline loop is fully functional end-to-end.

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript check without emit
```

## License

MIT
