create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Public Access App Settings" on public.app_settings;
create policy "Public Access App Settings"
on public.app_settings
for all
using (true)
with check (true);
