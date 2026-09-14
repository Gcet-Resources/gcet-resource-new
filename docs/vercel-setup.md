# Vercel project record

- Project: `gcet-campus`
- Team: `kihih22218-kelensoncoms-projects`
- Project ID: `prj_5SX1dclVvkjO48bulRlnl07yVM29`
- Canonical origin: [gcet-campus.vercel.app](https://gcet-campus.vercel.app)
- Dashboard: [Vercel project](https://vercel.com/kihih22218-kelensoncoms-projects/gcet-campus)
- Connected repository: `Gcet-Resources/gcet-resource-new`
- Production branch: `feat/supabase-campus-platform` (temporary migration branch, verified through the project API).

The `gcet-campus.vercel.app` domain is verified on the project. No custom domain is configured. Root Directory is `frontend`, Framework Preset is Vite, Node is `22.x`, Install Command is `npm ci`, Build Command is `npm run build`, and Output Directory is `dist`. The checked-in `frontend/vercel.json` supplies the routing and headers. Vercel's routing utility accepts the configuration: `/api` and `/api/*` resolve to the retired API handler; application deep links resolve to `index.html`.

The first production deployment is READY and public: `dpl_DFBvvGt4HNbJJ8bAqiXFyNAcWTAy`, application commit `9eaccb2`. See the [deployment record](release-status.md) for verified checks and the remaining account-provider setup.

The GitHub repository's homepage now points to the verified Vercel origin.

Production and Preview have `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SITE_URL`, and `VITE_PHONE_MFA_ENABLED`. The site URL is the canonical origin above; phone MFA is `false`. `VITE_GA_ID` and `VITE_TURNSTILE_SITE_KEY` are unset, which disables those integrations. No backend secret belongs in these public build variables.

Local `.vercel` metadata is ignored. The temporary CLI-generated OIDC `.env.local` was removed. Run deployment commands from the repository root so Vercel applies the configured `frontend` Root Directory.

Before release, complete the checks in [deployment.md](deployment.md), verify the production branch and public production access, and align Supabase Auth redirects and Edge Function origins with the canonical origin. Preview deployments share the backend, so use controlled test accounts and explicitly allowlist an exact preview origin when authentication testing requires one. SMTP and the OTP/invitation template update, first-admin identity and real-account checks remain launch dependencies; phone MFA stays disabled until its provider is ready.

Pushing to the configured production branch triggers a production deployment and the Campus checks workflow. GitHub Actions also runs for pushes to `main`/`master` and pull requests targeting those branches. Project creation and configuration do not themselves deploy the application. Confirm checks for the deployed commit and record the first successful deployment URL, commit and verification separately after its build completes.

Custom-domain DNS has not been changed. Ownership and availability of the former `gcetresources.me` domain remain unverified, so it must not be advertised as this deployment's address.
