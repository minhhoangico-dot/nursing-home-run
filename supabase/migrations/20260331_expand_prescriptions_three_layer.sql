alter table public.prescription_items
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists continuous boolean not null default false,
  add column if not exists quantity_supplied numeric not null default 0,
  add column if not exists administrations_per_day integer not null default 1,
  add column if not exists morning boolean not null default false,
  add column if not exists noon boolean not null default false,
  add column if not exists afternoon boolean not null default false,
  add column if not exists evening boolean not null default false;

alter table public.prescriptions
  add column if not exists duplicated_from_prescription_id uuid references public.prescriptions(id);

create table if not exists public.prescription_snapshots (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  version integer not null,
  snapshot_at timestamptz not null default now(),
  actor text,
  change_reason text,
  header_payload jsonb not null,
  items_payload jsonb not null,
  unique (prescription_id, version)
);

update public.prescription_items pi
set
  start_date = coalesce(pi.start_date, p.start_date, p.prescription_date),
  quantity_supplied = coalesce(nullif(pi.quantity_supplied, 0), pi.quantity, 1),
  administrations_per_day = greatest(coalesce(nullif(pi.administrations_per_day, 0), 1), 1),
  morning = case
    when not (pi.morning or pi.noon or pi.afternoon or pi.evening) then true
    else pi.morning
  end
from public.prescriptions p
where p.id = pi.prescription_id;
