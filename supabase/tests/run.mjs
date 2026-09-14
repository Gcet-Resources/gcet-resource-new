import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImport } from '../../scripts/import-catalog.mjs';
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const db = new PGlite();
let tests=0;
const ids=Object.fromEntries(['student','other','staff','head','council','admin','admin2','unverified','external','new','suspended'].map((name,i)=>[name,`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`]));
const clubA='10000000-0000-4000-8000-000000000001',clubB='10000000-0000-4000-8000-000000000002';
const subject='20000000-0000-4000-8000-000000000001';
async function query(sql,params=[]) { return (await db.query(sql,params)).rows; }
async function actor(name,aal,fn) {
 await db.exec('begin');
 try { await db.exec(`set local role ${name==='guest'?'anon':name==='service'?'service_role':'authenticated'}`); await query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:ids[name]??'',aal,role:name==='guest'?'anon':'authenticated'})]); const value=await fn(); await db.exec('commit'); return value; }
 catch(error) { await db.exec('rollback'); throw error; }
}
async function ok(name,fn) { await fn(); console.log(`PASS ${name}`);tests++; }
async function denied(name,fn,pattern) { await ok(name,async()=>{await assert.rejects(fn,pattern);}); }
try {
 await db.exec(await readFile(resolve(root,'supabase/tests/bootstrap.sql'),'utf8'));
 for(const file of (await readdir(resolve(root,'supabase/migrations'))).filter(f=>f.endsWith('.sql')).sort()) await db.exec(await readFile(resolve(root,'supabase/migrations',file),'utf8'));
 await ok('all migrations execute in Postgres',async()=>assert.equal((await query("select count(*)::int as n from pg_tables where schemaname='public'"))[0].n,17));
 for(const [name,id] of Object.entries(ids)) await query('insert into auth.users values($1,$2,$3)',[id,`${name}@${name==='external'?'example.com':'galgotiacollege.edu'}`,name==='unverified'?null:new Date().toISOString()]);
 await query('insert into public.clubs(id,slug,name) values($1,\'club-a\',\'Club A\'),($2,\'club-b\',\'Club B\')',[clubA,clubB]);
 await query('insert into public.subjects(id,legacy_code,year,title) values($1,\'TEST\',\'1st\',\'Test subject\')',[subject]);
 for(const name of ['student','other','staff','head','council','admin','admin2','suspended']) await actor(name,'aal1',()=>query("select public.complete_onboarding('Test User')"));
 for(const [name,role,club] of [['staff','staff',null],['head','club_head',clubA],['council','council',null],['admin','admin',null],['admin2','admin',null]]) await query('insert into public.role_assignments(user_id,role,club_id) values($1,$2,$3)',[ids[name],role,club]);
 await query("update public.memberships set status='suspended' where user_id=$1",[ids.suspended]);
 await ok('hook rejects external and suffix-confusion emails',async()=>{for(const email of ['person@example.com','a@galgotiacollege.edu.evil.test','a@@galgotiacollege.edu','a b@galgotiacollege.edu']) assert.ok((await query('select public.before_user_created($1) as result',[{user:{email}}]))[0].result.error); assert.deepEqual((await query('select public.before_user_created($1) as result',[{user:{email:'Student@galgotiacollege.edu'}}]))[0].result,{});});
 for(const name of ['unverified','external']) await denied(`${name} cannot onboard`,()=>actor(name,'aal1',()=>query("select public.complete_onboarding('Test User')")),/Verify/);
 await denied('suspended cannot reactivate via onboarding',()=>actor('suspended','aal1',()=>query("select public.complete_onboarding('Test User')")),/suspended/);
 await denied('invalid semester-year combination rejected',()=>actor('student','aal1',()=>query("select public.complete_onboarding('Test User',null,1,8)")),/check constraint/);
 await ok('onboarding creates only student and is idempotent',async()=>{await actor('new','aal1',()=>query("select public.complete_onboarding('New Student')"));await actor('new','aal1',()=>query("select public.complete_onboarding('New Student')"));assert.deepEqual(await query('select role from public.role_assignments where user_id=$1',[ids.new]),[{role:'student'}]);});
 await ok('own role/profile visible at aal1 but other profiles hidden',()=>actor('staff','aal1',async()=>{assert.equal((await query('select * from public.profiles')).length,1);assert.equal((await query('select * from public.role_assignments')).length,2);}));
 await denied('client cannot self-assign role',()=>actor('student','aal2',()=>query("insert into public.role_assignments(user_id,role) values($1,'admin')",[ids.student])),/permission denied/);
 await denied('client cannot fabricate audit event',()=>actor('admin','aal2',()=>query("insert into public.audit_events(action,target_id) values('fake','test')")),/permission denied/);
 await denied('student cannot use admin RPC with claimed metadata',()=>actor('student','aal2',()=>query('select public.admin_list_users()')),/administrator/);
 await denied('admin aal1 cannot use privileged RPC',()=>actor('admin','aal1',()=>query('select public.admin_list_users()')),/MFA/);
 await ok('admin aal2 list uses bounded search',()=>actor('admin','aal2',async()=>{assert.equal((await query("select * from public.admin_list_users(10,0,'student@')")).length,1);assert.equal((await query("select * from public.admin_list_users(1,0,null)")).length,1);}));
 await ok('student reads and mutates only own favorite',()=>actor('student','aal1',async()=>{await query('insert into public.favorites(user_id,subject_id) values($1,$2)',[ids.student,subject]);assert.equal((await query('select * from public.favorites')).length,1);}));
 await denied('cross-user favorite write denied',()=>actor('other','aal1',()=>query('insert into public.favorites(user_id,subject_id) values($1,$2)',[ids.student,subject])),/row-level security/);
 await ok('cross-user favorite read hidden',()=>actor('other','aal1',async()=>assert.equal((await query('select * from public.favorites')).length,0)));
 await denied('suspended user cannot favorite',()=>actor('suspended','aal1',()=>query('insert into public.favorites(user_id,subject_id) values($1,$2)',[ids.suspended,subject])),/row-level security/);
 await ok('request submission',()=>actor('student','aal1',()=>query("insert into public.access_requests(id,user_id,requested_role,reason) values('30000000-0000-4000-8000-000000000001',$1,'council','I help coordinate campus events')",[ids.student])));
 await denied('requester cannot preapprove request',()=>actor('other','aal1',()=>query("insert into public.access_requests(user_id,requested_role,reason,status) values($1,'staff','I teach useful lessons','approved')",[ids.other])),/row-level security/);
 await ok('admin request review grants role and writes audit atomically',()=>actor('admin','aal2',async()=>{await query("select public.review_access_request('30000000-0000-4000-8000-000000000001',true)");assert.equal((await query("select * from public.access_requests where status='approved'")).length,1);assert.equal((await query("select * from public.role_assignments where user_id=$1 and role='council'",[ids.student])).length,1);}));
 await denied('repeat review cannot grant duplicate role',()=>actor('admin','aal2',()=>query("select public.review_access_request('30000000-0000-4000-8000-000000000001',true)")),/not pending/);
 const noticeSql="insert into public.notices(title,body,scope,club_id,status,created_by) values('Notice title','Useful notice body',$1,$2,'draft',$3) returning id";
 await ok('club head can publish own club draft with MFA',()=>actor('head','aal2',()=>query(noticeSql,['club',clubA,ids.head])));
 await denied('club head cannot cross club boundary',()=>actor('head','aal2',()=>query(noticeSql,['club',clubB,ids.head])),/row-level security/);
 await denied('club head cannot publish campus scope',()=>actor('head','aal2',()=>query(noticeSql,['campus',null,ids.head])),/row-level security/);
 await denied('club head cannot publish at aal1',()=>actor('head','aal1',()=>query(noticeSql,['club',clubA,ids.head])),/row-level security/);
 await ok('council posts limited to council scope',()=>actor('council','aal2',()=>query(noticeSql,['council',null,ids.council])));
 await denied('council cannot publish campus scope',()=>actor('council','aal2',()=>query(noticeSql,['campus',null,ids.council])),/row-level security/);
 await denied('notice author cannot be forged',()=>actor('staff','aal2',()=>query(noticeSql,['campus',null,ids.admin])),/row-level security/);
 await ok('draft notices hidden from public',()=>actor('guest','aal1',async()=>assert.equal((await query('select * from public.notices')).length,0)));
 await query("insert into public.notices(title,body,status,published_at,expires_at) values('Public now','Body','published',now()-interval '1 hour',null),('Future','Body','published',now()+interval '1 day',null),('Expired','Body','published',now()-interval '2 days',now()-interval '1 day')");
 await ok('publication schedule and expiry enforced in RLS',()=>actor('guest','aal1',async()=>assert.deepEqual((await query('select title from public.notices')),[{title:'Public now'}])));
 await ok('suspension denies old MFA session privilege',async()=>{await actor('admin','aal2',()=>query("select public.admin_set_membership($1,'suspended')",[ids.staff]));await denied('suspended staff cannot post',()=>actor('staff','aal2',()=>query(noticeSql,['campus',null,ids.staff])),/row-level security/);});
 await denied('admin cannot deactivate self',()=>actor('admin','aal2',()=>query("select public.admin_set_membership($1,'suspended')",[ids.admin])),/yourself/);
 await denied('admin cannot revoke own admin role',()=>actor('admin','aal2',()=>query("select public.admin_revoke_role((select id from public.role_assignments where user_id=$1 and role='admin'))",[ids.admin])),/own or the last/);
 await ok('current Auth email checked despite existing membership',async()=>{await query("update auth.users set email='other@evil.test' where id=$1",[ids.other]);await actor('other','aal2',async()=>assert.equal((await query('select * from public.profiles')).length,0));});
 await ok('storage draft access denied to public; published access granted',async()=>{await query("insert into storage.objects(bucket_id,name) values('resources','test/published.pdf'),('resources','test/draft.pdf')");await query("insert into public.resources(subject_id,resource_type,title,storage_path,status) values($1,'pdf-notes','Published','test/published.pdf','published'),($1,'pdf-notes','Draft','test/draft.pdf','draft')",[subject]);await actor('guest','aal1',async()=>assert.deepEqual((await query('select name from storage.objects')),[{name:'test/published.pdf'}]));});
 await denied('student cannot upload resource',()=>actor('student','aal2',()=>query("insert into storage.objects(bucket_id,name) values('resources',$1)",[`${ids.student}/file.pdf`])),/row-level security/);
 await denied('admin account deletion cannot target admin',()=>actor('admin','aal2',()=>query("select public.prepare_admin_account_action('delete',$1)",[ids.admin2])),/admin role/);
 let ticket;
 await ok('account deletion ticket suspends target',async()=>{ticket=(await actor('admin','aal2',()=>query("select public.prepare_admin_account_action('delete',$1) as id",[ids.new])))[0].id;assert.equal((await query('select status from public.memberships where user_id=$1',[ids.new]))[0].status,'suspended');});
 await denied('deletion-in-flight prevents reactivation',()=>actor('admin','aal2',()=>query("select public.admin_set_membership($1,'active')",[ids.new])),/deletion is in progress/);
 await denied('browser cannot consume privileged ticket',()=>actor('admin','aal2',()=>query('select * from public.consume_admin_account_action($1)',[ticket])),/permission denied/);
 await ok('service consumes checked ticket',()=>actor('service','aal2',async()=>assert.equal((await query('select * from public.consume_admin_account_action($1)',[ticket]))[0].target_id,ids.new)));
 await denied('ticket cannot be replayed',()=>actor('service','aal2',()=>query('select * from public.consume_admin_account_action($1)',[ticket])),/already used/);
 await ok('failed deletion can be explicitly reactivated after audited finalization',async()=>{await actor('service','aal2',()=>query('select public.finish_admin_account_action($1,false)',[ticket]));await actor('admin','aal2',()=>query("select public.admin_set_membership($1,'active')",[ids.new]));});

 await denied('missing aal claim fails closed for administrator RPC',()=>actor('admin',undefined,()=>query('select public.admin_list_users()')),/MFA/);
 await ok('admin access queue includes identity only after MFA',()=>actor('admin','aal2',async()=>{const rows=await query('select * from public.admin_list_access_requests(null)');assert.equal(rows[0].email,'student@galgotiacollege.edu');}));
 await denied('access queue RPC denied without MFA',()=>actor('admin','aal1',()=>query('select * from public.admin_list_access_requests()')),/MFA/);
 await denied('bootstrap first admin unavailable to clients',()=>actor('student','aal2',()=>query("select private.bootstrap_first_admin('student@galgotiacollege.edu')")),/permission denied/);
 await ok('role demotion defeats stale aal2 session',async()=>{await actor('admin','aal2',()=>query("select public.admin_revoke_role((select id from public.role_assignments where user_id=$1 and role='admin'))",[ids.admin2]));await denied('demoted admin loses direct RPC access',()=>actor('admin2','aal2',()=>query('select * from public.admin_list_users()')),/administrator/);});
 await ok('enrolled optional student MFA enforced for private writes',async()=>{await query("insert into auth.mfa_factors(user_id,status,factor_type) values($1,'verified','totp')",[ids.new]);await denied('student factor requires step-up',()=>actor('new','aal1',()=>query('insert into public.club_follows(user_id,club_id) values($1,$2)',[ids.new,clubA])),/row-level security/);await actor('new','aal1',async()=>assert.equal((await query('select * from public.profiles')).length,1));await actor('new','aal2',()=>query('insert into public.club_follows(user_id,club_id) values($1,$2)',[ids.new,clubA]));});
 await denied('missing aal cannot bypass enrolled MFA onboarding',()=>actor('new',undefined,()=>query("select public.complete_onboarding('New Student')")),/MFA/);
 await denied('onboarding cannot bypass enrolled MFA',()=>actor('new','aal1',()=>query("select public.complete_onboarding('New Student')")),/MFA/);
 await ok('failure rolls back approval, membership grant and audit together',async()=>{
  await actor('new','aal2',()=>query("insert into public.access_requests(id,user_id,requested_role,reason) values('30000000-0000-4000-8000-000000000002',$1,'staff','I would like to support the college')",[ids.new]));
  await db.exec("create function private.test_fail_audit() returns trigger language plpgsql as $$ begin if new.action='access_approved' then raise exception 'Simulated audit failure'; end if; return new; end; $$; create trigger test_fail_audit before insert on public.audit_events for each row execute function private.test_fail_audit();");
  await denied('simulated review failure surfaces',()=>actor('admin','aal2',()=>query("select public.review_access_request('30000000-0000-4000-8000-000000000002',true)")),/Simulated audit failure/);
  assert.equal((await query("select status from public.access_requests where id='30000000-0000-4000-8000-000000000002'"))[0].status,'pending');
  assert.equal((await query("select * from public.role_assignments where user_id=$1 and role='staff'",[ids.new])).length,0);
  await db.exec('drop trigger test_fail_audit on public.audit_events; drop function private.test_fail_audit();');
 });
 await ok('import counts reconcile, stay deterministic and are idempotent',async()=>{const first=await buildImport(),second=await buildImport();assert.equal(first.sql,second.sql);assert.deepEqual([first.report.subjects,first.report.resources,first.report.quarantinedChapters,first.report.sourceChapters],[153,892,114,1006]);await db.exec(first.sql);const count=(await query('select count(*)::int as n from public.resources'))[0].n;await db.exec(second.sql);assert.equal((await query('select count(*)::int as n from public.resources'))[0].n,count);assert.equal((await query('select count(*)::int as n from public.import_quarantine'))[0].n,114);assert.equal((await query('select count(*)::int as n from public.subjects where course_id is not null'))[0].n,0);});
 console.log(`\n${tests} database/import checks passed. Hosted Auth/Storage HTTP and parallel transaction behavior require staging verification.`);
} catch (error) { console.error('FAIL',error.message, error.where ?? '', error.detail ?? ''); process.exitCode=1; } finally { await db.close(); }
