import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/context/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";

export const panelClass =
  "rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";
export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
export const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-700 dark:hover:bg-teal-500";
export const secondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export function CampusShell({
  title,
  description,
  eyebrow = "GCET • CAMPUS",
  actions,
  children,
  path,
  privatePage = false,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  path: string;
  privatePage?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f7faf9] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Seo
        title={title}
        description={description}
        path={path}
        noIndex={privatePage}
      />
      <Navigation />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-7xl px-4 pb-20 pt-28 outline-none sm:px-6 lg:px-8"
      >
        <header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-400">
              {eyebrow}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <p className="font-semibold">{title}</p>
      {children && (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
          {children}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingState({
  label = "Loading campus updates…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-32 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

export function ConnectionState() {
  return (
    <EmptyState
      title="Campus services are currently unavailable"
      action={
        <Link className={secondaryClass} to="/year-selection">
          Browse study materials <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      Study materials are still available. Account features and campus updates
      will appear when the service is connected.
    </EmptyState>
  );
}

export function CampusGuard({
  access = "member",
  children,
}: {
  access?: "member" | "publisher" | "admin";
  children: ReactNode;
}) {
  const auth = useAuth();
  if (!isSupabaseConfigured) return <ConnectionState />;
  if (auth.loading) return <LoadingState label="Checking your account…" />;
  if (auth.error)
    return (
      <ErrorState
        message={auth.error}
        retry={() => void auth.refreshProfile()}
      />
    );
  if (!auth.user)
    return (
      <EmptyState
        title="Your campus, personalised"
        action={
          <Link className={actionClass} to="/login">
            <LockKeyhole className="h-4 w-4" />
            Sign in with college email
          </Link>
        }
      >
        Use your verified @galgotiacollege.edu email to access your dashboard.
      </EmptyState>
    );
  if (auth.membership?.status !== "active")
    return (
      <EmptyState
        title="Your campus access needs attention"
        action={
          <Link className={secondaryClass} to="/account">
            View account
          </Link>
        }
      >
        Complete your profile or contact the campus team if your membership is
        on hold.
      </EmptyState>
    );
  if (access === "admin" && !auth.hasRole("admin"))
    return (
      <EmptyState title="Administrator access required">
        This area is available to campus administrators.
      </EmptyState>
    );
  if (access === "publisher" && !auth.isPrivileged)
    return (
      <EmptyState
        title="Publishing access required"
        action={
          <Link className={secondaryClass} to="/publish">
            Request publishing access
          </Link>
        }
      >
        Your student account can request a staff, council or club role.
      </EmptyState>
    );
  if (auth.needsMfa)
    return (
      <EmptyState
        title="Verify it’s you before continuing"
        action={
          <Link className={actionClass} to="/account#security">
            <ShieldCheck className="h-4 w-4" />
            Complete two-step verification
          </Link>
        }
      >
        Complete the additional verification step required for your account to
        continue.
      </EmptyState>
    );
  return <>{children}</>;
}

export function SectionHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">
        {title}
        {count !== undefined && (
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  );
}
