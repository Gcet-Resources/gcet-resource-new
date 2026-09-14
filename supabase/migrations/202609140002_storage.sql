-- A private bucket keeps draft files private. Published metadata grants anonymous
-- signed/authenticated downloads; no application server proxies the file bytes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('resources','resources',false,52428800,array['application/pdf'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy campus_resource_download on storage.objects for select to anon,authenticated using (
 bucket_id='resources' and (
  exists(select 1 from public.resources r where r.storage_path=name and r.status='published')
  or private.can_manage_resources()
 )
);
create policy campus_resource_upload on storage.objects for insert to authenticated with check (
 bucket_id='resources' and private.can_manage_resources() and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy campus_resource_replace on storage.objects for update to authenticated using (
 bucket_id='resources' and private.can_manage_resources() and (storage.foldername(name))[1]=(select auth.uid())::text
) with check (
 bucket_id='resources' and private.can_manage_resources() and (storage.foldername(name))[1]=(select auth.uid())::text
);
create policy campus_resource_delete on storage.objects for delete to authenticated using (
 bucket_id='resources' and private.is_admin()
);
