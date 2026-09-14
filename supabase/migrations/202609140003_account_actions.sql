-- A short-lived, single-use server ticket binds privileged external Auth work to
-- an independently verified admin decision. The browser never receives a secret key.
create table private.account_action_tickets (
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('invite','send_sign_in','delete')), target_id uuid, email text not null,
 expires_at timestamptz not null default now()+interval '60 seconds', consumed_at timestamptz, completed_at timestamptz,
 success boolean, created_at timestamptz not null default now()
);
revoke all on private.account_action_tickets from public,anon,authenticated;
create function public.prepare_admin_account_action(p_action text,p_user_id uuid default null,p_email text default null)
 returns uuid language plpgsql security definer set search_path='' as $$
 declare target_email text; ticket uuid; begin
 perform pg_advisory_xact_lock(hashtext('campus-admin-mutations')); perform private.require_admin();
 if p_action not in ('invite','send_sign_in','delete') or p_action is null then raise exception 'Unsupported account action' using errcode='22023'; end if;
 if p_action='invite' then
  target_email=lower(btrim(p_email));
  if target_email is null or target_email !~ '^[^@[:space:]]+@galgotiacollege[.]edu$' then raise exception 'College email required' using errcode='22023'; end if;
  if exists(select 1 from auth.users where lower(email)=target_email) then raise exception 'Account already exists; use send sign-in' using errcode='22023'; end if;
 else
  select lower(email) into target_email from auth.users where id=p_user_id;
  if target_email is null or target_email !~ '^[^@[:space:]]+@galgotiacollege[.]edu$' then raise exception 'College account not found' using errcode='22023'; end if;
  if p_action='delete' then
   if p_user_id=(select auth.uid()) or exists(select 1 from public.role_assignments where user_id=p_user_id and role='admin') then raise exception 'Remove admin role separately; self-deletion is not allowed here' using errcode='42501'; end if;
   -- Fail closed across the non-transactional Auth API boundary. An API failure
   -- leaves an account suspended and can be deliberately reactivated by an admin.
   insert into public.memberships(user_id,status) values(p_user_id,'suspended') on conflict(user_id) do update set status='suspended';
  end if;
 end if;
 if exists(select 1 from private.account_action_tickets where actor_id=(select auth.uid()) and email=target_email and created_at>now()-interval '60 seconds') then raise exception 'Wait one minute before another action for this account' using errcode='P0001'; end if;
 insert into private.account_action_tickets(actor_id,action,target_id,email) values((select auth.uid()),p_action,p_user_id,target_email) returning id into ticket;
 perform private.audit('account_action_requested',coalesce(p_user_id::text,target_email),jsonb_build_object('action',p_action,'ticket_id',ticket));
 return ticket;
 end; $$;
create function public.consume_admin_account_action(p_ticket_id uuid)
 returns table(action text,target_id uuid,email text) language plpgsql security definer set search_path='' as $$
 declare ticket private.account_action_tickets; begin
 perform pg_advisory_xact_lock(hashtext('campus-admin-mutations'));
 select * into ticket from private.account_action_tickets where id=p_ticket_id for update;
 if not found or ticket.consumed_at is not null or ticket.expires_at<=now() then raise exception 'Account action expired or already used' using errcode='42501'; end if;
 if not exists(select 1 from public.memberships m join public.role_assignments r on r.user_id=m.user_id join auth.users u on u.id=m.user_id where m.user_id=ticket.actor_id and m.status='active' and r.role='admin' and u.email_confirmed_at is not null and lower(u.email) ~ '^[^@[:space:]]+@galgotiacollege[.]edu$') then raise exception 'Administrator is no longer active' using errcode='42501'; end if;
 if ticket.action='delete' and exists(select 1 from public.role_assignments where user_id=ticket.target_id and role='admin') then raise exception 'Target is an administrator' using errcode='42501'; end if;
 update private.account_action_tickets set consumed_at=now() where id=p_ticket_id;
 return query select ticket.action,ticket.target_id,ticket.email;
 end; $$;
create function public.finish_admin_account_action(p_ticket_id uuid,p_success boolean) returns void language plpgsql security definer set search_path='' as $$
 declare ticket private.account_action_tickets; begin
 select * into ticket from private.account_action_tickets where id=p_ticket_id and consumed_at is not null and completed_at is null for update;
 if not found then raise exception 'Unknown completed action' using errcode='22023'; end if;
 update private.account_action_tickets set completed_at=now(),success=p_success where id=p_ticket_id;
 insert into public.audit_events(actor_id,action,target_id,details) values(ticket.actor_id,'account_action_finished',coalesce(ticket.target_id::text,ticket.email),jsonb_build_object('action',ticket.action,'success',p_success,'ticket_id',ticket.id));
 end; $$;
revoke all on function public.prepare_admin_account_action(text,uuid,text),public.consume_admin_account_action(uuid),public.finish_admin_account_action(uuid,boolean) from public,anon,authenticated;
grant execute on function public.prepare_admin_account_action(text,uuid,text) to authenticated;
grant execute on function public.consume_admin_account_action(uuid),public.finish_admin_account_action(uuid,boolean) to service_role;
-- Do not permit a concurrent reactivation/promotion while an Auth deletion is in flight.
create function private.block_account_action_race() returns trigger language plpgsql security definer set search_path='' as $$
 declare must_guard boolean; begin
 if tg_table_name='role_assignments' then must_guard=true; else must_guard=(new.status='active'); end if;
 if must_guard and exists(select 1 from private.account_action_tickets t where t.target_id=new.user_id and t.action='delete' and t.completed_at is null and (t.consumed_at is not null or t.expires_at>now())) then
 raise exception 'Account deletion is in progress; finish or resolve it first' using errcode='42501'; end if;
 return new; end; $$;
create trigger memberships_account_action_guard before insert or update on public.memberships for each row execute function private.block_account_action_race();
create trigger roles_account_action_guard before insert or update on public.role_assignments for each row execute function private.block_account_action_race();
revoke all on function private.block_account_action_race() from public,anon,authenticated;
