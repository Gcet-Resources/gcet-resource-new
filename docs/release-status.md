# GCET Campus deployment record

Recorded 15 September 2026 (Asia/Kolkata).

The Supabase-backed application is publicly available at **https://gcet-campus.vercel.app**. The first verified production deployment serves application commit `9eaccb2ab4f8933d3881522feb66527604f5ee03`, Vercel deployment `dpl_DFBvvGt4HNbJJ8bAqiXFyNAcWTAy`. Follow-up corrections and the current CI results are tracked in [draft PR #43](https://github.com/Gcet-Resources/gcet-resource-new/pull/43). The PR has not been merged.

## Implemented

- Institutional email OTP accounts and onboarding; optional student authenticator MFA and mandatory privileged-role MFA. Phone MFA is implemented behind a disabled provider flag.
- Student course/year/semester preferences, resource saves, notices, bookmarks/read tracking, club discovery/follows, and scoped staff/council/club publishing.
- Administrator user, membership, role, approval and content management, guarded account operations, and audit records.
- Supabase RLS, private resource storage and signed reads, seven versioned migrations, an insert-only catalog import and guarded account Edge Function.
- Vercel hosting, SPA deep links, retired Express API responses, security headers, updated PDF reading/search/navigation, error states, and mobile/light/dark accessibility fixes. A missing page bundle after deployment triggers one guarded reload; repeated failures, offline mode and unavailable storage retain manual retry.

## Verified deployment evidence

- [17 live hosting and API checks](deployment-smoke.json) passed: public routes, sensitive-route noindex headers, retired API HTTP 410, published catalog access, private-table and administrator-RPC denials, and account-function authorization/origin boundaries.
- An independent live verifier passed 19 HTTP checks covering routes, static assets, manifest, robots, sitemap, service worker and headers. The canonical site is public without a Vercel sign-in.
- A scan of 49 deployed JavaScript files confirmed the intended Supabase public configuration and found no backend credential markers.
- Browser review confirmed the live homepage, college sign-in form, first-year subject/resource catalog, and the anonymous administration gate.
- Live Supabase contains seven applied migrations, 153 subjects, 892 resources (217 published and 675 draft), and 114 quarantined orphan groups. Three legacy notices and two expired exam events are drafts; anonymous callers cannot read them.

Local checks passed for typecheck, lint, build, 20 unit tests, eight auth-policy tests, 57 database/import checks, eight deployment-bundle checks, 10 Edge Function checks, and the route, interaction, PDF, mocked-auth and mocked-campus browser suites. Focused light/dark accessibility checks found no violations. The general browser suite contains 38 tests, including five regressions using real failed page-bundle requests to verify recovery and prevent reload loops.

Both [push CI](https://github.com/Gcet-Resources/gcet-resource-new/actions/runs/34884174078) and [PR CI](https://github.com/Gcet-Resources/gcet-resource-new/actions/runs/34884179093) passed for the account metadata correction at `365c9e4`. That deployment also passed live title, canonical and noindex checks. Current checks, including the deployment-recovery addition, are available on PR #43. CI and local auth fixtures do not send real email or SMS.

## Required before student rollout

| Dependency | Remaining action |
| --- | --- |
| Email delivery | Supply a production SMTP provider and verified sender. Supabase rejected the supplied OTP/invitation templates under its default Free sender. Install the templates after configuring SMTP, then verify real college-email OTP delivery, expiry and sign-in. |
| First administrator | Identify the owner's `@galgotiacollege.edu` email. Verify and onboard that actual account, run the owner-only bootstrap, and complete MFA. No first administrator has been invented or granted. |
| Live account workflows | With controlled college accounts, verify sessions, privileged roles, suspension, approvals, publishing, file uploads and signed reads against the hosted service. |
| Phone MFA | Configure a supported Supabase plan and SMS provider, test delivery, then enable the public feature flag. TOTP is already configured. |
| Custom domain | Confirm ownership of `gcetresources.me` and the required DNS records before moving it. Use the Vercel address above for now. |
| Campus content | Review the imported drafts, map subjects to verified courses, and publish current clubs/notices/exams. Academic resource corrections remain with the campus content owner. |

See [deployment.md](deployment.md) for exact setup, verification and recovery steps. No claim of completed real email/SMS authentication is made by this deployment record.
