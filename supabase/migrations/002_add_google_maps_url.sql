alter table public.leads
  add column if not exists google_maps_url text;
