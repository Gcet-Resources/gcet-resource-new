import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import type { CampusRole } from "@/lib/auth-policy";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function RequireAuth({
  children,
  requireActive = true,
  requireMfa = false,
  roles,
}: {
  children: ReactNode;
  requireActive?: boolean;
  requireMfa?: boolean;
  roles?: CampusRole[];
}) {
  const auth = useAuth();
  const location = useLocation();
  const next = encodeURIComponent(`${location.pathname}${location.search}`);
  if (!isSupabaseConfigured)
    return (
      <AuthGateMessage
        title="Campus accounts are coming online"
        message="Account services are not available on this deployment yet. You can still explore public resources."
      />
    );
  if (auth.loading)
    return (
      <div
        role="status"
        className="min-h-[50vh] grid place-items-center text-muted-foreground"
      >
        Loading your campus account…
      </div>
    );
  if (auth.error)
    return (
      <AuthGateMessage
        title="Your account could not be loaded"
        message={auth.error}
        retry={() => void auth.refreshProfile().catch(() => {})}
      />
    );
  if (!auth.user) return <Navigate to={`/login?next=${next}`} replace />;
  if (auth.membership?.status === "suspended")
    return (
      <AuthGateMessage
        title="Your campus account is suspended"
        message="Contact the campus team to review your access. Public resources remain available."
      />
    );
  if (requireActive && auth.membership?.status !== "active")
    return <Navigate to={`/account?next=${next}`} replace />;
  if (roles && !roles.some(auth.hasRole))
    return (
      <AuthGateMessage
        title="This area needs a campus role"
        message="Your account does not have access to this area. You can request an appropriate role from your campus dashboard."
      />
    );
  if (auth.needsMfa || (requireMfa && auth.mfaLevel !== "aal2"))
    return <Navigate to={`/account?next=${next}#security`} replace />;
  return <>{children}</>;
}

function AuthGateMessage({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry?: () => void;
}) {
  return (
    <main id="main-content" className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {retry && <Button onClick={retry}>Retry</Button>}
        <Button variant="outline" asChild>
          <Link to="/">Back to campus</Link>
        </Button>
      </div>
    </main>
  );
}
