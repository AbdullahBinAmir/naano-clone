-- Profile images: creator avatars, creator card banners and brand logos.
--
-- One public-read bucket. Each user can only write inside their own folder
-- (`<auth.uid()>/…`), which is what makes it safe to hand the browser direct
-- upload access. Limits are enforced by the bucket itself (2 MB, image types
-- only), not just by the UI.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-images', 'profile-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile-images: owner can upload to own folder" on storage.objects;
create policy "profile-images: owner can upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "profile-images: owner can replace own files" on storage.objects;
create policy "profile-images: owner can replace own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "profile-images: owner can delete own files" on storage.objects;
create policy "profile-images: owner can delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Owners may see (and so replace/remove) their own files. The bucket is public,
-- so image URLs already work for anonymous visitors (public cards, landing
-- page) without any select policy; nobody can list other users' folders.
drop policy if exists "profile-images: owner can see own files" on storage.objects;
create policy "profile-images: owner can see own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);
