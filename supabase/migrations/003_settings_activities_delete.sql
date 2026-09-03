-- ============================================================================
-- LeadSeak — Migration 003: settings, activities, account deletion
-- ============================================================================

-- 1. Add settings JSONB column to profiles for workspace preferences
alter table public.profiles
  add column if not exists settings jsonb default '{}'::jsonb;

-- 2. Activities table for real activity feed
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('discovery', 'score', 'reply', 'campaign', 'stage', 'lead', 'export')),
  title       text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id);
create index if not exists activities_user_created_idx on public.activities (user_id, created_at desc);

alter table public.activities enable row level security;

-- Drop previous policies if re-running
do $$
declare
  rec record;
begin
  for rec in
    select schemaname, tablename, policyname
    from pg_policies
    where tablename = 'activities' and schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', rec.policyname, rec.tablename);
  end loop;
end $$;

create policy "activities: select own"
  on public.activities for select
  using (user_id = auth.uid());

create policy "activities: insert own"
  on public.activities for insert
  with check (user_id = auth.uid());

create policy "activities: delete own"
  on public.activities for delete
  using (user_id = auth.uid());

-- 3. RPC function to delete the current user's account entirely.
-- Uses security definer so it can delete from auth.users via the cascade.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete avatar files from storage (handled in app layer, but clean data here)
  delete from public.activities where user_id = v_user_id;
  delete from public.lead_scores where lead_id in (select id from public.leads where user_id = v_user_id);
  delete from public.lead_searches where user_id = v_user_id;
  delete from public.leads where user_id = v_user_id;
  delete from public.campaigns where user_id = v_user_id;
  delete from public.profiles where user_id = v_user_id;

  -- Delete the auth user — this also triggers ON DELETE CASCADE for any remaining refs
  delete from auth.users where id = v_user_id;
end;
$$;
