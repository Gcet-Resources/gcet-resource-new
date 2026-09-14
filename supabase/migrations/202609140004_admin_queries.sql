create function public.admin_list_access_requests(p_status text default 'pending',p_limit integer default 100,p_offset integer default 0)
 returns table(id uuid,user_id uuid,requested_role text,club_id uuid,reason text,status text,reviewer_id uuid,reviewed_at timestamptz,created_at timestamptz,email text,display_name text)
 language plpgsql stable security definer set search_path='' as $$
 begin perform private.require_admin();
 if p_status is not null and p_status not in ('pending','approved','rejected') then raise exception 'Invalid request status' using errcode='22023'; end if;
 return query select r.id,r.user_id,r.requested_role,r.club_id,r.reason,r.status,r.reviewer_id,r.reviewed_at,r.created_at,u.email::text,p.display_name
 from public.access_requests r join auth.users u on u.id=r.user_id left join public.profiles p on p.id=r.user_id
 where p_status is null or r.status=p_status order by r.created_at,r.id
 limit greatest(1,least(coalesce(p_limit,100),200)) offset greatest(0,coalesce(p_offset,0)); end; $$;
revoke all on function public.admin_list_access_requests(text,integer,integer) from public,anon,authenticated;
grant execute on function public.admin_list_access_requests(text,integer,integer) to authenticated;

-- Staff may clean up their own unlinked draft upload, never a referenced object.
drop policy campus_resource_delete on storage.objects;
create policy campus_resource_delete on storage.objects for delete to authenticated using (
 bucket_id='resources' and (private.is_admin() or (private.can_manage_resources() and (storage.foldername(name))[1]=(select auth.uid())::text and not exists(select 1 from public.resources r where r.storage_path=name)))
);
