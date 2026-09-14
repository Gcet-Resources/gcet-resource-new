# Campus platform implementation contract

User requirements supersede the research defaults: ONLY verified @galgotiacollege.edu email identities may register/sign in. Email OTP registration/sign-in. NO external-email admission. Optional phone MFA for students when Supabase Phone MFA is configured; authenticator TOTP also supported. Privileged roles require MFA. Roles are additive, admin-assigned: student, staff, club_head, council, admin. Club-head permissions are scoped by club_id; council posts are council scoped; neither can assign roles.

## Shared data contract (snake_case)
- profiles: id uuid = auth.uid(), display_name text, course_id uuid nullable, academic_year smallint nullable (1..4), semester smallint nullable (1..8), created_at/updated_at; email authority remains Auth.
- memberships: user_id uuid primary key, status text active|pending|suspended; verified college onboarding activates student membership. Privileged access requests use separate approval records.
- role_assignments: id uuid, user_id uuid, role text student|staff|club_head|council|admin, club_id uuid nullable. Unique role/scope. No self writes. Student implicit or explicit only after trusted onboarding.
- courses: id uuid, code text unique, name text, department text, active boolean.
- subjects: id uuid, legacy_code text, year text ('1st'..'4th'), title, description, color, bg_color, course_id uuid nullable; unique(year, legacy_code). Existing catalog course unknown -> NULL; do not guess course ownership.
- resources: id uuid, subject_id uuid, resource_type text, legacy_id text, title text, description text, source_url text nullable, storage_path text nullable, provider text pdf|drive|external, status draft|published|archived, sort_order int, created_by uuid nullable, created_at/updated_at. Stable UUIDs from importer; duplicate legacy IDs must not collapse records. Public read only published with nonempty usable source + valid parent.
- clubs: id uuid, slug text unique, name text, description text, active boolean.
- notices: id uuid, title text, body text, category text, scope text campus|course|club|council, course_id uuid nullable, club_id uuid nullable, academic_year smallint nullable, status draft|published|archived, important boolean, published_at timestamptz, expires_at timestamptz nullable, created_by uuid, created_at/updated_at.
- exam_events: id uuid, title text, description text, course_id uuid nullable, academic_year smallint nullable, starts_at/ends_at timestamptz, status draft|published|archived, created_by uuid.
- favorites: user_id uuid, subject_id uuid, created_at; composite PK.
- notice_reads: user_id uuid, notice_id uuid, read_at; composite PK.
- notice_bookmarks: user_id uuid, notice_id uuid, created_at; composite PK.
- club_follows: user_id uuid, club_id uuid, created_at; composite PK.
- access_requests: id uuid, user_id uuid, requested_role staff|club_head|council, club_id uuid nullable, reason text, status pending|approved|rejected, reviewer_id uuid nullable, reviewed_at nullable, created_at.
- reports: id uuid, user_id uuid, resource_id uuid nullable, subject text, message text, status open|in_progress|resolved|dismissed, created_at.
- audit_events: id uuid, actor_id uuid, action text, target_id text, details jsonb, created_at. Trusted writes only.

## Client and auth interface
Auth owner creates src/lib/supabase.ts exporting supabase (nullable SupabaseClient), isSupabaseConfigured boolean, requireSupabase() -> configured client or throws; no secret in frontend. src/context/AuthProvider.tsx exports AuthProvider/useAuth with user, session, profile, membership, roles, loading, error, refreshProfile(), signOut(), hasRole(role), isPrivileged, needsMfa. profile is row above; roles array role assignment above. Public data screens work with validated bundled catalog when no Supabase config; account/admin screens display honest unavailable state, never fake login. useAuth guards must be usable by app owner. Auth user subject must match college domain even for already-created accounts (server helper too).

## Required database RPCs
- complete_onboarding(p_display_name text, p_course_id uuid default null, p_academic_year int default null, p_semester int default null): validates verified authenticated institutional email; upserts profile, activates allowed membership unless suspended, assigns only student if needed; never restores suspended access or clears role restrictions.
- review_access_request(p_request_id uuid,p_approve boolean): admin+aal2 only, transactional pending transition, grant requested role/scope on approve, audit.
- admin_set_membership(p_user_id uuid,p_status text): admin+aal2; no self-suspend/last-admin removal; audit.
- admin_assign_role(p_user_id uuid,p_role text,p_club_id uuid default null): admin+aal2; target verified institutional active identity; protect last admin semantics; audit.
- admin_revoke_role(p_assignment_id uuid): admin+aal2; protect self/last admin; audit.
- admin_list_users(): returns profile + email + membership + roles (json) for admin+aal2 only, with sane limit/pagination if added tell clients.
SQL/public reads type-safe through explicit interfaces; backend owner supplies generated-style database.types.ts if practical. Frontend .from calls can use explicit domain row type casts without broad any.

## File ownership
Root: App.tsx, Navigation.tsx, existing catalog/search/PDF/favorites/history/PWA/error/a11y fixes, package/dependency/build/test/deployment/docs and integration. Database agent: supabase/**, scripts/import-catalog.*, database tests, server functions, database.types.ts if generated. Auth agent: src/lib/supabase.ts, context/AuthProvider.tsx, pages/Login.tsx, pages/Account.tsx, auth guards, lib/auth.ts compatibility removal/adapters and auth tests. Campus agent: src/pages/CampusHome.tsx, CampusDashboard.tsx, CampusNotices.tsx, Clubs.tsx, AdminConsole.tsx, Publisher.tsx, src/lib/campus.ts, new shared campus UI components and feature tests. Do not edit App/Navigation/package files; report required imports/deps/routes to root.
