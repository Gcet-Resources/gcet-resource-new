/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { requireSupabase, supabase } from "@/lib/supabase";
import {
  authErrorMessage,
  isVerifiedCollegeUser,
  isPrivilegedMembership,
  needsSecondFactor,
  type CampusRole,
} from "@/lib/auth-policy";

export type Profile = {
  id: string;
  display_name: string;
  course_id: string | null;
  academic_year: number | null;
  semester: number | null;
  created_at: string;
  updated_at: string;
};
export type Membership = {
  user_id: string;
  status: "active" | "pending" | "suspended";
};
export type RoleAssignment = {
  id: string;
  user_id: string;
  role: CampusRole;
  club_id: string | null;
};
type AuthState = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  membership: Membership | null;
  roles: RoleAssignment[];
  loading: boolean;
  error: string | null;
  mfaLevel: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: CampusRole) => boolean;
  isPrivileged: boolean;
  needsMfa: boolean;
};
const AuthContext = createContext<AuthState | undefined>(undefined);

function removeLegacyIdentity() {
  try {
    for (const key of [
      "gcet_current_user",
      "gcet_admin_auth",
      "gcet_admin_token",
    ])
      localStorage.removeItem(key);
  } catch {
    /* Disabled browser storage is never an authority. */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [mfaLevel, setMfaLevel] = useState<string | null>(null);
  const [nextMfaLevel, setNextMfaLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(null);
  const revision = useRef(0);
  const activeUserId = useRef<string | null>(null);
  const mounted = useRef(true);

  const clearIdentity = useCallback(() => {
    activeUserId.current = null;
    setUser(null);
    setSession(null);
    setProfile(null);
    setMembership(null);
    setRoles([]);
    setMfaLevel(null);
    setNextMfaLevel(null);
    removeLegacyIdentity();
  }, []);

  const loadIdentity = useCallback(
    async (next: Session | null, version: number) => {
      const isCurrent = () => mounted.current && revision.current === version;
      if (!isCurrent()) return;
      if (!next || !supabase) {
        clearIdentity();
        setError(null);
        setLoading(false);
        return;
      }
      if (activeUserId.current !== next.user.id) {
        clearIdentity();
        setLoading(true);
      }
      setError(null);
      try {
        // Cached session data does not establish identity: ask Auth to verify it.
        const identity = await supabase.auth.getUser(next.access_token);
        if (identity.error) throw identity.error;
        if (!isCurrent()) return;
        if (!isVerifiedCollegeUser(identity.data.user)) {
          clearIdentity();
          await supabase.auth.signOut({ scope: "local" });
          if (mounted.current)
            setError(
              "Only verified @galgotiacollege.edu accounts can sign in. Use your college email.",
            );
          return;
        }
        const verifiedUser = identity.data.user;
        activeUserId.current = verifiedUser.id;
        setUser(verifiedUser);
        setSession(next);
        const [profileResult, memberResult, roleResult, assurance] =
          await Promise.all([
            supabase
              .from("profiles")
              .select(
                "id,display_name,course_id,academic_year,semester,created_at,updated_at",
              )
              .eq("id", verifiedUser.id)
              .maybeSingle(),
            supabase
              .from("memberships")
              .select("user_id,status")
              .eq("user_id", verifiedUser.id)
              .maybeSingle(),
            supabase
              .from("role_assignments")
              .select("id,user_id,role,club_id")
              .eq("user_id", verifiedUser.id),
            supabase.auth.mfa.getAuthenticatorAssuranceLevel(next.access_token),
          ]);
        if (!isCurrent()) return;
        for (const result of [
          profileResult,
          memberResult,
          roleResult,
          assurance,
        ])
          if (result.error) throw result.error;
        setProfile(profileResult.data as Profile | null);
        setMembership(memberResult.data as Membership | null);
        setRoles((roleResult.data ?? []) as RoleAssignment[]);
        setMfaLevel(assurance.data?.currentLevel ?? null);
        setNextMfaLevel(assurance.data?.nextLevel ?? null);
      } catch (cause) {
        if (!isCurrent()) return;
        // A failed refresh must not retain management privileges from stale data.
        setMembership(null);
        setRoles([]);
        setMfaLevel(null);
        setNextMfaLevel(null);
        setError(
          authErrorMessage(
            cause,
            "We couldn't load your campus account. Please retry before continuing.",
          ),
        );
        throw cause;
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [clearIdentity],
  );

  useEffect(() => {
    mounted.current = true;
    removeLegacyIdentity();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      const version = ++revision.current;
      // Leave the SDK auth lock before making Auth or database requests.
      const timer = setTimeout(() => {
        timers.delete(timer);
        void loadIdentity(next, version).catch(() => {});
      }, 0);
      timers.add(timer);
    });
    return () => {
      mounted.current = false;
      // This counter intentionally invalidates every in-flight request, including newer ones.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      revision.current++;
      subscription.unsubscribe();
      for (const timer of timers) clearTimeout(timer);
    };
  }, [loadIdentity]);

  const refreshProfile = useCallback(async () => {
    const client = requireSupabase();
    const version = ++revision.current;
    const result = await client.auth.getSession();
    if (result.error) {
      if (revision.current === version)
        setError(authErrorMessage(result.error));
      throw result.error;
    }
    await loadIdentity(result.data.session, version);
  }, [loadIdentity]);

  const signOut = useCallback(async () => {
    const result = await requireSupabase().auth.signOut({ scope: "local" });
    if (result.error) throw result.error;
    ++revision.current;
    clearIdentity();
    setError(null);
    setLoading(false);
  }, [clearIdentity]);

  const hasRole = useCallback(
    (role: CampusRole) =>
      membership?.status === "active" &&
      roles.some((item) => item.role === role),
    [membership, roles],
  );
  const isPrivileged = isPrivilegedMembership(membership?.status, roles);
  const value = useMemo<AuthState>(
    () => ({
      user,
      session,
      profile,
      membership,
      roles,
      loading,
      error,
      mfaLevel,
      refreshProfile,
      signOut,
      hasRole,
      isPrivileged,
      needsMfa: needsSecondFactor(isPrivileged, mfaLevel, nextMfaLevel),
    }),
    [
      user,
      session,
      profile,
      membership,
      roles,
      loading,
      error,
      mfaLevel,
      nextMfaLevel,
      refreshProfile,
      signOut,
      hasRole,
      isPrivileged,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
