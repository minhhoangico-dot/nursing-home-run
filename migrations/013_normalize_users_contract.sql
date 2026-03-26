alter table if exists public.users
    add column if not exists name text,
    add column if not exists password text,
    add column if not exists floor text,
    add column if not exists avatar text,
    add column if not exists is_active boolean default true,
    add column if not exists created_at timestamptz default now(),
    add column if not exists updated_at timestamptz default now();

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'users'
          and column_name = 'full_name'
    ) then
        execute $sql$
            update public.users
            set name = coalesce(name, full_name, username, id::text)
            where name is null
        $sql$;
    else
        execute $sql$
            update public.users
            set name = coalesce(name, username, id::text)
            where name is null
        $sql$;
    end if;
end
$$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'users'
          and column_name = 'avatar_url'
    ) then
        execute $sql$
            update public.users
            set avatar = coalesce(avatar, avatar_url)
            where avatar is null
        $sql$;
    end if;
end
$$;

update public.users
set is_active = true
where is_active is null;

update public.users
set created_at = now()
where created_at is null;

update public.users
set updated_at = coalesce(updated_at, created_at, now())
where updated_at is null;

alter table if exists public.users
    alter column name set not null,
    alter column is_active set default true,
    alter column is_active set not null,
    alter column created_at set default now(),
    alter column created_at set not null,
    alter column updated_at set default now(),
    alter column updated_at set not null;
