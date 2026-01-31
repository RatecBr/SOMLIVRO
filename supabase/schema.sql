create extension if not exists "pgcrypto";

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  created_by uuid
);

alter table public.admin_users enable row level security;

create or replace function public.is_root_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.current_email() = 'marx.jane.menezes@gmail.com'
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.is_root_admin()
  or exists (
    select 1
    from public.admin_users au
    where lower(au.email) = public.current_email()
  )
$$;

create or replace function public.grant_admin(email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_root_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.admin_users (email, created_by)
  values (lower(trim(email)), auth.uid())
  on conflict (email) do update set email = excluded.email;
end;
$$;

create or replace function public.revoke_admin(email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_root_admin() then
    raise exception 'not authorized';
  end if;

  delete from public.admin_users
  where lower(admin_users.email) = lower(trim(email));
end;
$$;

drop policy if exists "admin_users_root_select" on public.admin_users;
create policy "admin_users_root_select"
on public.admin_users
for select
to authenticated
using (public.is_root_admin());

drop policy if exists "admin_users_root_write" on public.admin_users;
create policy "admin_users_root_write"
on public.admin_users
for all
to authenticated
using (public.is_root_admin())
with check (public.is_root_admin());

create table if not exists public.audiobooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  cover_image_url text,
  audio_file_url text not null,
  duration text,
  categories int4[],
  category int4 not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.audiobooks
  add column if not exists author text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_audiobooks_updated_at on public.audiobooks;
create trigger trg_audiobooks_updated_at
before update on public.audiobooks
for each row execute function public.set_updated_at();

alter table public.audiobooks enable row level security;

drop policy if exists "audiobooks_select_public" on public.audiobooks;
create policy "audiobooks_select_public"
on public.audiobooks
for select
to anon, authenticated
using (true);

drop policy if exists "audiobooks_write_authenticated" on public.audiobooks;
create policy "audiobooks_write_authenticated"
on public.audiobooks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
