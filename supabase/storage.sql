insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

do $$
begin
  update storage.buckets
  set file_size_limit = 314572800
  where id = 'media';
exception
  when undefined_column then
    null;
end $$;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "media_authenticated_upload" on storage.objects;
create policy "media_authenticated_upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'media');

drop policy if exists "media_authenticated_update" on storage.objects;
create policy "media_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "media_authenticated_delete" on storage.objects;
create policy "media_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'media');
