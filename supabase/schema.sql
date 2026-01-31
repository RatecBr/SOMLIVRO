create extension if not exists "pgcrypto";

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
using (true)
with check (true);
