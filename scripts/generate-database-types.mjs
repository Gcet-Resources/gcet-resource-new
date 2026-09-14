/** Generate table types from the migrated local Postgres catalog, without cloud access. */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(resolve(root,'supabase/tests/package.json'));
const { PGlite } = await import(process.env.PGLITE_MODULE || require.resolve('@electric-sql/pglite'));
const db = new PGlite();
const types = { uuid:'string',text:'string','timestamp with time zone':'string',boolean:'boolean',smallint:'number',integer:'number',bigint:'number',jsonb:'Json' };
try {
 await db.exec(await readFile(resolve(root,'supabase/tests/bootstrap.sql'),'utf8'));
 for(const f of (await readdir(resolve(root,'supabase/migrations'))).filter(f=>f.endsWith('.sql')).sort()) await db.exec(await readFile(resolve(root,'supabase/migrations',f),'utf8'));
 const columns=(await db.query("select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position")).rows;
 const tables=Object.groupBy(columns,c=>c.table_name);
 let out=`// Generated from the versioned schema by scripts/generate-database-types.mjs.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database = { public: { Tables: {\n`;
 for(const [table,cols] of Object.entries(tables)) {
  out+=`  ${table}: {\n`;
  for(const mode of ['Row','Insert','Update']) {
   out+=`    ${mode}: {\n`;
   for(const c of cols) out+=`      ${c.column_name}${mode==='Update'||(mode==='Insert'&&(c.column_default!=null||c.is_nullable==='YES'))?'?':''}: ${types[c.data_type]??'unknown'}${c.is_nullable==='YES'?' | null':''};\n`;
   out+='    };\n';
  }
  out+='    Relationships: [];\n  };\n';
 }
 out+=`}; Views: Record<string, never>; Functions: {\n  complete_onboarding: { Args: { p_display_name: string; p_course_id?: string | null; p_academic_year?: number | null; p_semester?: number | null }; Returns: Database['public']['Tables']['profiles']['Row'] };\n  admin_assign_role: { Args: { p_user_id: string; p_role: string; p_club_id?: string | null }; Returns: undefined };\n  admin_revoke_role: { Args: { p_assignment_id: string }; Returns: undefined };\n  admin_set_membership: { Args: { p_user_id: string; p_status: string }; Returns: undefined };\n  review_access_request: { Args: { p_request_id: string; p_approve: boolean }; Returns: undefined };\n  admin_list_users: { Args: { p_limit?: number; p_offset?: number; p_search?: string | null }; Returns: { id: string; email: string; display_name: string | null; course_id: string | null; academic_year: number | null; semester: number | null; status: string | null; roles: Json }[] };\n  admin_list_access_requests: { Args: { p_status?: string | null; p_limit?: number; p_offset?: number }; Returns: (Database['public']['Tables']['access_requests']['Row'] & { email: string; display_name: string | null })[] };\n  prepare_admin_account_action: { Args: { p_action: string; p_user_id?: string | null; p_email?: string | null }; Returns: string };\n}; Enums: Record<string, never>; CompositeTypes: Record<string, never>; } };\n`;
 await writeFile(resolve(root,'frontend/src/lib/database.types.ts'),out);
 console.log(`Generated database.types.ts for ${Object.keys(tables).length} tables.`);
} finally { await db.close(); }
