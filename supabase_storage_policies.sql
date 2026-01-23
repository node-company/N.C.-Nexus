-- Create a new bucket for company images
insert into storage.buckets (id, name, public)
values ('company-images', 'company-images', true);

-- Policy to allow public viewing of images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'company-images' );

-- Policy to allow authenticated users to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'company-images'
    and auth.role() = 'authenticated'
  );

-- Policy to allow users to update their own images (or all authenticated for now)
create policy "Authenticated users can update images"
  on storage.objects for update
  using (
    bucket_id = 'company-images'
    and auth.role() = 'authenticated'
  );

-- Policy to allow users to delete images
create policy "Authenticated users can delete images"
  on storage.objects for delete
  using (
    bucket_id = 'company-images'
    and auth.role() = 'authenticated'
  );
