# Frontend/Backend Split Plan — GCET Resources

## 1. Current Architecture Assessment

### What already exists (partially split):
```
gcet-resource-new/
├── frontend (Vite + React)  ← src/ + public/
│   ├── src/
│   │   ├── lib/api.ts       ← Already calls /api/* endpoints
│   │   ├── lib/auth.ts      ← Auth helpers
│   │   ├── data/            ← DUPLICATED: should be server-only
│   │   └── ...
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
│
├── backend/ (Express API)
│   ├── src/index.js         ← Already has auth, data, PDF proxy, security
│   ├── data/                ← Authoritative data source
│   └── package.json
│
├── server/index.js          ← DUPLICATED: static server + PDF proxy (legacy)
├── docker/
│   ├── backend/Dockerfile
│   ├── frontend/Dockerfile + nginx.conf
│   └── proxy/nginx.conf
├── docker-compose.yml       ← Single-service, needs update
└── SPLIT_PLAN.md
```

### Key observations:
- Backend API (`backend/src/index.js`) already has: auth (JWT+httpOnly cookies), CORS, rate limiting, helmet, PDF proxy, all data endpoints
- Frontend (`src/lib/api.ts`) already calls the backend API correctly with `credentials: "include"`
- `server/index.js` is a **legacy static file server** that duplicates the PDF proxy — should be removed after migration
- Data files exist in both `src/data/` and `backend/data/` — `src/data/` should be removed
- Vite config has no API proxy configured for development
- Docker Compose only has a single `app` service

---

## 2. Migration Phases

### Phase 0: Pre-Migration Cleanup (No code changes)
- [ ] Document current endpoints — catalog all `/api/*` routes in backend
- [ ] Inventory env vars — list what each side needs
- [ ] Check for direct filesystem/secret access in frontend

### Phase 1: Repo Layout & Build Separation
- [ ] Restructure repo into monorepo:
  ```
  gcet-resource-new/
  ├── frontend/               # Moved from root
  │   ├── src/
  │   ├── public/
  │   ├── index.html
  │   ├── vite.config.ts
  │   ├── tailwind.config.ts
  │   ├── tsconfig*.json
  │   ├── postcss.config.js
  │   ├── eslint.config.js
  │   ├── components.json
  │   ├── playwright.config.ts
  │   ├── tests/
  │   └── package.json
  ├── backend/                # Already exists
  │   ├── src/index.js
  │   ├── data/
  │   └── package.json
  ├── docker/
  ├── README.md
  └── SPLIT_PLAN.md
  ```
- [ ] Move root-level config files into `frontend/` or keep at root with workspace config
- [ ] Update root `package.json` to use npm workspaces or remove it
- [ ] Remove `src/data/` — data is served by backend API
- [ ] Remove `server/index.js` — superseded by `backend/src/index.js`

### Phase 2: Development Workflow
- [ ] **Configure Vite proxy** in `vite.config.ts`:
  ```ts
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  }
  ```
- [ ] Add root `dev` script that starts both frontend and backend concurrently
- [ ] Add `concurrently` as a devDependency at root

### Phase 3: Backend Consolidation & Hardening
- [ ] Remove duplicate PDF proxy from `server/index.js`
- [ ] Add static file serving to backend for production (optional)
- [ ] Strengthen CORS — restrict to specific frontend origin(s)
- [ ] Enforce CSP headers via helmet (currently disabled)
- [ ] Add input validation (zod or express-validator) to all POST endpoints
- [ ] Replace in-memory stores with SQLite or a proper DB

### Phase 4: Docker & Deployment
- [ ] Update `docker-compose.yml` to multi-service (frontend + backend)
- [ ] Update frontend Dockerfile — copy from `frontend/` not root
- [ ] Update backend Dockerfile — ensure data directory is included

### Phase 5: CI/CD Pipelines
- [ ] Frontend pipeline: Build → Test → Deploy to CDN
- [ ] Backend pipeline: Build → Test → Deploy to container service
- [ ] Remove Vercel config if moving away from Vercel

### Phase 6: Auth & Secrets Management
- [ ] Move JWT_SECRET, ADMIN_PASSWORD to secrets manager
- [ ] Frontend env vars: only `VITE_API_BASE_URL`, `VITE_GA_MEASUREMENT_ID`
- [ ] Backend env vars: `JWT_SECRET`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`, `NODE_ENV`
- [ ] Audit for secrets baking into frontend bundle

### Phase 7: DNS & Hosting Layout
- [ ] Subdomains: `app.gcet-resources.com` → frontend (CDN), `api.gcet-resources.com` → backend
- [ ] Configure CDN with cache policies for static assets
- [ ] Configure WAF in front of backend (rate limiting, attack patterns)

### Phase 8: Testing & Cutover
- [ ] Update E2E tests to target staging environment
- [ ] Run integration tests against full stack
- [ ] Blue/Green deployment strategy
- [ ] Rollback plan with fallback to old server

### Phase 9: Documentation
- [ ] Update README.md with new architecture
- [ ] Create API docs (`docs/api.md`)
- [ ] Create deployment runbook (`docs/runbook.md`)

---

## 3. Files to Create/Modify/Delete

### Create:
| File | Purpose |
|------|---------|
| `docs/api.md` | API documentation |
| `docs/runbook.md` | Deployment runbook |

### Modify:
| File | Change |
|------|--------|
| `docker-compose.yml` | Multi-service (frontend + backend) |
| `vite.config.ts` | Add API proxy for dev |
| Root `package.json` | Workspace config or dev scripts |
| `docker/frontend/Dockerfile` | Update context path to `frontend/` |
| `docker/backend/Dockerfile` | Ensure data dir included |
| `README.md` | Update for new architecture |
| `.gitignore` | Add frontend/dist/ to ignore |

### Delete:
| File | Reason |
|------|--------|
| `server/index.js` | Superseded by backend |
| `src/data/` (entire dir) | Data served from backend API |
| `vercel.json` | If moving away from Vercel |

---

## 4. Security Checklist
- [ ] No secrets in frontend bundle
- [ ] CORS restricted to specific origin
- [ ] CSP headers enabled
- [ ] Rate limiting on auth endpoints
- [ ] Input validation on all POST endpoints
- [ ] httpOnly + Secure + SameSite cookies
- [ ] Secrets in vault/secret manager, not env files
- [ ] WAF in front of API
- [ ] TLS enforced everywhere

---

## 5. Priority & Effort Matrix

| Task | Effort | Priority | Notes |
|------|--------|----------|-------|
| Restructure repo layout | Medium | High | Enables all future steps |
| Remove `src/data/` | Low | High | Eliminates stale data risk |
| Add Vite proxy for dev | Low | High | Developer experience |
| Update Docker Compose | Medium | High | Production deployment |
| CI/CD pipelines | Medium | High | Automated deployment |
| Secrets management | Low | High | Security critical |
| Auth hardening | Medium | Medium | Already functional but improvable |
| API docs | Low | Medium | Team productivity |
| Remove `server/index.js` | Low | Medium | Cleanup after cutover |
| DNS/CDN/WAF setup | Medium | Medium | Infrastructure |
| E2E test updates | Medium | Medium | Quality assurance |
| Runbook/docs | Low | Low | Nice to have |
| Replace in-memory stores | High | Low | Future scalability |

---

## 6. Rollback Strategy

If the split causes issues:

1. **Immediate**: Revert DNS to point to old monolithic server
2. **Short-term**: Keep `server/index.js` running as fallback
3. **Recovery**: Use git revert on structural changes
4. **Verification**: Run E2E tests against fallback deployment
