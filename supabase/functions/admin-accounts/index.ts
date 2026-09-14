import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

type Action = 'invite' | 'send_sign_in' | 'delete';
type AdminDatabase = { public: {
  Tables: Record<string, never>; Views: Record<string, never>;
  Functions: {
    consume_admin_account_action: { Args: { p_ticket_id: string }; Returns: { action: Action; target_id: string | null; email: string }[] };
    finish_admin_account_action: { Args: { p_ticket_id: string; p_success: boolean }; Returns: undefined };
  }; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
} };
function runtimeKey(kind: 'PUBLISHABLE' | 'SECRET'): string {
  const entries = Deno.env.get(`SUPABASE_${kind}_KEYS`);
  if (entries) {
    const keys = JSON.parse(entries) as Record<string, string>;
    if (keys.default) return keys.default;
    const first = Object.values(keys)[0]; if (first) return first;
  }
  const key = Deno.env.get(`SUPABASE_${kind}_KEY`) ?? Deno.env.get(kind === 'SECRET' ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_ANON_KEY');
  if (!key) throw new Error(`Missing server ${kind.toLowerCase()} key configuration`);
  return key;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (request: Request) => {
  const siteUrl = Deno.env.get('APP_SITE_URL');
  const origin = request.headers.get('origin');
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? siteUrl ?? '').split(',').map(v => v.trim()).filter(Boolean);
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin', ...(origin && allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } : {}) };
  const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (origin && !allowed.includes(origin)) return reply(403, { error: 'Origin not permitted' });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply(405, { error: 'POST required' });
  if (!siteUrl || !/^https:\/\//.test(siteUrl) && !/^http:\/\/localhost:\d+$/.test(siteUrl)) return reply(503, { error: 'Account email destination is not configured' });
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return reply(401, { error: 'Sign in required' });
  let ticket: string | null = null;
  let admin: SupabaseClient<AdminDatabase> | null = null;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply(400, { error: 'JSON body required' });
    const decoder = new TextDecoder(); let raw = ''; let bytes = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 4096) { await reader.cancel(); return reply(413, { error: 'Request is too large' }); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return reply(400, { error: 'Valid JSON required' }); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return reply(400, { error: 'JSON object required' });
    const body = parsed as { action?: unknown; user_id?: unknown; email?: unknown };
    if (!['invite', 'send_sign_in', 'delete'].includes(String(body.action))) return reply(400, { error: 'Unsupported action' });
    const action = body.action as Action;
    if (action !== 'invite' && (typeof body.user_id !== 'string' || !uuid.test(body.user_id))) return reply(400, { error: 'Valid user_id required' });
    if (action === 'invite' && (typeof body.email !== 'string' || body.email.length > 254)) return reply(400, { error: 'College email required' });
    const url = Deno.env.get('SUPABASE_URL')!;
    const caller = createClient(url, runtimeKey('PUBLISHABLE'), { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    // getUser verifies the JWT with Auth. The RPC additionally verifies current
    // college email, current membership/admin role, and the signed aal2 claim.
    const { data: identity, error: identityError } = await caller.auth.getUser(authorization.slice(7));
    if (identityError || !identity.user) return reply(401, { error: 'Session is no longer valid' });
    const prepared = await caller.rpc('prepare_admin_account_action', { p_action: action, p_user_id: action === 'invite' ? null : body.user_id, p_email: action === 'invite' ? body.email : null });
    if (prepared.error) return reply(403, { error: prepared.error.message });
    ticket = prepared.data as string;
    admin = createClient<AdminDatabase>(url, runtimeKey('SECRET'), { auth: { persistSession: false, autoRefreshToken: false } });
    const consumed = await admin.rpc('consume_admin_account_action', { p_ticket_id: ticket });
    if (consumed.error || !consumed.data?.[0]) throw new Error('Account action expired or authority changed');
    const target = consumed.data[0] as { action: Action; target_id: string | null; email: string };
    // Every privileged target comes from the consumed server ticket, never raw input.
    const operation = target.action === 'invite'
      ? await admin.auth.admin.inviteUserByEmail(target.email, { redirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback` })
      : target.action === 'delete'
        ? await admin.auth.admin.deleteUser(target.target_id!)
        : await createClient(url, runtimeKey('PUBLISHABLE'), { auth: { persistSession: false } }).auth.signInWithOtp({ email: target.email, options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl.replace(/\/$/, '')}/auth/callback` } });
    const finished = await admin.rpc('finish_admin_account_action', { p_ticket_id: ticket, p_success: !operation.error });
    if (operation.error) return reply(502, { error: target.action === 'delete' ? 'Auth deletion failed. The account remains suspended; review before reactivating it.' : 'Email delivery failed. Check SMTP and Auth logs before retrying.' });
    if (finished.error) return reply(500, { error: 'Action completed, but audit finalization failed. Review the request audit before retrying.' });
    return reply(200, { ok: true, action: target.action });
  } catch {
    if (ticket && admin) await admin.rpc('finish_admin_account_action', { p_ticket_id: ticket, p_success: false });
    return reply(500, { error: 'Account action failed. Review the audit and server configuration before retrying.' });
  }
});
