# LeadSeak - Setup Instructions

## Quick Start

1. **Extract the zip file:**
   ```bash
   unzip LeadSeak_Submission.zip
   cd LeadSeak
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `EXA_API_KEY` - Your Exa API key (for AI discovery)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Features Included

✅ **Lead Discovery** - AI-powered prospect discovery using Exa API
✅ **Lead Search & Filtering** - Advanced filters for temperature, status, campaign, industry, location
✅ **AI Scoring** - Rule-based scoring with 6 weighted signals (0-100 scale)
✅ **Lead Management** - Full CRM with stages (New → Contacted → Interested → Qualified → Converted/Not Interested)
✅ **Analytics** - Comprehensive analytics with charts, metrics, and insights
✅ **Export** - CSV export for leads and analytics reports
✅ **Settings** - Workspace configuration and notification preferences
✅ **Profile Management** - User profile with avatar and details
✅ **Authentication** - Email/password + Google OAuth
✅ **Password Reset** - Forgot password flow
✅ **Campaign Management** - Create and manage discovery campaigns
✅ **Dashboard** - Overview with AI insights, metrics, and activity feed
✅ **ICP Builder** - AI-assisted ideal customer profile builder

## Tech Stack

- **Framework:** Next.js 16.3.3 with App Router
- **React:** 19.2.8
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Styling:** Tailwind CSS 4 with custom design tokens
- **AI Discovery:** Exa API
- **Charts:** Custom React components
- **Animations:** GSAP + Framer Motion

## Project Structure

```
LeadSeak/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/             # Authentication
│   ├── signup/            # Registration
│   └── actions/           # Server actions
├── components/            # React components
│   ├── dashboard/        # Dashboard UI
│   ├── landing/          # Landing page
│   └── ui/               # Reusable UI components
├── services/             # Data fetching & business logic
├── hooks/                # Custom React hooks
├── lib/                  # Utilities & helpers
└── types/                # TypeScript types
```

## Database Setup

The project requires a Supabase database with the following tables:
- `profiles` - User profiles
- `campaigns` - Discovery campaigns
- `leads` - Prospect leads
- `activities` - Activity feed
- `lead_qualifications` - AI qualification data

Run the SQL migrations from `supabase/migrations/` to set up the schema.

## Notes for Hackathon Judges

This is a working prototype demonstrating:
- Full-stack Next.js 16 with App Router
- Secure authentication with Supabase
- AI-powered lead discovery
- Rule-based lead scoring system
- Responsive dark-theme UI
- Data visualization and analytics
- CSV export functionality

All features are functional and connected to a real database.

## Support

For questions or issues, refer to:
- `AGENTS.md` - Development guidelines
- `.env.example` - Required environment variables
- `supabase/migrations/` - Database schema
