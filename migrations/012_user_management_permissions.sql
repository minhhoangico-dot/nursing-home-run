alter table if exists public.users
    add column if not exists is_active boolean not null default true;

update public.users
set is_active = true
where is_active is null;

alter table if exists public.users
    alter column is_active set default true,
    alter column is_active set not null;

create table if not exists public.role_permissions (
    role text not null,
    module_key text not null,
    is_enabled boolean not null default true,
    updated_at timestamptz not null default now(),
    primary key (role, module_key)
);

alter table public.role_permissions enable row level security;

alter table if exists public.role_permissions
    alter column role set not null,
    alter column module_key set not null,
    alter column is_enabled set not null,
    alter column updated_at set not null;

drop policy if exists "Public access role_permissions" on public.role_permissions;
drop policy if exists "Public Access Role Permissions" on public.role_permissions;

create policy "Public Access Role Permissions"
    on public.role_permissions
    for all
    to public
    using (true)
    with check (true);

insert into public.role_permissions (role, module_key, is_enabled) values
    ('ADMIN', 'residents', true),
    ('DOCTOR', 'residents', true),
    ('SUPERVISOR', 'residents', true),
    ('ACCOUNTANT', 'residents', true),
    ('NURSE', 'residents', true),
    ('CAREGIVER', 'residents', false),
    ('ADMIN', 'rooms', true),
    ('DOCTOR', 'rooms', true),
    ('SUPERVISOR', 'rooms', true),
    ('ACCOUNTANT', 'rooms', true),
    ('NURSE', 'rooms', true),
    ('CAREGIVER', 'rooms', false),
    ('ADMIN', 'nutrition', true),
    ('DOCTOR', 'nutrition', true),
    ('SUPERVISOR', 'nutrition', true),
    ('ACCOUNTANT', 'nutrition', false),
    ('NURSE', 'nutrition', true),
    ('CAREGIVER', 'nutrition', true),
    ('ADMIN', 'visitors', true),
    ('DOCTOR', 'visitors', true),
    ('SUPERVISOR', 'visitors', true),
    ('ACCOUNTANT', 'visitors', false),
    ('NURSE', 'visitors', true),
    ('CAREGIVER', 'visitors', true),
    ('ADMIN', 'daily_monitoring', true),
    ('DOCTOR', 'daily_monitoring', true),
    ('SUPERVISOR', 'daily_monitoring', true),
    ('ACCOUNTANT', 'daily_monitoring', false),
    ('NURSE', 'daily_monitoring', true),
    ('CAREGIVER', 'daily_monitoring', false),
    ('ADMIN', 'procedures', true),
    ('DOCTOR', 'procedures', true),
    ('SUPERVISOR', 'procedures', true),
    ('ACCOUNTANT', 'procedures', false),
    ('NURSE', 'procedures', true),
    ('CAREGIVER', 'procedures', false),
    ('ADMIN', 'weight_tracking', true),
    ('DOCTOR', 'weight_tracking', true),
    ('SUPERVISOR', 'weight_tracking', true),
    ('ACCOUNTANT', 'weight_tracking', false),
    ('NURSE', 'weight_tracking', true),
    ('CAREGIVER', 'weight_tracking', false),
    ('ADMIN', 'incidents', true),
    ('DOCTOR', 'incidents', true),
    ('SUPERVISOR', 'incidents', true),
    ('ACCOUNTANT', 'incidents', false),
    ('NURSE', 'incidents', true),
    ('CAREGIVER', 'incidents', true),
    ('ADMIN', 'maintenance', true),
    ('DOCTOR', 'maintenance', true),
    ('SUPERVISOR', 'maintenance', true),
    ('ACCOUNTANT', 'maintenance', true),
    ('NURSE', 'maintenance', false),
    ('CAREGIVER', 'maintenance', false),
    ('ADMIN', 'forms', true),
    ('DOCTOR', 'forms', true),
    ('SUPERVISOR', 'forms', true),
    ('ACCOUNTANT', 'forms', false),
    ('NURSE', 'forms', true),
    ('CAREGIVER', 'forms', false),
    ('ADMIN', 'finance', true),
    ('DOCTOR', 'finance', false),
    ('SUPERVISOR', 'finance', false),
    ('ACCOUNTANT', 'finance', true),
    ('NURSE', 'finance', false),
    ('CAREGIVER', 'finance', false),
    ('ADMIN', 'settings', true),
    ('DOCTOR', 'settings', false),
    ('SUPERVISOR', 'settings', false),
    ('ACCOUNTANT', 'settings', false),
    ('NURSE', 'settings', false),
    ('CAREGIVER', 'settings', false)
on conflict (role, module_key) do update set
    is_enabled = excluded.is_enabled,
    updated_at = now();

delete from public.role_permissions rp
where not exists (
    select 1
    from (
        values
            ('ADMIN', 'residents'),
            ('DOCTOR', 'residents'),
            ('SUPERVISOR', 'residents'),
            ('ACCOUNTANT', 'residents'),
            ('NURSE', 'residents'),
            ('CAREGIVER', 'residents'),
            ('ADMIN', 'rooms'),
            ('DOCTOR', 'rooms'),
            ('SUPERVISOR', 'rooms'),
            ('ACCOUNTANT', 'rooms'),
            ('NURSE', 'rooms'),
            ('CAREGIVER', 'rooms'),
            ('ADMIN', 'nutrition'),
            ('DOCTOR', 'nutrition'),
            ('SUPERVISOR', 'nutrition'),
            ('ACCOUNTANT', 'nutrition'),
            ('NURSE', 'nutrition'),
            ('CAREGIVER', 'nutrition'),
            ('ADMIN', 'visitors'),
            ('DOCTOR', 'visitors'),
            ('SUPERVISOR', 'visitors'),
            ('ACCOUNTANT', 'visitors'),
            ('NURSE', 'visitors'),
            ('CAREGIVER', 'visitors'),
            ('ADMIN', 'daily_monitoring'),
            ('DOCTOR', 'daily_monitoring'),
            ('SUPERVISOR', 'daily_monitoring'),
            ('ACCOUNTANT', 'daily_monitoring'),
            ('NURSE', 'daily_monitoring'),
            ('CAREGIVER', 'daily_monitoring'),
            ('ADMIN', 'procedures'),
            ('DOCTOR', 'procedures'),
            ('SUPERVISOR', 'procedures'),
            ('ACCOUNTANT', 'procedures'),
            ('NURSE', 'procedures'),
            ('CAREGIVER', 'procedures'),
            ('ADMIN', 'weight_tracking'),
            ('DOCTOR', 'weight_tracking'),
            ('SUPERVISOR', 'weight_tracking'),
            ('ACCOUNTANT', 'weight_tracking'),
            ('NURSE', 'weight_tracking'),
            ('CAREGIVER', 'weight_tracking'),
            ('ADMIN', 'incidents'),
            ('DOCTOR', 'incidents'),
            ('SUPERVISOR', 'incidents'),
            ('ACCOUNTANT', 'incidents'),
            ('NURSE', 'incidents'),
            ('CAREGIVER', 'incidents'),
            ('ADMIN', 'maintenance'),
            ('DOCTOR', 'maintenance'),
            ('SUPERVISOR', 'maintenance'),
            ('ACCOUNTANT', 'maintenance'),
            ('NURSE', 'maintenance'),
            ('CAREGIVER', 'maintenance'),
            ('ADMIN', 'forms'),
            ('DOCTOR', 'forms'),
            ('SUPERVISOR', 'forms'),
            ('ACCOUNTANT', 'forms'),
            ('NURSE', 'forms'),
            ('CAREGIVER', 'forms'),
            ('ADMIN', 'finance'),
            ('DOCTOR', 'finance'),
            ('SUPERVISOR', 'finance'),
            ('ACCOUNTANT', 'finance'),
            ('NURSE', 'finance'),
            ('CAREGIVER', 'finance'),
            ('ADMIN', 'settings'),
            ('DOCTOR', 'settings'),
            ('SUPERVISOR', 'settings'),
            ('ACCOUNTANT', 'settings'),
            ('NURSE', 'settings'),
            ('CAREGIVER', 'settings')
    ) as approved(role, module_key)
    where approved.role = rp.role
      and approved.module_key = rp.module_key
);
