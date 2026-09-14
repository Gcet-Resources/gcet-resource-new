// Execute the real handler with controlled SDK/Auth transports; no email/network.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from '../../frontend/node_modules/typescript/lib/typescript.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const source=await readFile(resolve(root,'supabase/functions/admin-accounts/index.ts'),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let count=0;
async function setup({identityError=null,prepareError=null,consumeError=null,operationError=null,targetAction='invite'}={}) {
 let handler; const calls=[];
 const env={APP_SITE_URL:'https://campus.example.edu',ALLOWED_ORIGINS:'https://campus.example.edu',SUPABASE_URL:'https://project.supabase.co',SUPABASE_PUBLISHABLE_KEYS:JSON.stringify({default:'public-test'}),SUPABASE_SECRET_KEYS:JSON.stringify({default:'secret-test'})};
 const createClient=(_url,key)=>{
  calls.push(['client',key]);
  return { auth:{getUser:async()=>({data:{user:identityError?null:{id:'actor'}},error:identityError}),admin:{inviteUserByEmail:async(email)=>{calls.push(['invite',email]);return {error:operationError};},deleteUser:async(id)=>{calls.push(['delete',id]);return {error:operationError};}},signInWithOtp:async(payload)=>{calls.push(['otp',payload.email]);return {error:operationError};}},rpc:async(name,args)=>{
   calls.push(['rpc',name,args]);
   if(name==='prepare_admin_account_action')return {data:'ticket-from-database',error:prepareError};
   if(name==='consume_admin_account_action')return {data:[{action:targetAction,target_id:'00000000-0000-4000-8000-000000000009',email:'verified@galgotiacollege.edu'}],error:consumeError};
   return {data:null,error:null};
  }};
 };
 new Function('require','Deno','exports',code)(()=>({createClient}),{env:{get:key=>env[key]},serve:fn=>{handler=fn;}},{});
 const invoke=({body={action:'invite',email:'untrusted@galgotiacollege.edu'},origin='https://campus.example.edu',token='Bearer user-token',method='POST',raw}={})=>handler(new Request('https://project.supabase.co/functions/v1/admin-accounts',{method,headers:{...(origin?{origin}:{}),...(token?{authorization:token}:{}),'content-type':'application/json'},...(method==='POST'?{body:raw??JSON.stringify(body)}:{})}));
 return {calls,invoke};
}
async function check(name,fn){await fn();console.log('PASS',name);count++;}
await check('unapproved origin rejected before SDK work',async()=>{const t=await setup();assert.equal((await t.invoke({origin:'https://evil.test'})).status,403);assert.equal(t.calls.length,0);});
await check('missing authorization rejected before SDK work',async()=>{const t=await setup();assert.equal((await t.invoke({token:null})).status,401);assert.equal(t.calls.length,0);});
await check('unsupported HTTP method rejected',async()=>{const t=await setup();assert.equal((await t.invoke({method:'GET'})).status,405);});
await check('request stream capped before parsing',async()=>{const t=await setup();assert.equal((await t.invoke({raw:'a'.repeat(4097)})).status,413);assert.equal(t.calls.length,0);});
await check('malformed JSON returns a client error',async()=>{const t=await setup();assert.equal((await t.invoke({raw:'{'})).status,400);});
await check('invalid Auth token never obtains secret client',async()=>{const t=await setup({identityError:{message:'invalid'}});assert.equal((await t.invoke()).status,401);assert.ok(!t.calls.some(c=>c[0]==='client'&&c[1]==='secret-test'));});
await check('failed role/MFA authorization never obtains secret client',async()=>{const t=await setup({prepareError:{message:'MFA required'}});assert.equal((await t.invoke()).status,403);assert.ok(!t.calls.some(c=>c[0]==='client'&&c[1]==='secret-test'));});
await check('consumed ticket recipient replaces caller-provided email',async()=>{const t=await setup();assert.equal((await t.invoke()).status,200);assert.deepEqual(t.calls.find(c=>c[0]==='invite'),['invite','verified@galgotiacollege.edu']);});
await check('expired ticket prevents privileged Auth side effect',async()=>{const t=await setup({consumeError:{message:'expired'}});assert.equal((await t.invoke()).status,500);assert.ok(!t.calls.some(c=>['invite','delete','otp'].includes(c[0])));});
await check('deletion uses checked target and records failure honestly',async()=>{const t=await setup({targetAction:'delete',operationError:{message:'storage blocks delete'}});const result=await t.invoke({body:{action:'delete',user_id:'00000000-0000-4000-8000-000000000001'}});assert.equal(result.status,502);assert.deepEqual(t.calls.find(c=>c[0]==='delete'),['delete','00000000-0000-4000-8000-000000000009']);assert.equal(t.calls.find(c=>c[1]==='finish_admin_account_action')[2].p_success,false);assert.match((await result.json()).error,/remains suspended/);});
console.log(`${count} Edge handler checks passed without real network or messages.`);
