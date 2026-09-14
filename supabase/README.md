# Supabase backend

The application requires a verified `@galgotiacollege.edu` Auth identity. No external-email approval path exists. Supabase Auth owns identities; Postgres owns membership and additive roles. The current Auth email is checked on every private capability, so an old JWT or edited profile cannot establish a different identity.

## Transactional SQL Editor bundle

`node scripts/build-supabase-bundle.mjs` generates `supabase/deploy.sql` and its manifest. For a new empty project, review and run that complete file in SQL Editor. It applies all schema migrations and the insert-only catalog in one transaction and records each version/name/source in the CLI-compatible `supabase_migrations.schema_migrations` table. Exact reruns skip schema work after matching a SHA256 checksum and preserve existing content edits. Changed applied migration files or pre-existing history without this bundle’s checksums fail closed; create a new migration or verify/reconcile earlier CLI history deliberately instead of bypassing the guard. Six dedicated bundle tests verify apply, rerun, content preservation, history, mismatch refusal and rollback. Auth dashboard configuration remains separate.

## Files and safe setup order

1. Apply every file in `migrations/` in filename order with Supabase migrations. They create schema, RLS, transactional RPCs, Storage rules, account-action tickets, bootstrap/audit functions and enrolled-student MFA enforcement. Do not expose the `private` schema through Data API.
2. Generate/review the insert-only catalog import with `node scripts/import-catalog.mjs --output supabase/catalog-import.sql`. Apply it only after migrations. It imports 153 subjects and 892 resources (217 published, 675 draft), quarantines 114 orphan groups containing 114 chapters, and preserves both duplicate legacy chapter IDs as different stable UUIDs. The source totals reconcile to 1,006 chapters; all 218 nonempty URLs remain either resource records or quarantine payloads. Courses remain unknown/NULL. Rerunning does not overwrite administrator edits.
3. Configure email confirmation, custom production SMTP and its sender DNS. OTP templates are `templates/otp.html`; both confirmation and magic-link templates must contain `{{ .Token }}`. Use `templates/invite.html` for invitations: token-hash verification at `/auth/callback` works with the frontend PKCE flow. Add exact callback/account URLs to the Auth redirect allowlist. Configure the Before User Created hook to `public.before_user_created`. `config.toml` supplies these settings for local development; cloud dashboard settings must also be set explicitly.
4. Only email auth is required. Leave anonymous, phone sign-in, and unneeded OAuth providers disabled. Authenticator TOTP is supported; enable optional Phone MFA only with an explicitly configured provider/plan. Any verified enrolled factor adds an MFA boundary to private student operations; privileged roles always require `aal2`.
5. Set the frontend URL and publishable key. Never put a secret key, SMTP password or database credential in a `VITE_` variable. Stage with a separate project/fixtures.
6. A real college user must verify their email and complete onboarding before an owner can bootstrap the first administrator in SQL Editor: `select private.bootstrap_first_admin('verified-user@galgotiacollege.edu');`. This owner-only function rejects a second bootstrap and writes an audit record. The administrator then enrolls MFA to use privileged screens. No privileged account is seeded, and no shared password exists.

`complete_onboarding` creates a new active student membership. Existing `pending`/`suspended` membership requires an administrator to reactivate it; a profile save cannot undo an administrative suspension. Own profile/membership/role reads work at `aal1` so users can see status and reach MFA, while personal writes and other protected data require the appropriate current state.

## Permissions

- Guests read public subjects, active courses/clubs, published resources and currently published/nonexpired notices/events.
- Active students manage their own profile, favorites, follows, bookmarks, reads, access requests and reports. Privilege requests ask for staff/council/one club-head scope; they never grant a role.
- Staff with MFA manage resources/exams and campus/course notices. Council with MFA manages council notices. Club heads with MFA manage only their assigned active clubs' notices.
- Administrators with MFA manage courses/subjects/clubs, reports, role requests, memberships and roles. Role/membership mutations run through locked, audited transactions; self-deactivation/self-admin-revocation and removal of the final active administrator are guarded.
- Direct writes to memberships, roles, audits and review decisions are denied. Definer functions have fixed search paths and narrow execution grants. Current database roles/status are authoritative; stale role claims do not preserve permission.

## Storage

The `resources` bucket is private, accepts PDF MIME with a 50 MiB server limit, and requires staff/admin MFA to upload into `<user-id>/<random-id>.pdf`. The UI may apply a smaller limit. Published resource metadata grants anonymous SELECT for its matching object; use `createSignedUrl(path, 300)` at viewing time, never `getPublicUrl`. Draft bytes remain private. Staff can replace their own paths and delete only their own unreferenced uploads; admins can delete resource objects. Database metadata deletion does not automatically delete bytes. Audit stale/unreferenced objects separately before cleanup.

Signed URLs remain usable until their expiry even after signout or role change. Keep them out of permanent caches and renew at viewing time. Database backups exclude object bytes; back up Storage separately.

## Account Edge Function

`admin-accounts` supports:

- `{ "action": "invite", "email": "name@galgotiacollege.edu" }` — invite only; no role grant. Recipient verifies and completes student onboarding, then an admin can assign elevated roles.
- `{ "action": "send_sign_in", "user_id": "uuid" }` — send an existing college account the normal OTP. Existing MFA remains required; this is not a factor reset.
- `{ "action": "delete", "user_id": "uuid" }` — delete a non-admin account, never the requesting admin. Revoke another admin's role separately before deletion.

Deploy the function with gateway JWT verification disabled only because it explicitly verifies the user token with Auth and calls the current-role/MFA RPC. It does not treat the publishable key as identity. Set server secrets `APP_SITE_URL` (canonical origin) and `ALLOWED_ORIGINS` (comma-separated approved frontend origins). Supabase supplies its URL and key dictionaries. The code prefers new publishable/secret key dictionaries and accepts legacy injected keys for local CLI compatibility. No browser secret is needed.

The function consumes a 60-second single-use SQL ticket before invoking a secret-key Auth API. Targets come from the ticket, not unchecked request input. Delete suspends the account before the external Auth call; concurrent reactivation/role grants are blocked while deletion is in flight. A failure leaves suspension in place and records failure; admins review before deliberately reactivating. If a process dies after consuming a deletion ticket, an owner must inspect Auth state and finalize the ticket before reactivation. Do not auto-expire an in-flight deletion as a success.

MFA reset is deliberately owner-operated through Supabase after independent identity verification; it is not exposed as a generic browser-driven admin endpoint. Review Auth and application audit events during recovery. Invitations/OTP delivery, deletion failure handling, and factor recovery must be tested in staging with controlled accounts before production.

## Repeatable local checks

These tests run the migrations and real PostgreSQL RLS/functions in PGlite without Docker:

```sh
npm ci --prefix supabase/tests
npm test --prefix supabase/tests
npm run test:edge --prefix supabase/tests
node scripts/import-catalog.mjs --check
node scripts/generate-database-types.mjs
frontend/node_modules/.bin/tsc -p supabase/tests/tsconfig.edge.json
```

For an already installed external test runtime, set `PGLITE_MODULE` to its module entry path. Table types are generated from the migrated Postgres catalog; RPC interfaces are maintained alongside the shared contract. Use Supabase CLI's type generation against staging for full generated relationship metadata before adding nested relational queries.

The test bootstrap supplies stand-ins for managed `auth`/`storage` schemas and JWT context. The suite includes 57 database/import checks, six transactional-bundle checks and ten controlled Edge-handler checks (the latter require frontend TypeScript dependencies). Tests cover direct client RLS denials, current email changes, missing/stale MFA, scoped notice writes, user isolation, suspension/demotion, atomic approval failure, tickets/replay, draft storage rules and import reconciliation/idempotence. They do not prove JWT signatures, GoTrue hook/email/template dispatch, Storage HTTP signing/upload behavior or concurrent multi-connection transaction behavior. Those require the staged Supabase integration test. `supabase status` validates config paths but Docker must be running for the complete local stack.
