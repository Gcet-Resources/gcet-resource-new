# GCET Campus

A campus portal for Galgotias College students: study resources, personalised course shelves, notices, clubs, and accountable publishing. React/Vite is configured for Vercel at [gcet-campus.vercel.app](https://gcet-campus.vercel.app); Supabase provides Auth, Postgres, Row Level Security, Storage, and the privileged account function.

Only verified `@galgotiacollege.edu` identities can become campus members. Sign-in uses an emailed one-time code. Students can enable authenticator MFA; staff, council, club heads, and administrators must complete MFA before privileged work. Optional phone MFA needs a configured Supabase plan/provider and remains off until ready.

The backend is provisioned, including migrations 1–7 and the catalog import. Student rollout still requires production SMTP and the OTP/invitation templates, a named first administrator, and controlled checks with real college accounts. Supabase rejected the template update under its default Free email provider, so mocked authentication tests do not establish working email delivery. See the [release status and runbook](docs/deployment.md) before inviting users.

## Start locally

Use Node 22 (`.nvmrc`).

```sh
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Add the Supabase project URL and **publishable** key to `.env.local`. Without these, public legacy resources remain browsable and account/campus features show their unavailable state. A configured service error is shown explicitly; it never silently substitutes stale content.

## Validate

```sh
cd frontend
npm run check
npx playwright install chromium
npm run test:e2e
npm run test:e2e:auth
npm run test:e2e:campus
```

The general suite checks the production build, navigation, mobile layouts, accessibility, resource/PDF behavior, and guest saves. Auth and campus-management tests use separate Vite servers and fully intercepted Supabase/CAPTCHA traffic. They never send real email or SMS. Use a clean environment without production `.env.local` for deterministic fixtures.

```sh
# From the repository root
npm ci --prefix supabase/tests
npm test --prefix supabase/tests
frontend/node_modules/.bin/tsc -p supabase/tests/tsconfig.edge.json
npm run test:edge --prefix supabase/tests
node scripts/import-catalog.mjs --check
```

Database tests execute PostgreSQL RLS and transactional RPCs in PGlite. Production GoTrue delivery, JWT verification, hosted Storage HTTP behavior, and concurrent transactions still require controlled staging checks.

## Deploy and operate

See [deployment runbook](docs/deployment.md), [backend setup and permissions](supabase/README.md), and [shared data contract](docs/implementation-contract.md).

Vercel's root directory is `frontend`, framework Vite, Node 22, install `npm ci`, build `npm run build`, output `dist`. Old Azure/Docker/Express hosting has been removed. Old `/api/*` calls return a deliberate 410 response; the website uses Supabase directly with database permission checks.

Academic source files remain in `frontend/src/data` as an import/archive source. The import reconciles 1,006 chapters into 892 resource records and 114 quarantined orphan groups; 217 linked records are published and 675 incomplete records stay draft. Course mappings are deliberately unassigned until verified. Staff/admin can maintain these records in the application. Correcting academic content and external source links remains a separate content task.

Three legacy notices and two expired exam events are preserved as drafts for administrator review. They are not presented as current campus announcements.
