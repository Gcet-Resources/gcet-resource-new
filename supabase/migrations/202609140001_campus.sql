-- Institutional identity is checked against the current Auth row, never editable JWT metadata.
create schema if not exists private;
grant usage on schema public to supabase_auth_admin;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.courses (
 id uuid primary key default gen_random_uuid(), code text not null unique check (length(btrim(code)) between 1 and 30),
 name text not null check (length(btrim(name)) between 2 and 200), department text not null default '', active boolean not null default true
);
create table public.clubs (
 id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check (length(btrim(name)) between 2 and 150), description text not null default '', active boolean not null default true
);
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (length(btrim(display_name)) between 2 and 100),
 course_id uuid references public.courses(id) on delete set null,
 academic_year smallint check (academic_year between 1 and 4), semester smallint check (semester between 1 and 8),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (academic_year is null or semester is null or (semester + 1) / 2 = academic_year)
);
create table public.memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 status text not null default 'pending' check (status in ('active','pending','suspended')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.role_assignments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('student','staff','club_head','council','admin')),
 club_id uuid references public.clubs(id) on delete cascade, created_at timestamptz not null default now(),
 check ((role = 'club_head' and club_id is not null) or (role <> 'club_head' and club_id is null))
);
create unique index role_assignments_global_unique on public.role_assignments(user_id,role) where club_id is null;
create unique index role_assignments_club_unique on public.role_assignments(user_id,role,club_id) where club_id is not null;
create table public.subjects (
 id uuid primary key default gen_random_uuid(), legacy_code text not null, year text not null check (year in ('1st','2nd','3rd','4th')),
 title text not null check (length(btrim(title)) between 1 and 250), description text not null default '',
 color text not null default '', bg_color text not null default '', course_id uuid references public.courses(id) on delete set null,
 unique(year,legacy_code)
);
create table public.resources (
 id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.subjects(id) on delete cascade,
 resource_type text not null check (length(btrim(resource_type)) between 1 and 80), legacy_id text,
 title text not null check (length(btrim(title)) between 1 and 250), description text not null default '',
 source_url text check (source_url is null or source_url = '' or source_url ~ '^https?://[^[:space:]]+$'),
 storage_path text check (storage_path is null or (length(storage_path) between 1 and 500 and storage_path !~ '(^/|\.\.|\\)')),
 provider text not null default 'external' check (provider in ('pdf','drive','external')),
 status text not null default 'draft' check (status in ('draft','published','archived')),
 sort_order integer not null default 0, created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check (status <> 'published' or nullif(btrim(source_url),'') is not null or nullif(btrim(storage_path),'') is not null)
);
create index resources_subject_idx on public.resources(subject_id,resource_type,status,sort_order);
create index resources_search_idx on public.resources using gin(to_tsvector('simple',title || ' ' || description));
create table public.notices (
 id uuid primary key default gen_random_uuid(), title text not null check (length(btrim(title)) between 2 and 250),
 body text not null check (length(btrim(body)) between 1 and 20000), category text not null default 'announcement',
 scope text not null default 'campus' check (scope in ('campus','course','club','council')),
 course_id uuid references public.courses(id) on delete restrict, club_id uuid references public.clubs(id) on delete restrict,
 academic_year smallint check (academic_year between 1 and 4),
 status text not null default 'draft' check (status in ('draft','published','archived')), important boolean not null default false,
 published_at timestamptz not null default now(), expires_at timestamptz,
 created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check ((scope = 'course' and course_id is not null and club_id is null) or (scope = 'club' and club_id is not null and course_id is null) or (scope in ('campus','council') and course_id is null and club_id is null)),
 check (expires_at is null or expires_at > published_at)
);
create index notices_feed_idx on public.notices(status,published_at desc);
create table public.exam_events (
 id uuid primary key default gen_random_uuid(), title text not null check (length(btrim(title)) between 2 and 250),
 description text not null default '', course_id uuid references public.courses(id) on delete set null,
 academic_year smallint check (academic_year between 1 and 4), starts_at timestamptz not null, ends_at timestamptz not null,
 status text not null default 'draft' check (status in ('draft','published','archived')),
 created_by uuid references auth.users(id) on delete set null, check (ends_at > starts_at)
);
create table public.favorites (
 user_id uuid not null references auth.users(id) on delete cascade, subject_id uuid not null references public.subjects(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,subject_id)
);
create table public.notice_reads (
 user_id uuid not null references auth.users(id) on delete cascade, notice_id uuid not null references public.notices(id) on delete cascade,
 read_at timestamptz not null default now(), primary key(user_id,notice_id)
);
create table public.notice_bookmarks (
 user_id uuid not null references auth.users(id) on delete cascade, notice_id uuid not null references public.notices(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,notice_id)
);
create table public.club_follows (
 user_id uuid not null references auth.users(id) on delete cascade, club_id uuid not null references public.clubs(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(user_id,club_id)
);
create table public.access_requests (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 requested_role text not null check (requested_role in ('staff','club_head','council')), club_id uuid references public.clubs(id) on delete cascade,
 reason text not null check (length(btrim(reason)) between 10 and 2000),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 reviewer_id uuid references auth.users(id) on delete set null, reviewed_at timestamptz, created_at timestamptz not null default now(),
 check ((requested_role = 'club_head' and club_id is not null) or (requested_role <> 'club_head' and club_id is null))
);
create unique index access_requests_pending_global on public.access_requests(user_id,requested_role) where status='pending' and club_id is null;
create unique index access_requests_pending_club on public.access_requests(user_id,requested_role,club_id) where status='pending' and club_id is not null;
create table public.reports (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 resource_id uuid references public.resources(id) on delete set null,
 subject text not null check (length(btrim(subject)) between 2 and 200), message text not null check (length(btrim(message)) between 10 and 5000),
 status text not null default 'open' check (status in ('open','in_progress','resolved','dismissed')), created_at timestamptz not null default now()
);
create table public.audit_events (
 id uuid primary key default gen_random_uuid(), actor_id uuid references auth.users(id) on delete set null,
 action text not null, target_id text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.import_quarantine (
 id uuid primary key, source_key text not null unique, reason text not null, payload jsonb not null, created_at timestamptz not null default now()
);

-- Helpers are private, have fixed search paths and never accept a client-supplied identity.
create function private.is_verified_college_user() returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from auth.users u where u.id = (select auth.uid()) and u.email_confirmed_at is not null
 and lower(u.email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$');
$$;
create function private.is_active_member() returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_verified_college_user() and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.status='active');
$$;
create function private.has_role(p_role text, p_club_id uuid default null) returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_active_member() and (p_role='student' or (select auth.jwt()->>'aal')='aal2')
 and exists(select 1 from public.role_assignments r where r.user_id=(select auth.uid()) and r.role=p_role and r.club_id is not distinct from p_club_id);
$$;
create function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select private.has_role('admin'); $$;
create function private.can_manage_resources() returns boolean language sql stable security definer set search_path = '' as $$ select private.is_admin() or private.has_role('staff'); $$;
create function private.can_publish_notice(p_scope text,p_club_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_admin() or (p_scope in ('campus','course') and private.has_role('staff'))
 or (p_scope='council' and private.has_role('council'))
 or (p_scope='club' and private.has_role('club_head',p_club_id) and exists(select 1 from public.clubs c where c.id=p_club_id and c.active));
$$;
create function private.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at=now(); return new; end; $$;
create function private.immutable_author() returns trigger language plpgsql set search_path = '' as $$
 begin if new.created_by is distinct from old.created_by then raise exception 'Author cannot be changed' using errcode='42501'; end if; return new; end; $$;
create trigger profiles_updated before update on public.profiles for each row execute function private.touch_updated_at();
create trigger memberships_updated before update on public.memberships for each row execute function private.touch_updated_at();
create trigger resources_updated before update on public.resources for each row execute function private.touch_updated_at();
create trigger notices_updated before update on public.notices for each row execute function private.touch_updated_at();
-- Column grants below protect authors for clients while allowing Auth FK deletion to set null.

-- Institutional-only registration, also independently enforced by every trusted helper.
create function public.before_user_created(event jsonb) returns jsonb language plpgsql set search_path = '' as $$
 begin
  if coalesce(lower(event->'user'->>'email'),'') !~ '^[^@[:space:]]+@galgotiacollege[.]edu$' then
   return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','Use your @galgotiacollege.edu email address.'));
  end if;
  return '{}'::jsonb;
 end; $$;

-- All tables deny writes until their explicit policies and grants below allow them.
do $$ declare t text; begin
 foreach t in array array['courses','clubs','profiles','memberships','role_assignments','subjects','resources','notices','exam_events','favorites','notice_reads','notice_bookmarks','club_follows','access_requests','reports','audit_events','import_quarantine'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on table public.%I from anon, authenticated',t);
 end loop;
end $$;

grant select on public.courses,public.clubs,public.subjects,public.resources,public.notices,public.exam_events to anon,authenticated;
grant select on public.profiles,public.memberships,public.role_assignments,public.favorites,public.notice_reads,public.notice_bookmarks,public.club_follows,public.access_requests,public.reports,public.audit_events,public.import_quarantine to authenticated;
grant insert,update,delete on public.courses,public.clubs,public.subjects to authenticated;
grant insert,delete on public.resources,public.notices,public.exam_events to authenticated;
grant update(subject_id,resource_type,legacy_id,title,description,source_url,storage_path,provider,status,sort_order) on public.resources to authenticated;
grant update(title,body,category,scope,course_id,club_id,academic_year,status,important,published_at,expires_at) on public.notices to authenticated;
grant update(title,description,course_id,academic_year,starts_at,ends_at,status) on public.exam_events to authenticated;
grant update(display_name,course_id,academic_year,semester) on public.profiles to authenticated;
grant insert,delete on public.favorites,public.notice_bookmarks,public.club_follows to authenticated;
grant insert,update,delete on public.notice_reads to authenticated;
grant insert on public.access_requests,public.reports to authenticated;
grant update(status) on public.reports to authenticated;

create policy courses_read on public.courses for select using(active or private.is_admin());
create policy courses_admin on public.courses for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy clubs_read on public.clubs for select using(active or private.is_admin());
create policy clubs_admin on public.clubs for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy subjects_read on public.subjects for select using(true);
create policy subjects_admin on public.subjects for all to authenticated using(private.is_admin()) with check(private.is_admin());
create policy profiles_read on public.profiles for select to authenticated using((id=(select auth.uid()) and private.is_verified_college_user()) or private.is_admin());
create policy profiles_own_update on public.profiles for update to authenticated using(id=(select auth.uid()) and private.is_active_member()) with check(id=(select auth.uid()) and private.is_active_member() and (course_id is null or exists(select 1 from public.courses c where c.id=course_id and c.active)));
create policy memberships_read on public.memberships for select to authenticated using((user_id=(select auth.uid()) and private.is_verified_college_user()) or private.is_admin());
create policy roles_read on public.role_assignments for select to authenticated using((user_id=(select auth.uid()) and private.is_verified_college_user()) or private.is_admin());
create policy resources_read on public.resources for select using((status='published' and (nullif(btrim(source_url),'') is not null or nullif(btrim(storage_path),'') is not null)) or private.can_manage_resources());
create policy resources_insert on public.resources for insert to authenticated with check(private.can_manage_resources() and created_by=(select auth.uid()));
create policy resources_update on public.resources for update to authenticated using(private.can_manage_resources()) with check(private.can_manage_resources());
create policy resources_delete on public.resources for delete to authenticated using(private.is_admin());
create policy notices_read on public.notices for select using((status='published' and published_at<=now() and (expires_at is null or expires_at>now())) or private.can_publish_notice(scope,club_id));
create policy notices_insert on public.notices for insert to authenticated with check(private.can_publish_notice(scope,club_id) and created_by=(select auth.uid()));
create policy notices_update on public.notices for update to authenticated using(private.can_publish_notice(scope,club_id)) with check(private.can_publish_notice(scope,club_id));
create policy notices_delete on public.notices for delete to authenticated using(private.can_publish_notice(scope,club_id));
create policy exams_read on public.exam_events for select using(status='published' or private.can_manage_resources());
create policy exams_insert on public.exam_events for insert to authenticated with check(private.can_manage_resources() and created_by=(select auth.uid()));
create policy exams_update on public.exam_events for update to authenticated using(private.can_manage_resources()) with check(private.can_manage_resources());
create policy exams_delete on public.exam_events for delete to authenticated using(private.can_manage_resources());
create policy favorites_own on public.favorites for all to authenticated using(user_id=(select auth.uid()) and private.is_active_member()) with check(user_id=(select auth.uid()) and private.is_active_member());
create policy bookmarks_own on public.notice_bookmarks for all to authenticated using(user_id=(select auth.uid()) and private.is_active_member()) with check(user_id=(select auth.uid()) and private.is_active_member() and exists(select 1 from public.notices n where n.id=notice_id and n.status='published' and n.published_at<=now() and (n.expires_at is null or n.expires_at>now())));
create policy reads_own on public.notice_reads for all to authenticated using(user_id=(select auth.uid()) and private.is_active_member()) with check(user_id=(select auth.uid()) and private.is_active_member() and exists(select 1 from public.notices n where n.id=notice_id and n.status='published' and n.published_at<=now() and (n.expires_at is null or n.expires_at>now())));
create policy follows_own on public.club_follows for all to authenticated using(user_id=(select auth.uid()) and private.is_active_member()) with check(user_id=(select auth.uid()) and private.is_active_member() and exists(select 1 from public.clubs c where c.id=club_id and c.active));
create policy requests_read on public.access_requests for select to authenticated using((user_id=(select auth.uid()) and private.is_active_member()) or private.is_admin());
create policy requests_insert on public.access_requests for insert to authenticated with check(user_id=(select auth.uid()) and private.is_active_member() and status='pending' and reviewer_id is null and reviewed_at is null and (club_id is null or exists(select 1 from public.clubs c where c.id=club_id and c.active)));
create policy reports_read on public.reports for select to authenticated using((user_id=(select auth.uid()) and private.is_active_member()) or private.is_admin());
create policy reports_insert on public.reports for insert to authenticated with check(user_id=(select auth.uid()) and private.is_active_member() and status='open');
create policy reports_admin_update on public.reports for update to authenticated using(private.is_admin()) with check(private.is_admin());
create policy audit_read on public.audit_events for select to authenticated using(private.is_admin());
create policy quarantine_read on public.import_quarantine for select to authenticated using(private.is_admin());

-- Schema/role mutations are reachable only through these checked transactions.
create function private.require_admin() returns void language plpgsql security definer set search_path = '' as $$
 begin if private.is_admin() is not true then raise exception 'Active administrator with MFA required' using errcode='42501'; end if; end; $$;
create function private.require_eligible_target(p_user_id uuid) returns void language plpgsql security definer set search_path = '' as $$
 begin if not exists(select 1 from auth.users u join public.memberships m on m.user_id=u.id where u.id=p_user_id and m.status='active' and u.email_confirmed_at is not null and lower(u.email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$') then raise exception 'Target must be an active verified college member' using errcode='22023'; end if; end; $$;
create function private.audit(p_action text,p_target text,p_details jsonb default '{}') returns void language sql security definer set search_path = '' as $$
 insert into public.audit_events(actor_id,action,target_id,details) values((select auth.uid()),p_action,p_target,p_details);
$$;
create function public.complete_onboarding(p_display_name text,p_course_id uuid default null,p_academic_year integer default null,p_semester integer default null) returns public.profiles language plpgsql security definer set search_path = '' as $$
 declare result public.profiles; existing_status text; begin
 if private.is_verified_college_user() is not true then raise exception 'Verify your @galgotiacollege.edu email first' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtext((select auth.uid())::text));
 select status into existing_status from public.memberships where user_id=(select auth.uid()) for update;
 if existing_status in ('suspended','pending') then raise exception 'Membership is suspended or awaiting administrator reactivation' using errcode='42501'; end if;
 if p_course_id is not null and not exists(select 1 from public.courses where id=p_course_id and active) then raise exception 'Select an active course' using errcode='22023'; end if;
 insert into public.profiles(id,display_name,course_id,academic_year,semester) values((select auth.uid()),btrim(p_display_name),p_course_id,p_academic_year,p_semester)
 on conflict(id) do update set display_name=excluded.display_name,course_id=excluded.course_id,academic_year=excluded.academic_year,semester=excluded.semester returning * into result;
 insert into public.memberships(user_id,status) values((select auth.uid()),'active') on conflict(user_id) do update set status='active';
 insert into public.role_assignments(user_id,role) values((select auth.uid()),'student') on conflict do nothing;
 return result;
 end; $$;
create function public.admin_assign_role(p_user_id uuid,p_role text,p_club_id uuid default null) returns void language plpgsql security definer set search_path = '' as $$
 begin perform pg_advisory_xact_lock(hashtext('campus-admin-mutations')); perform private.require_admin(); perform private.require_eligible_target(p_user_id);
 if p_role not in ('student','staff','club_head','council','admin') or p_role is null then raise exception 'Unknown role' using errcode='22023'; end if;
 if (p_role='club_head') <> (p_club_id is not null) then raise exception 'Only club heads require a club' using errcode='22023'; end if;
 if p_club_id is not null and not exists(select 1 from public.clubs where id=p_club_id and active) then raise exception 'Select an active club' using errcode='22023'; end if;
 insert into public.role_assignments(user_id,role,club_id) values(p_user_id,p_role,p_club_id) on conflict do nothing;
 perform private.audit('role_assigned',p_user_id::text,jsonb_build_object('role',p_role,'club_id',p_club_id)); end; $$;
create function public.admin_revoke_role(p_assignment_id uuid) returns void language plpgsql security definer set search_path = '' as $$
 declare assignment public.role_assignments; begin perform pg_advisory_xact_lock(hashtext('campus-admin-mutations')); perform private.require_admin();
 select * into assignment from public.role_assignments where id=p_assignment_id for update;
 if not found then raise exception 'Role assignment not found' using errcode='22023'; end if;
 if assignment.role='admin' and (assignment.user_id=(select auth.uid()) or (select count(*) from public.role_assignments r join public.memberships m on m.user_id=r.user_id where r.role='admin' and m.status='active')<=1) then raise exception 'Cannot remove your own or the last active admin role' using errcode='42501'; end if;
 if assignment.role='student' then raise exception 'Use membership suspension to revoke base access' using errcode='22023'; end if;
 delete from public.role_assignments where id=p_assignment_id;
 perform private.audit('role_revoked',assignment.user_id::text,jsonb_build_object('role',assignment.role,'club_id',assignment.club_id)); end; $$;
create function public.admin_set_membership(p_user_id uuid,p_status text) returns void language plpgsql security definer set search_path = '' as $$
 begin perform pg_advisory_xact_lock(hashtext('campus-admin-mutations')); perform private.require_admin();
 if p_status is null or p_status not in ('active','pending','suspended') then raise exception 'Invalid membership status' using errcode='22023'; end if;
 if p_user_id=(select auth.uid()) and p_status<>'active' then raise exception 'Cannot suspend or deactivate yourself' using errcode='42501'; end if;
 if p_status<>'active' and exists(select 1 from public.role_assignments where user_id=p_user_id and role='admin') and (select count(*) from public.role_assignments r join public.memberships m on m.user_id=r.user_id where r.role='admin' and m.status='active')<=1 then raise exception 'Cannot deactivate the last active administrator' using errcode='42501'; end if;
 if p_status='active' and not exists(select 1 from auth.users where id=p_user_id and email_confirmed_at is not null and lower(email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$') then raise exception 'Verified college email required' using errcode='22023'; end if;
 update public.memberships set status=p_status where user_id=p_user_id;
 if not found then raise exception 'Membership not found' using errcode='22023'; end if;
 perform private.audit('membership_changed',p_user_id::text,jsonb_build_object('status',p_status)); end; $$;
create function public.review_access_request(p_request_id uuid,p_approve boolean) returns void language plpgsql security definer set search_path = '' as $$
 declare request public.access_requests; begin perform pg_advisory_xact_lock(hashtext('campus-admin-mutations')); perform private.require_admin();
 select * into request from public.access_requests where id=p_request_id for update;
 if not found or request.status<>'pending' then raise exception 'Request is not pending' using errcode='22023'; end if;
 if request.user_id=(select auth.uid()) then raise exception 'Ask another administrator to review your request' using errcode='42501'; end if;
 if p_approve is null then raise exception 'Decision required' using errcode='22023'; end if;
 if p_approve then perform public.admin_assign_role(request.user_id,request.requested_role,request.club_id); end if;
 update public.access_requests set status=case when p_approve then 'approved' else 'rejected' end,reviewer_id=(select auth.uid()),reviewed_at=now() where id=p_request_id;
 perform private.audit(case when p_approve then 'access_approved' else 'access_rejected' end,p_request_id::text,jsonb_build_object('user_id',request.user_id)); end; $$;
create function public.admin_list_users(p_limit integer default 100,p_offset integer default 0,p_search text default null)
 returns table(id uuid,email text,display_name text,course_id uuid,academic_year smallint,semester smallint,status text,roles jsonb)
 language plpgsql stable security definer set search_path = '' as $$
 begin perform private.require_admin();
 return query select u.id,u.email::text,p.display_name,p.course_id,p.academic_year,p.semester,m.status,
 coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'user_id',r.user_id,'role',r.role,'club_id',r.club_id) order by r.role) from public.role_assignments r where r.user_id=u.id),'[]'::jsonb)
 from auth.users u left join public.profiles p on p.id=u.id left join public.memberships m on m.user_id=u.id
 where u.email_confirmed_at is not null and lower(u.email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$'
 and (nullif(btrim(p_search),'') is null or position(lower(left(btrim(p_search),200)) in lower(u.email || ' ' || coalesce(p.display_name,''))) > 0)
 order by u.id limit greatest(1,least(coalesce(p_limit,100),200)) offset greatest(0,coalesce(p_offset,0)); end; $$;

-- Revoke implicit PUBLIC execution, including all privileged helper routines.
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.is_verified_college_user(),private.is_active_member(),private.has_role(text,uuid),private.is_admin(),private.can_manage_resources(),private.can_publish_notice(text,uuid) to anon,authenticated;
revoke all on function public.before_user_created(jsonb) from public,anon,authenticated;
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
revoke all on function public.complete_onboarding(text,uuid,integer,integer),public.admin_assign_role(uuid,text,uuid),public.admin_revoke_role(uuid),public.admin_set_membership(uuid,text),public.review_access_request(uuid,boolean),public.admin_list_users(integer,integer,text) from public,anon,authenticated;
grant execute on function public.complete_onboarding(text,uuid,integer,integer),public.admin_assign_role(uuid,text,uuid),public.admin_revoke_role(uuid),public.admin_set_membership(uuid,text),public.review_access_request(uuid,boolean),public.admin_list_users(integer,integer,text) to authenticated;
