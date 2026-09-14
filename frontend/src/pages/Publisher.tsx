import { useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, ShieldCheck, Send, Loader2, Clock3 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { requireSupabase } from "@/lib/supabase";
import {
  checked,
  errorMessage,
  formatCampusDate,
  useCampusQuery,
  type Club,
  type AccessRequest,
} from "@/lib/campus";
import {
  CampusShell,
  CampusGuard,
  actionClass,
  secondaryClass,
  inputClass,
  panelClass,
  SectionHeading,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/campus/CampusShell";
import {
  ContentManager,
  type ContentTable,
} from "@/components/campus/ContentManager";

function AccessRequests() {
  const { user } = useAuth();
  const [role, setRole] = useState("staff");
  const [club, setClub] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const requests = useCampusQuery(`own-access:${user!.id}`, async () => {
    const results = await Promise.all([
      requireSupabase()
        .from("access_requests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false }),
      requireSupabase()
        .from("clubs")
        .select("*")
        .eq("active", true)
        .order("name"),
    ]);
    return {
      requests: checked<AccessRequest[]>(results[0]),
      clubs: checked<Club[]>(results[1]),
    };
  });
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError(null);
    setSuccess(false);
    if (
      !user?.email?.toLowerCase().endsWith("@galgotiacollege.edu") ||
      !user.email_confirmed_at
    ) {
      setError("A verified college email is required to request a role.");
      return;
    }
    if (reason.trim().length < 20) {
      setError(
        "Please explain your campus responsibility in at least 20 characters.",
      );
      return;
    }
    if (role === "club_head" && !club) {
      setError("Choose the club you represent.");
      return;
    }
    setBusy(true);
    try {
      checked<unknown>(
        await requireSupabase()
          .from("access_requests")
          .insert({
            user_id: user.id,
            requested_role: role,
            club_id: role === "club_head" ? club : null,
            reason: reason.trim(),
            status: "pending",
          })
          .select("id")
          .single(),
      );
      setSuccess(true);
      setReason("");
      requests.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className={panelClass}>
        <SectionHeading title="Request a campus role" />
        <p className="mb-5 text-sm leading-6 text-slate-500">
          Staff, student council members and club heads can request publishing
          access. An administrator reviews each request; submitting one does not
          change your permissions.
        </p>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">
              Requested responsibility
            </span>
            <select
              className={inputClass}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={busy}
            >
              <option value="staff">Staff</option>
              <option value="council">Student council</option>
              <option value="club_head">Club head</option>
            </select>
          </label>
          {role === "club_head" && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold">
                Your club
              </span>
              <select
                className={inputClass}
                required
                value={club}
                onChange={(event) => setClub(event.target.value)}
                disabled={busy || requests.loading}
              >
                <option value="">Choose a club</option>
                {requests.data?.clubs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="mt-1.5 block text-xs text-slate-500">
                If your club is missing, ask a campus administrator to add it
                first.
              </span>
            </label>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold">
              Tell us about your responsibility
            </span>
            <textarea
              className={`${inputClass} min-h-32`}
              required
              minLength={20}
              maxLength={2000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={busy}
              placeholder="Describe your department, council position or club role, and how the campus team can verify it."
            />
          </label>
          {error && <ErrorState message={error} />}
          {success && (
            <p
              role="status"
              className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-300"
            >
              Request submitted. You can follow its status here.
            </p>
          )}
          <button
            className={actionClass}
            disabled={busy || requests.loading || !!requests.error}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {busy ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </section>
      <section className={panelClass}>
        <SectionHeading title="Your requests" />
        {requests.loading ? (
          <LoadingState label="Loading requests…" />
        ) : requests.error ? (
          <ErrorState message={requests.error} retry={requests.reload} />
        ) : requests.data?.requests.length ? (
          <div className="space-y-3">
            {requests.data.requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold capitalize">
                    {request.requested_role.replace("_", " ")}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-800">
                    {request.status}
                  </span>
                </div>
                {request.club_id && (
                  <p className="mt-1 text-xs text-slate-500">
                    {requests.data?.clubs.find(
                      (item) => item.id === request.club_id,
                    )?.name || "Club assignment"}
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                  {request.reason}
                </p>
                <p className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                  <Clock3 className="h-3 w-3" />
                  {formatCampusDate(request.created_at)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No requests yet">
            Your requests and review status will appear here.
          </EmptyState>
        )}
      </section>
    </div>
  );
}

function PublisherContent() {
  const auth = useAuth();
  const [tab, setTab] = useState("content");
  const admin = auth.hasRole("admin");
  const staff = auth.hasRole("staff");
  const scopes = admin
    ? ["campus", "course", "club", "council"]
    : [
        ...(staff ? ["campus", "course"] : []),
        ...(auth.hasRole("council") ? ["council"] : []),
        ...(auth.hasRole("club_head") ? ["club"] : []),
      ];
  const clubs = admin
    ? undefined
    : auth.roles
        .filter(
          (assignment) => assignment.role === "club_head" && assignment.club_id,
        )
        .map((assignment) => assignment.club_id!);
  const tables: ContentTable[] =
    admin || staff ? ["notices", "resources", "exam_events"] : ["notices"];
  if (!auth.isPrivileged) return <AccessRequests />;
  return (
    <>
      <div className="mb-7 flex flex-wrap gap-2">
        <button
          className={tab === "content" ? actionClass : secondaryClass}
          onClick={() => setTab("content")}
          aria-pressed={tab === "content"}
        >
          <Megaphone className="h-4 w-4" />
          Publishing desk
        </button>
        <button
          className={tab === "requests" ? actionClass : secondaryClass}
          onClick={() => setTab("requests")}
          aria-pressed={tab === "requests"}
        >
          My role requests
        </button>
      </div>
      {tab === "requests" ? (
        <AccessRequests />
      ) : (
        <CampusGuard access="publisher">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              You can publish to{" "}
              {scopes
                .map((scope) =>
                  scope === "club"
                    ? "your assigned clubs"
                    : scope === "council"
                      ? "the student council"
                      : scope === "course"
                        ? "courses"
                        : "the campus",
                )
                .join(", ")}
              . Your access is checked when every change is saved.
            </p>
          </div>
          <ContentManager
            tables={tables}
            noticeScopes={scopes}
            allowedClubIds={clubs}
          />
        </CampusGuard>
      )}
    </>
  );
}

export default function Publisher() {
  return (
    <CampusShell
      title="The publishing desk."
      description="Share something useful with your campus. Prepare a draft, choose its audience and publish when it’s ready."
      path="/publish"
      privatePage
      actions={
        <Link to="/notices" className={secondaryClass}>
          View noticeboard →
        </Link>
      }
    >
      <CampusGuard>
        <PublisherContent />
      </CampusGuard>
    </CampusShell>
  );
}
