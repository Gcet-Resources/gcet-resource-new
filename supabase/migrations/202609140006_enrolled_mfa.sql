-- A student who opts into MFA receives an actual second-factor boundary for
-- private account operations. Own profile/membership/roles remain readable at
-- aal1 so the app can route to MFA enrollment/challenge without a lockout loop.
create function private.has_account_assurance() returns boolean language sql stable security definer set search_path='' as $$
 select (select auth.jwt()->>'aal')='aal2' or not exists(select 1 from auth.mfa_factors f where f.user_id=(select auth.uid()) and f.status='verified');
$$;
create or replace function private.is_active_member() returns boolean language sql stable security definer set search_path='' as $$
 select private.is_verified_college_user() and private.has_account_assurance() and exists(select 1 from public.memberships m where m.user_id=(select auth.uid()) and m.status='active');
$$;
revoke all on function private.has_account_assurance() from public,anon,authenticated;
-- Onboarding can precede membership creation, so it checks assurance separately.
create or replace function public.complete_onboarding(p_display_name text,p_course_id uuid default null,p_academic_year integer default null,p_semester integer default null) returns public.profiles language plpgsql security definer set search_path='' as $$
 declare result public.profiles; existing_status text; begin
 if private.is_verified_college_user() is not true then raise exception 'Verify your @galgotiacollege.edu email first' using errcode='42501'; end if;
 if private.has_account_assurance() is not true then raise exception 'Complete your enrolled MFA challenge' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtext((select auth.uid())::text));
 select status into existing_status from public.memberships where user_id=(select auth.uid()) for update;
 if existing_status in ('suspended','pending') then raise exception 'Membership is suspended or awaiting administrator reactivation' using errcode='42501'; end if;
 if p_course_id is not null and not exists(select 1 from public.courses where id=p_course_id and active) then raise exception 'Select an active course' using errcode='22023'; end if;
 insert into public.profiles(id,display_name,course_id,academic_year,semester) values((select auth.uid()),btrim(p_display_name),p_course_id,p_academic_year,p_semester)
 on conflict(id) do update set display_name=excluded.display_name,course_id=excluded.course_id,academic_year=excluded.academic_year,semester=excluded.semester returning * into result;
 insert into public.memberships(user_id,status) values((select auth.uid()),'active') on conflict(user_id) do update set status='active';
 insert into public.role_assignments(user_id,role) values((select auth.uid()),'student') on conflict do nothing;
 return result; end; $$;
