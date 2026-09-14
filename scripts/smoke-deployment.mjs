#!/usr/bin/env node
/** Read-only release checks. Never signs up, sends mail, or mutates campus data. */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const site = new URL(process.argv[2] || 'https://gcet-campus.vercel.app').origin;
let publicEnv = {};
try {
  publicEnv = Object.fromEntries((await readFile(new URL('../frontend/.env.vercel.local', import.meta.url), 'utf8')).split('\n').filter(Boolean).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
} catch { /* CI can provide public configuration in its environment. */ }
const backend = process.env.VITE_SUPABASE_URL || publicEnv.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY;
const checks = [];
async function check(name, operation) {
  await operation(); checks.push({ name, passed: true }); console.log(`PASS ${name}`);
}
for (const path of ['/', '/resources/1st/BAS101', '/notices', '/clubs', '/login', '/account', '/admin', '/auth/callback']) {
  await check(`Vercel deep link ${path}`, async () => {
    const response = await fetch(site + path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') || '', /text\/html/);
    assert.match(await response.text(), /id="root"/);
    assert.ok(response.headers.get('content-security-policy'));
    if (/^\/(login|account|admin|auth)/.test(path)) assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
  });
}
await check('Retired Express API returns 410 JSON', async () => {
  const response = await fetch(site + '/api/auth/me');
  assert.equal(response.status, 410);
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  assert.match(response.headers.get('cache-control') || '', /no-store/);
  await response.json();
});
if (!backend || !key) throw new Error('Provide public Supabase configuration to check the backend.');
const headers = { apikey: key, 'Content-Type': 'application/json' };
await check('Public catalog contains only published resources', async () => {
  const response = await fetch(`${backend}/rest/v1/resources?select=id,status`, { headers });
  assert.equal(response.status, 200);
  const rows = await response.json();
  assert.ok(rows.length > 0);
  assert.ok(rows.every(row => row.status === 'published'));
});
for (const table of ['profiles', 'memberships', 'role_assignments', 'audit_events']) {
  await check(`Anonymous access denied: ${table}`, async () => {
    const response = await fetch(`${backend}/rest/v1/${table}?select=*`, { headers });
    assert.ok([401, 403].includes(response.status));
  });
}
await check('Anonymous administrator RPC denied', async () => {
  const response = await fetch(`${backend}/rest/v1/rpc/admin_list_users`, { method: 'POST', headers, body: '{}' });
  assert.ok([401, 403].includes(response.status));
});
await check('Account function denies unauthenticated requests', async () => {
  const response = await fetch(`${backend}/functions/v1/admin-accounts`, { method: 'POST', headers: { ...headers, origin: site }, body: '{}' });
  assert.equal(response.status, 401);
});
await check('Account function denies unapproved origins', async () => {
  const response = await fetch(`${backend}/functions/v1/admin-accounts`, { method: 'POST', headers: { ...headers, origin: 'https://unapproved.example' }, body: '{}' });
  assert.equal(response.status, 403);
});
const report = { site, checkedAt: new Date().toISOString(), checks, scope: 'Read-only hosting and public/unauthenticated API boundaries; no OTP/SMS delivery or real member sessions tested.' };
await writeFile(new URL('../docs/deployment-smoke.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(`${checks.length} deployment checks passed.`);
