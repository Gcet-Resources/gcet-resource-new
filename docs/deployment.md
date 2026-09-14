# Deployment and operations

## Architecture and ownership

- Repository: `Gcet-Resources/gcet-resource-new`.
- Frontend: Vite/React configured for [gcet-campus.vercel.app](https://gcet-campus.vercel.app) on Vercel, root `frontend`.
- Backend: Supabase project `frvogzhuylfgktphwhip` (Gcet Resources), `my personal org`, Tokyo. Other projects in the organization are unrelated.
- Auth identities stay in Supabase Auth. Public profiles do not confer privileges. Database membership, scoped role assignments, current verified institutional identity, and MFA determine access.
- Published resource metadata is public. Supabase resource files use a private Storage bucket; permitted published downloads receive short-lived signed URLs. Member profiles, saved content, requests, reports, and administration are protected by RLS.

## Provisioning status and remaining launch work

Backend status verified on 15 September 2026:

- Migrations `202609140001` through `202609150007` are applied. The catalog contains 153 subjects and 892 resources: 217 published and 675 draft, plus 114 quarantined orphan groups. Three legacy notices and two expired exam events are preserved as drafts.
- The Before User Created domain hook, six-digit OTP with a 30-minute expiry, and `admin-accounts` Edge Function are configured. Public API checks confirm published catalog access and denial of protected data and administrator RPCs to anonymous callers.
- The Vercel project, canonical origin, build settings and public environment variables are provisioned. Project setup is separate from a successful production build and release verification; record the deployment result in [the Vercel project record](vercel-setup.md).

The following work remains necessary before student rollout:

| Item | Current status and required next step |
| --- | --- |
| Production email | Supabase rejected the OTP/invitation template update with HTTP400 under the default Free sender. Configure production SMTP and verified sender DNS, apply the supplied templates, then test real college-email delivery and code verification. A plan upgrade alone does not verify delivery. |
| First administrator | The owner's college email has not been selected. Complete real email verification and onboarding, run the owner-only bootstrap, then enroll and verify MFA. |
| Phone MFA | Provider/plan setup is unresolved. Keep `VITE_PHONE_MFA_ENABLED=false`; authenticator MFA remains the available option. |
| Custom domain | Ownership of `gcetresources.me` is unverified and custom-domain DNS has not been changed. Use `https://gcet-campus.vercel.app` until ownership and Vercel records are confirmed. |
| Live account verification | Local fixtures cover auth and role behavior without sending email or SMS. Real OTP delivery, hosted sessions, privileged publishing, and Storage uploads still need controlled verification. |

## Provision backend

Authenticate with the official Supabase CLI, then inspect the exact target before applying changes:

```sh
supabase link --project-ref frvogzhuylfgktphwhip
supabase db query --linked --project-ref frvogzhuylfgktphwhip --file supabase/deploy.sql
```

`deploy.sql` is a reviewed, generated transaction containing versioned migrations and the insert-only catalog import. It records CLI-compatible migration history and checksums. Exact reruns preserve edits; changed applied versions or unrecognized history stop the transaction. Generate it with `node scripts/build-supabase-bundle.mjs`. Never edit an applied migration; add a new version. For projects maintained exclusively with CLI migrations, use `supabase db push` and apply the catalog separately. Do not combine unrelated migration histories without review.

Review Auth configuration with `supabase config diff` before pushing. `supabase/config.toml` has **local development URLs**; do not push these unchanged to production. Production must use the actual canonical Vercel/custom origin and exact `/auth/callback` and `/account` redirect URLs. Leave unrelated provider settings unchanged.

Required Auth settings:

1. Email signup and email confirmation enabled; anonymous and phone primary sign-in disabled.
2. Before User Created SQL hook: `pg-functions://postgres/public/before_user_created`.
3. Confirmation and magic-link email bodies from `supabase/templates/otp.html` (must render `{{ .Token }}`); invitations from `supabase/templates/invite.html`.
4. Six-digit OTP, 30-minute expiry, at least 60 seconds between sends. Production SMTP with verified sender DNS is required for institutional delivery; Supabase's built-in sender is restricted and unsuitable for student rollout.
5. TOTP MFA enabled. Keep `VITE_PHONE_MFA_ENABLED=false` until Phone MFA is enabled and an SMS provider/plan is configured and tested. Do not enable phone signup as a substitute for second-factor verification.
6. Optional Turnstile: configure the matching provider secret in Supabase Auth and the public site key in Vercel together. Without a site key the widget stays off. Never publish the secret.

Deploy the account function:

```sh
supabase functions deploy admin-accounts --project-ref frvogzhuylfgktphwhip --use-api
supabase secrets set --project-ref frvogzhuylfgktphwhip APP_SITE_URL=https://gcet-campus.vercel.app ALLOWED_ORIGINS=https://gcet-campus.vercel.app
```

The function configuration disables gateway JWT verification because its handler independently calls Auth `getUser` and checked database RPCs. This supports publishable keys without trusting them as identity. Do not remove its token/role/MFA checks. Origin allowlists are exact; add a controlled preview origin explicitly if testing there.

## Vercel

Import the repository, set root `frontend`, Vite framework, Node 22, and the intended production branch. The checked-in `frontend/vercel.json` defines build/output, SPA fallback, security headers and retired API behavior.

Public build variables:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://frvogzhuylfgktphwhip.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Project's public browser key |
| `VITE_SITE_URL` | `https://gcet-campus.vercel.app` until a verified domain change |
| `VITE_PHONE_MFA_ENABLED` | `false` until provider setup is tested |
| `VITE_TURNSTILE_SITE_KEY` | Optional public CAPTCHA key |
| `VITE_GA_ID` | Optional analytics; leave empty to disable |

Never put a service-role key, `sb_secret_` key, database password, SMTP credential, or CAPTCHA secret in Vercel's `VITE_` variables. Vite embeds those values into public JavaScript. Store backend secrets only in Supabase/server settings.

Verify the stable Vercel URL first. Configure custom domain DNS only after confirming domain ownership and exact records in Vercel. The previous `gcetresources.me` destination needs an ownership/DNS review; do not assume the current redirect is this app. Update `VITE_SITE_URL`, Auth URLs, function origins and social metadata together when the domain changes.

## First administrator

A named college owner signs in, verifies OTP, and completes their profile. Then the project owner runs:

```sql
select private.bootstrap_first_admin('VERIFIED-OWNER@galgotiacollege.edu');
```

This runs only through an owner database connection, rejects repeated bootstrap, and writes an audit record. The user must enroll/verify MFA before administration unlocks. There are no shared admin passwords or seeded accounts. Additional users request staff/council/club-head roles; an MFA-authenticated admin reviews or assigns them.

## Release verification

- Run CI, including typecheck, lint, unit/auth policy tests, database tests, Edge typecheck, production browser checks and mocked auth flows.
- The temporary Vercel production branch is `feat/supabase-campus-platform`. GitHub Actions runs for pushes to that branch and `main`/`master`, plus pull requests targeting `main`/`master`. Confirm the checks for the deployed commit before treating a Vercel build as an approved release.
- Verify deep links and refreshing `/resources/...`, `/notices`, `/account`, and `/admin` on Vercel. `/api/auth/me` must return JSON with HTTP410, not the app HTML.
- Confirm public API sees published resources but cannot read profiles or write content. Verify the domain hook rejects noncollege signup before SMTP sends.
- With controlled real college accounts, test registration OTP, expired/reused code, session refresh/signout, onboarding, voluntary student MFA, all privileged roles, suspension/demotion, notice saves/follows, approvals and file upload/signed read. Do not claim email/SMS delivery works solely from mocked tests.
- Test first administrator, second administrator and last-admin protections. Never use an unverified identity or disable MFA to make a smoke test pass.
- Check Supabase Auth/Edge logs and Vercel runtime/build logs. Expected advisory warnings for authenticated SECURITY DEFINER RPCs require their explicit in-function current identity/role/MFA guards; do not blanket-revoke their execution and break the app.

After a deployment is ready, run `node scripts/smoke-deployment.mjs https://gcet-campus.vercel.app` from the repository root with the public Supabase URL and publishable key available in the environment. The script writes `docs/deployment-smoke.json` with the time, origin and successful checks. It verifies hosting and anonymous API boundaries only; it does not test email delivery or real member sessions.

## Rollback and recovery

Keep migrations forward compatible. Roll back Vercel to the previous known-good Supabase-compatible deployment; do not restore the removed Express auth backend against live accounts. Back up Postgres and Storage object bytes separately before destructive data migrations. Resource metadata deletion does not remove Storage bytes automatically; review unreferenced objects before cleanup.

Admin deletion uses single-use tickets and suspends the target before Auth deletion. If Auth fails or the process stops mid-action, inspect the audit/ticket and actual identity state before reactivation or retry. MFA recovery remains a project-owner operation after independent identity verification. Account roles are never granted from browser profile metadata.

Course assignments, real clubs and current campus announcements must be verified and published by the campus team. Review the imported legacy notice/exam drafts before using them; the exam dates are expired. Empty states are intentional until current information is published. Incomplete academic resource content remains a separate content task.
