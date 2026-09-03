-- ============================================================================
-- LeadSeak — Phase 5: database schema, RLS, indexes
-- ============================================================================
-- Apply this file in the Supabase dashboard:
--   https://supabase.com/dashboard/project/_/sql/new
-- Paste the entire contents and click Run.
--
-- Idempotent: every statement is guarded with IF NOT EXISTS / IF EXISTS so
-- re-running is safe. Existing data is preserved.
-- ============================================================================

-- citext provides case-insensitive text for email columns.
create extension if not exists citext;

-- ============================================================================
-- 0. SHARED FUNCTIONS
-- ============================================================================

-- Keep *any* table's updated_at honest — reused by every trigger below.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Auto-create a profile row whenever a new auth user is created.
-- Uses the email Supabase already has on the user record.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  name         text,
  email        citext,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists profiles_user_id_idx      on public.profiles (user_id);
create index if not exists profiles_email_idx        on public.profiles (email);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 2. CAMPAIGNS
-- ============================================================================
create table if not exists public.campaigns (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  name               text not null,
  industry           text,
  location           text,
  keywords           text,
  target_description text,
  additional_criteria text,
  status             text not null default 'draft'
                       check (status in ('draft', 'active', 'paused', 'completed')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists campaigns_user_id_idx    on public.campaigns (user_id);
create index if not exists campaigns_status_idx     on public.campaigns (status);
create index if not exists campaigns_industry_idx   on public.campaigns (industry);
create index if not exists campaigns_location_idx   on public.campaigns (location);
create index if not exists campaigns_user_status_idx on public.campaigns (user_id, status);

drop trigger if exists campaigns_touch_updated_at on public.campaigns;
create trigger campaigns_touch_updated_at
  before update on public.campaigns
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 3. LEADS
-- ============================================================================
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  campaign_id   uuid references public.campaigns(id) on delete set null,
  company_name  text not null,
  contact_name  text,
  job_title     text,
  industry      text,
  location      text,
  website       text,
  email         citext,
  phone         text,
  linkedin_url  text,
  description   text,
  source        text,
  score         smallint not null default 0 check (score between 0 and 100),
  temperature   text not null default 'cold'
                  check (temperature in ('hot', 'warm', 'cold')),
  status        text not null default 'new'
                  check (status in ('new', 'contacted', 'replied', 'qualified', 'won', 'lost')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists leads_user_id_idx                on public.leads (user_id);
create index if not exists leads_campaign_id_idx            on public.leads (campaign_id);
create index if not exists leads_user_status_idx            on public.leads (user_id, status);
create index if not exists leads_user_temperature_idx       on public.leads (user_id, temperature);
create index if not exists leads_user_score_idx             on public.leads (user_id, score desc);
create index if not exists leads_industry_idx               on public.leads (industry);
create index if not exists leads_location_idx               on public.leads (location);
create index if not exists leads_email_idx                  on public.leads (email);
create index if not exists leads_website_idx                on public.leads (website);

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 4. LEAD SEARCHES (discovery-run audit trail)
-- ============================================================================
create table if not exists public.lead_searches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  campaign_id   uuid references public.campaigns(id) on delete set null,
  query         text not null,
  status        text not null default 'pending'
                  check (status in ('pending', 'running', 'completed', 'failed')),
  result_count  integer,
  created_at    timestamptz not null default now()
);

create index if not exists lead_searches_user_id_idx      on public.lead_searches (user_id);
create index if not exists lead_searches_campaign_id_idx  on public.lead_searches (campaign_id);
create index if not exists lead_searches_user_created_idx on public.lead_searches (user_id, created_at desc);

-- ============================================================================
-- 5. LEAD SCORES (score history)
-- ============================================================================
create table if not exists public.lead_scores (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads(id) on delete cascade,
  score        smallint not null check (score between 0 and 100),
  temperature  text not null check (temperature in ('hot', 'warm', 'cold')),
  reason       text,
  created_at   timestamptz not null default now()
);

create index if not exists lead_scores_lead_id_idx      on public.lead_scores (lead_id);
create index if not exists lead_scores_lead_created_idx on public.lead_scores (lead_id, created_at desc);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================
-- Every table is owned by auth.users via user_id. Users can only touch their
-- own rows. These policies are additive — if you later add a service-role
-- helper, it bypasses RLS by design.

alter table public.profiles      enable row level security;
alter table public.campaigns     enable row level security;
alter table public.leads         enable row level security;
alter table public.lead_searches enable row level security;
alter table public.lead_scores   enable row level security;

-- Drop any previous policies we created, so re-running is safe.
do $$
declare
  rec record;
begin
  for rec in
    select schemaname, tablename, policyname
    from pg_policies
    where tablename in ('profiles', 'campaigns', 'leads', 'lead_searches', 'lead_scores')
      and schemaname = 'public'
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      rec.policyname,
      rec.tablename
    );
  end loop;
end $$;

-- profiles: one row per user, visible and editable only by that user.
create policy "profiles: select own"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "profiles: insert own"
  on public.profiles for insert
  with check (user_id = auth.uid());

create policy "profiles: update own"
  on public.profiles for update
  using (user_id = auth.uid());

-- campaigns: user sees only their own.
create policy "campaigns: select own"
  on public.campaigns for select
  using (user_id = auth.uid());

create policy "campaigns: insert own"
  on public.campaigns for insert
  with check (user_id = auth.uid());

create policy "campaigns: update own"
  on public.campaigns for update
  using (user_id = auth.uid());

create policy "campaigns: delete own"
  on public.campaigns for delete
  using (user_id = auth.uid());

-- leads: user sees only their own. A lead's campaign, if any, must also
-- belong to the same user — this blocks dangling references.
create policy "leads: select own"
  on public.leads for select
  using (user_id = auth.uid());

create policy "leads: insert own"
  on public.leads for insert
  with check (
    user_id = auth.uid()
    and (
      campaign_id is null
      or campaign_id in (select id from public.campaigns where user_id = auth.uid())
    )
  );

create policy "leads: update own"
  on public.leads for update
  using (user_id = auth.uid());

create policy "leads: delete own"
  on public.leads for delete
  using (user_id = auth.uid());

-- lead_searches: user sees only their own.
create policy "lead_searches: select own"
  on public.lead_searches for select
  using (user_id = auth.uid());

create policy "lead_searches: insert own"
  on public.lead_searches for insert
  with check (
    user_id = auth.uid()
    and (
      campaign_id is null
      or campaign_id in (select id from public.campaigns where user_id = auth.uid())
    )
  );

create policy "lead_searches: update own"
  on public.lead_searches for update
  using (user_id = auth.uid());

create policy "lead_searches: delete own"
  on public.lead_searches for delete
  using (user_id = auth.uid());

-- lead_scores: access is gated by the lead's owner. A user can only read or
-- write scores for leads they own.
create policy "lead_scores: select via lead"
  on public.lead_scores for select
  using (
    lead_id in (select id from public.leads where user_id = auth.uid())
  );

create policy "lead_scores: insert via lead"
  on public.lead_scores for insert
  with check (
    lead_id in (select id from public.leads where user_id = auth.uid())
  );

create policy "lead_scores: update via lead"
  on public.lead_scores for update
  using (
    lead_id in (select id from public.leads where user_id = auth.uid())
  );

create policy "lead_scores: delete via lead"
  on public.lead_scores for delete
  using (
    lead_id in (select id from public.leads where user_id = auth.uid())
  );

-- ============================================================================
-- Done. Schema, indexes, RLS, and the auto-profile trigger are in place.
-- ============================================================================
