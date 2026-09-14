-- Only the database owner may bootstrap the very first admin. No client grant.
create function private.bootstrap_first_admin(p_email text) returns uuid language plpgsql security definer set search_path='' as $$
 declare target uuid; begin
 perform pg_advisory_xact_lock(hashtext('campus-admin-mutations'));
 if exists(select 1 from public.role_assignments where role='admin') then raise exception 'An administrator already exists; use the admin workflow' using errcode='42501'; end if;
 select u.id into target from auth.users u join public.memberships m on m.user_id=u.id
 where lower(u.email)=lower(btrim(p_email)) and u.email_confirmed_at is not null and lower(u.email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$' and m.status='active';
 if target is null then raise exception 'User must complete verified college onboarding first' using errcode='22023'; end if;
 insert into public.role_assignments(user_id,role) values(target,'admin');
 insert into public.audit_events(action,target_id,details) values('first_admin_bootstrapped',target::text,jsonb_build_object('method','database_owner'));
 return target; end; $$;
revoke all on function private.bootstrap_first_admin(text) from public,anon,authenticated,service_role;

create function private.audit_content_change() returns trigger language plpgsql security definer set search_path='' as $$
 declare actor uuid; row_data jsonb; begin
 actor=(select auth.uid());
 if actor is not null then
  if tg_op='DELETE' then row_data=to_jsonb(old); else row_data=to_jsonb(new); end if;
  insert into public.audit_events(actor_id,action,target_id,details) values(actor,'content_'||lower(tg_op),row_data->>'id',jsonb_build_object('table',tg_table_name,'status',row_data->>'status'));
 end if;
 return null; end; $$;
revoke all on function private.audit_content_change() from public,anon,authenticated;
do $$ declare t text; begin
 foreach t in array array['courses','clubs','subjects','resources','notices','exam_events','reports'] loop
 execute format('create trigger audit_content after insert or update or delete on public.%I for each row execute function private.audit_content_change()',t);
 end loop;
end $$;
