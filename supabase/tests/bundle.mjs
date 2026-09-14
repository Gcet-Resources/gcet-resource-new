import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle } from '../../scripts/build-supabase-bundle.mjs';
const { PGlite }=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const bootstrap=await readFile(resolve(root,'supabase/tests/bootstrap.sql'),'utf8');
const legacyMigration=await readFile(resolve(root,'supabase/migrations/202609150007_legacy_campus.sql'),'utf8');
const legacyNotices=JSON.parse(await readFile(resolve(root,'frontend/src/data/notices.json'),'utf8'));
const legacyExams=JSON.parse(await readFile(resolve(root,'frontend/src/data/exam-calendar.json'),'utf8')).exams;
const bundle=await buildBundle();
const db=new PGlite();
let checks=0;
async function pass(name,fn){await fn();console.log('PASS',name);checks++;}
try {
 await db.exec(bootstrap);
 await pass('transactional bundle applies every migration and catalog',async()=>{await db.exec(bundle.sql);assert.equal((await db.query('select count(*)::int as n from supabase_migrations.schema_migrations')).rows[0].n,7);assert.equal((await db.query('select count(*)::int as n from public.resources')).rows[0].n,892);});
 await pass('legacy campus drafts preserve descriptions, links and original IST dates without authors',async()=>{
  const notices=(await db.query('select * from public.notices order by id')).rows;
  const exams=(await db.query('select * from public.exam_events order by id')).rows;
  assert.equal(notices.length,3);assert.equal(exams.length,2);
  const noticeDates=['2025-12-20T17:30:00+05:30','2026-01-15T10:00:00+05:30','2026-06-01T14:00:00+05:30'];
  for(const [index,original] of legacyNotices.entries()){
   const row=notices[index];assert.equal(row.title,original.title);assert.equal(row.category,original.category);assert.equal(row.important,original.important);
   assert.ok(row.body.includes(original.description));assert.ok(row.body.includes(original.link));assert.equal(row.status,'draft');assert.equal(row.created_by,null);
   for(const field of ['published_at','created_at','updated_at'])assert.equal(new Date(row[field]).getTime(),Date.parse(noticeDates[index]));
  }
  for(const [index,original] of legacyExams.entries()){
   const row=exams[index];assert.equal(row.title,original.name);assert.ok(row.description.includes(original.description));if(original.link)assert.ok(row.description.includes(original.link));assert.equal(row.status,'draft');assert.equal(row.created_by,null);
   assert.equal(new Date(row.starts_at).getTime(),Date.parse(original.startDate+'+05:30'));assert.equal(new Date(row.ends_at).getTime(),Date.parse(original.endDate+'+05:30'));
  }
  await db.exec('set role anon');
  try{assert.equal((await db.query('select * from public.notices')).rows.length,0);assert.equal((await db.query('select * from public.exam_events')).rows.length,0);}finally{await db.exec('reset role');}
 });
 await pass('same bundle is idempotent and preserves subsequent content edits',async()=>{await db.exec("update public.resources set title='Edited after import' where id=(select id from public.resources limit 1)");await db.exec(bundle.sql);assert.equal((await db.query("select count(*)::int as n from public.resources where title='Edited after import'")).rows[0].n,1);assert.equal((await db.query('select count(*)::int as n from public.resources')).rows[0].n,892);});
 await pass('legacy import preserves administrator edits and does not duplicate drafts',async()=>{
  await db.exec("update public.notices set title='Notice reviewed by administrator' where id='90fc573d-0354-42d2-8e1c-83bb393fca01';update public.exam_events set title='Exam reviewed by administrator' where id='7e2c2288-9eb9-4505-880a-a2826dbaea01'");
  await db.exec(legacyMigration);await db.exec(bundle.sql);
  assert.equal((await db.query('select count(*)::int as n from public.notices')).rows[0].n,3);assert.equal((await db.query('select count(*)::int as n from public.exam_events')).rows[0].n,2);
  assert.equal((await db.query("select title from public.notices where id='90fc573d-0354-42d2-8e1c-83bb393fca01'")).rows[0].title,'Notice reviewed by administrator');
  assert.equal((await db.query("select title from public.exam_events where id='7e2c2288-9eb9-4505-880a-a2826dbaea01'")).rows[0].title,'Exam reviewed by administrator');
 });
 await pass('CLI history includes exact version/name/statements plus checked digest',async()=>{const result=await db.query('select m.version,m.name,array_length(m.statements,1) as n,c.sha256 from supabase_migrations.schema_migrations m join supabase_migrations.gcet_bundle_checksums c using(version) order by version');assert.deepEqual(result.rows.map(({version,name,sha256})=>({version,name,sha256})),bundle.versions);assert.ok(result.rows.every(r=>r.n===1));});
 await pass('changed applied migration is rejected without partial writes',async()=>{await assert.rejects(()=>db.exec(bundle.sql.replace(bundle.versions[0].sha256,'0'.repeat(64))),/checksum changed/);await db.exec('rollback');assert.equal((await db.query('select count(*)::int as n from public.resources')).rows[0].n,892);});
 await pass('unrecognized existing CLI history fails closed',async()=>{await db.exec(`delete from supabase_migrations.gcet_bundle_checksums where version='${bundle.versions[0].version}'`);await assert.rejects(()=>db.exec(bundle.sql),/without a GCET checksum/);await db.exec('rollback');});
} catch(error){console.error('FAIL',error.message,error.where??'');process.exitCode=1;} finally{await db.close();}
const empty=new PGlite();
try {
 await empty.exec(bootstrap);
 await pass('apply failure rolls back all schema and history creation',async()=>{const broken=bundle.sql.replace('  EXECUTE migration_sql;','  EXECUTE migration_sql; RAISE EXCEPTION \'Simulated apply failure\';');await assert.rejects(()=>empty.exec(broken),/Simulated apply failure/);await empty.exec('rollback');assert.equal((await empty.query("select count(*)::int as n from pg_tables where schemaname='public'")).rows[0].n,0);assert.equal((await empty.query("select count(*)::int as n from pg_namespace where nspname='supabase_migrations'")).rows[0].n,0);});
}catch(error){console.error('FAIL',error.message,error.where??'');process.exitCode=1;}finally{await empty.close();}
console.log(`${checks} deployment-bundle checks passed.`);
