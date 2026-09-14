import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle } from '../../scripts/build-supabase-bundle.mjs';
const { PGlite }=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const bootstrap=await readFile(resolve(root,'supabase/tests/bootstrap.sql'),'utf8');
const bundle=await buildBundle();
const db=new PGlite();
let checks=0;
async function pass(name,fn){await fn();console.log('PASS',name);checks++;}
try {
 await db.exec(bootstrap);
 await pass('transactional bundle applies every migration and catalog',async()=>{await db.exec(bundle.sql);assert.equal((await db.query('select count(*)::int as n from supabase_migrations.schema_migrations')).rows[0].n,6);assert.equal((await db.query('select count(*)::int as n from public.resources')).rows[0].n,892);});
 await pass('same bundle is idempotent and preserves subsequent content edits',async()=>{await db.exec("update public.resources set title='Edited after import' where id=(select id from public.resources limit 1)");await db.exec(bundle.sql);assert.equal((await db.query("select count(*)::int as n from public.resources where title='Edited after import'")).rows[0].n,1);assert.equal((await db.query('select count(*)::int as n from public.resources')).rows[0].n,892);});
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
