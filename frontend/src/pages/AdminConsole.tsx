import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  History,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { requireSupabase } from "@/lib/supabase";
import {
  checked,
  errorMessage,
  formatCampusDate,
  useCampusQuery,
  type CampusUser,
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
  LoadingState,
  ErrorState,
  EmptyState,
  SectionHeading,
} from "@/components/campus/CampusShell";
import { ContentManager } from "@/components/campus/ContentManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

async function accountAction(
  body:
    | { action: "invite"; email: string }
    | { action: "send_sign_in" | "delete"; user_id: string },
) {
  const { data, error } = await requireSupabase().functions.invoke(
    "admin-accounts",
    { body },
  );
  if (error) {
    let message = errorMessage(error);
    if ("context" in error && error.context instanceof Response) {
      try {
        const details = await error.context.json();
        if (typeof details?.error === "string") message = details.error;
      } catch {
        /* Preserve the request error. */
      }
    }
    throw new Error(message);
  }
  if (!data?.ok)
    throw new Error(data?.error || "The account operation did not complete.");
}

function Pagination({
  page,
  loading,
  hasMore,
  setPage,
}: {
  page: number;
  loading: boolean;
  hasMore: boolean;
  setPage: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>Page {page + 1}</span>
      <div className="flex gap-2">
        <button
          className={secondaryClass}
          disabled={!page || loading}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          className={secondaryClass}
          disabled={!hasMore || loading}
          onClick={() => setPage(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function UserManagement() {
  const auth = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<CampusUser | null>(null);
  const [role, setRole] = useState("staff");
  const [clubId, setClubId] = useState("");
  const [status, setStatus] = useState("active");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const roster = useCampusQuery(`admin-users:${page}:${search}`, async () => {
    const [usersResult, clubsResult] = await Promise.all([
      requireSupabase().rpc("admin_list_users", {
        p_limit: 30,
        p_offset: page * 30,
        p_search: search || null,
      }),
      requireSupabase().from("clubs").select("*").order("name"),
    ]);
    return {
      users: checked<CampusUser[]>(usersResult).map((user) => ({
        ...user,
        roles: user.roles || [],
      })),
      clubs: checked<Club[]>(clubsResult),
    };
  });
  const selectedId = selected?.id;
  useEffect(() => {
    if (!roster.data || !selectedId) return;
    const fresh = roster.data.users.find((user) => user.id === selectedId);
    if (fresh) {
      setSelected(fresh);
      setStatus(fresh.status);
    }
  }, [roster.data, selectedId]);
  const perform = async (
    operation: () => Promise<unknown>,
    message: string,
    refreshAuth = false,
  ) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await operation();
      setSuccess(message);
      roster.reload();
      if (refreshAuth) await auth.refreshProfile();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };
  const rpc = async (name: string, payload: Record<string, unknown>) => {
    const response = await requireSupabase().rpc(name, payload);
    if (response.error) throw new Error(response.error.message);
  };
  const selectUser = (user: CampusUser) => {
    setSelected(user);
    setStatus(user.status);
    setRole("staff");
    setClubId("");
    setError(null);
    setSuccess(null);
    setDeleteConfirmation("");
  };
  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@galgotiacollege\.edu$/.test(email)) {
      setError("Enter a valid @galgotiacollege.edu address.");
      return;
    }
    await perform(async () => {
      await accountAction({ action: "invite", email });
      setInviteEmail("");
      setInviteOpen(false);
    }, "College invitation sent. Role assignment becomes available after the person verifies their account.");
  };
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchInput.trim());
            setPage(0);
          }}
          className="flex max-w-lg flex-1 gap-2"
        >
          <label className="relative flex-1">
            <span className="sr-only">Search members by name or email</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or college email…"
              maxLength={200}
            />
          </label>
          <button className={secondaryClass}>Search</button>
        </form>
        <button
          className={actionClass}
          onClick={() => {
            setInviteOpen(true);
            setError(null);
            setSuccess(null);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Invite college member
        </button>
      </div>
      {success && !selected && !inviteOpen && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-300"
        >
          {success}
        </p>
      )}
      {error && !selected && !inviteOpen && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      {roster.loading ? (
        <LoadingState label="Loading college accounts…" />
      ) : roster.error ? (
        <ErrorState message={roster.error} retry={roster.reload} />
      ) : roster.data?.users.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-900">
              <tr>
                <th scope="col" className="p-4">
                  Member
                </th>
                <th scope="col" className="p-4">
                  Status
                </th>
                <th scope="col" className="p-4">
                  Roles
                </th>
                <th scope="col" className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {roster.data.users.map((user) => (
                <tr key={user.id}>
                  <td className="p-4">
                    <p className="font-semibold">
                      {user.display_name || "Profile not completed"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${user.status === "active" ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}
                    >
                      {user.status || "No membership"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {user.roles.length ? (
                        user.roles.map((assignment) => (
                          <span
                            key={assignment.id}
                            className="rounded-md bg-slate-100 px-2 py-1 text-[10px] dark:bg-slate-800"
                          >
                            {assignment.role.replace("_", " ")}
                            {assignment.club_id &&
                              ` · ${roster.data?.clubs.find((club) => club.id === assignment.club_id)?.name || "club"}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      className="text-xs font-semibold text-teal-700 dark:text-teal-400"
                      onClick={() => selectUser(user)}
                      aria-label={`Manage ${user.email}`}
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No accounts found">
          Try another name or email. Invitations require a college address.
        </EmptyState>
      )}
      <Pagination
        page={page}
        setPage={setPage}
        loading={roster.loading}
        hasMore={(roster.data?.users.length || 0) === 30}
      />
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setSelected(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>
              {selected?.display_name || "Manage campus account"}
            </DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-sm font-semibold">Membership</h3>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span className="sr-only">Membership status</span>
                    <select
                      className={inputClass}
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      disabled={busy}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </label>
                  <button
                    className={secondaryClass}
                    disabled={
                      busy ||
                      status === selected.status ||
                      (selected.id === auth.user?.id && status !== "active")
                    }
                    onClick={() =>
                      void perform(
                        () =>
                          rpc("admin_set_membership", {
                            p_user_id: selected.id,
                            p_status: status,
                          }),
                        "Membership updated.",
                        selected.id === auth.user?.id,
                      )
                    }
                  >
                    Update status
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Suspension blocks campus account actions. Administrator
                  protections are enforced by the service.
                </p>
              </section>
              <section>
                <h3 className="mb-3 text-sm font-semibold">Role assignments</h3>
                <div className="space-y-2">
                  {selected.roles.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700"
                    >
                      <div>
                        <span className="text-sm capitalize">
                          {assignment.role.replace("_", " ")}
                        </span>
                        {assignment.club_id && (
                          <span className="ml-2 text-xs text-slate-500">
                            {roster.data?.clubs.find(
                              (club) => club.id === assignment.club_id,
                            )?.name || assignment.club_id}
                          </span>
                        )}
                      </div>
                      <button
                        disabled={
                          busy ||
                          assignment.role === "student" ||
                          (assignment.role === "admin" &&
                            selected.id === auth.user?.id)
                        }
                        className="text-xs text-red-600 disabled:opacity-40 dark:text-red-400"
                        onClick={() =>
                          void perform(
                            () =>
                              rpc("admin_revoke_role", {
                                p_assignment_id: assignment.id,
                              }),
                            "Role revoked.",
                            selected.id === auth.user?.id,
                          )
                        }
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void perform(
                      () =>
                        rpc("admin_assign_role", {
                          p_user_id: selected.id,
                          p_role: role,
                          p_club_id: role === "club_head" ? clubId : null,
                        }),
                      "Role assigned.",
                      selected.id === auth.user?.id,
                    );
                  }}
                  className="mt-3 flex flex-wrap gap-2"
                >
                  <label className="min-w-36 flex-1">
                    <span className="sr-only">Role to assign</span>
                    <select
                      className={inputClass}
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      disabled={busy}
                    >
                      <option value="staff">Staff</option>
                      <option value="council">Student council</option>
                      <option value="club_head">Club head</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </label>
                  {role === "club_head" && (
                    <label className="min-w-40 flex-1">
                      <span className="sr-only">Club for role assignment</span>
                      <select
                        required
                        className={inputClass}
                        value={clubId}
                        onChange={(event) => setClubId(event.target.value)}
                        disabled={busy}
                      >
                        <option value="">Choose club</option>
                        {roster.data?.clubs
                          .filter((club) => club.active)
                          .map((club) => (
                            <option key={club.id} value={club.id}>
                              {club.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  )}
                  <button
                    className={actionClass}
                    disabled={busy || selected.status !== "active"}
                  >
                    Assign role
                  </button>
                </form>
              </section>
              <section className="border-t border-slate-200 pt-5 dark:border-slate-700">
                <h3 className="mb-2 text-sm font-semibold">Account help</h3>
                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Send a sign-in email to the verified college identity.
                  Existing two-step verification remains required.
                </p>
                <button
                  className={secondaryClass}
                  disabled={busy}
                  onClick={() =>
                    void perform(
                      () =>
                        accountAction({
                          action: "send_sign_in",
                          user_id: selected.id,
                        }),
                      "Sign-in email requested successfully.",
                    )
                  }
                >
                  Send sign-in email
                </button>
              </section>
              <section className="rounded-xl border border-red-200 p-4 dark:border-red-900">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Delete account
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This permanently removes this account and its personal campus
                  data. Administrators and your own account cannot be deleted
                  here. Type the college email to confirm.
                </p>
                <label className="mt-3 block">
                  <span className="sr-only">
                    Confirm email for account deletion
                  </span>
                  <input
                    className={inputClass}
                    value={deleteConfirmation}
                    onChange={(event) =>
                      setDeleteConfirmation(event.target.value)
                    }
                    placeholder={selected.email}
                    disabled={
                      busy ||
                      selected.id === auth.user?.id ||
                      selected.roles.some(
                        (assignment) => assignment.role === "admin",
                      )
                    }
                    autoComplete="off"
                  />
                </label>
                <button
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  disabled={
                    busy ||
                    deleteConfirmation !== selected.email ||
                    selected.id === auth.user?.id ||
                    selected.roles.some(
                      (assignment) => assignment.role === "admin",
                    )
                  }
                  onClick={() =>
                    void perform(async () => {
                      await accountAction({
                        action: "delete",
                        user_id: selected.id,
                      });
                      setSelected(null);
                    }, "Account deleted.")
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Permanently delete account
                </button>
              </section>
              {busy && (
                <p
                  role="status"
                  className="flex items-center gap-2 text-sm text-slate-500"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Applying change…
                </p>
              )}
              {error && <ErrorState message={error} />}
              {success && (
                <p
                  role="status"
                  className="text-sm text-teal-700 dark:text-teal-400"
                >
                  {success}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          if (!busy) {
            setInviteOpen(open);
            setError(null);
          }
        }}
      >
        <DialogContent className="dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Invite a college member</DialogTitle>
            <DialogDescription>
              An email invitation starts verified student onboarding. Privileged
              roles must be assigned after verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void invite(event)} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold">
                College email
              </span>
              <input
                type="email"
                required
                className={inputClass}
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@galgotiacollege.edu"
                disabled={busy}
              />
            </label>
            {error && <ErrorState message={error} />}
            <button disabled={busy} className={actionClass}>
              {busy ? "Sending invitation…" : "Send invitation"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ReviewRequest = AccessRequest & {
  email: string;
  display_name: string | null;
};
function Approvals() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const requests = useCampusQuery(
    `admin-requests:${status}:${page}`,
    async () => {
      const results = await Promise.all([
        requireSupabase().rpc("admin_list_access_requests", {
          p_status: status,
          p_limit: 30,
          p_offset: page * 30,
        }),
        requireSupabase().from("clubs").select("*"),
      ]);
      return {
        rows: checked<ReviewRequest[]>(results[0]),
        clubs: checked<Club[]>(results[1]),
      };
    },
  );
  const review = async (request: ReviewRequest, approve: boolean) => {
    if (busy) return;
    setBusy(request.id);
    setError(null);
    setSuccess(null);
    try {
      const result = await requireSupabase().rpc("review_access_request", {
        p_request_id: request.id,
        p_approve: approve,
      });
      if (result.error) throw result.error;
      setSuccess(
        `${request.email}: request ${approve ? "approved and role assigned" : "rejected"}.`,
      );
      requests.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {["pending", "approved", "rejected"].map((item) => (
          <button
            key={item}
            className={item === status ? actionClass : secondaryClass}
            aria-pressed={item === status}
            onClick={() => {
              setStatus(item);
              setPage(0);
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      {success && (
        <p
          role="status"
          className="mb-4 text-sm text-teal-700 dark:text-teal-400"
        >
          {success}
        </p>
      )}
      {requests.loading ? (
        <LoadingState label="Loading access requests…" />
      ) : requests.error ? (
        <ErrorState message={requests.error} retry={requests.reload} />
      ) : requests.data?.rows.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.data.rows.map((request) => (
            <article key={request.id} className={panelClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {request.display_name || "College member"}
                  </h3>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {request.email}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold uppercase text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {request.requested_role.replace("_", " ")}
                </span>
              </div>
              {request.club_id && (
                <p className="mt-3 text-sm font-medium">
                  {requests.data?.clubs.find(
                    (club) => club.id === request.club_id,
                  )?.name || request.club_id}
                </p>
              )}
              <p className="my-4 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                {request.reason}
              </p>
              <p className="text-xs text-slate-400">
                Requested {formatCampusDate(request.created_at)}
              </p>
              {status === "pending" && (
                <div className="mt-5 flex gap-2">
                  <button
                    className={actionClass}
                    disabled={!!busy}
                    onClick={() => void review(request, true)}
                  >
                    <Check className="h-4 w-4" />
                    Approve role
                  </button>
                  <button
                    className={secondaryClass}
                    disabled={!!busy}
                    onClick={() => void review(request, false)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={`No ${status} requests`}>
          Verified students can request a campus role from the publishing desk.
        </EmptyState>
      )}
      <Pagination
        page={page}
        setPage={setPage}
        loading={requests.loading}
        hasMore={(requests.data?.rows.length || 0) === 30}
      />
    </>
  );
}

function AuditHistory() {
  const [page, setPage] = useState(0);
  const audit = useCampusQuery(`audit:${page}`, async () =>
    checked<
      Array<{
        id: string;
        actor_id: string;
        action: string;
        target_id: string;
        details: unknown;
        created_at: string;
      }>
    >(
      await requireSupabase()
        .from("audit_events")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * 30, page * 30 + 29),
    ),
  );
  return (
    <>
      {audit.loading ? (
        <LoadingState label="Loading audit history…" />
      ) : audit.error ? (
        <ErrorState message={audit.error} retry={audit.reload} />
      ) : audit.data?.length ? (
        <div className="space-y-3">
          {audit.data.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  {event.action.replace(/_/g, " ")}
                </h3>
                <time className="text-xs text-slate-500">
                  {formatCampusDate(event.created_at, true)} IST
                </time>
              </div>
              <p className="mt-2 break-all text-xs text-slate-500">
                Actor: {event.actor_id || "System"} · Target:{" "}
                {event.target_id || "—"}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-teal-700 dark:text-teal-400">
                  Event details
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No audit events yet">
          Trusted administrative actions will appear here.
        </EmptyState>
      )}
      <Pagination
        page={page}
        setPage={setPage}
        loading={audit.loading}
        hasMore={(audit.data?.length || 0) === 30}
      />
    </>
  );
}

function AdminContent() {
  const [tab, setTab] = useState("members");
  const tabs = [
    { id: "members", label: "Members & roles", icon: Users },
    { id: "requests", label: "Access requests", icon: ClipboardCheck },
    { id: "content", label: "Campus content", icon: FilePenLine },
    { id: "audit", label: "Audit history", icon: History },
  ];
  return (
    <>
      <div className="mb-7 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={`${tab === item.id ? actionClass : "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>
      <section className={panelClass}>
        <SectionHeading title={tabs.find((item) => item.id === tab)!.label} />
        {tab === "members" ? (
          <UserManagement />
        ) : tab === "requests" ? (
          <Approvals />
        ) : tab === "audit" ? (
          <AuditHistory />
        ) : (
          <ContentManager
            tables={[
              "courses",
              "subjects",
              "resources",
              "notices",
              "exam_events",
              "clubs",
              "reports",
            ]}
          />
        )}
      </section>
    </>
  );
}

export default function AdminConsole() {
  return (
    <CampusShell
      title="Campus administration."
      description="Manage verified members, publishing permissions and the information your campus relies on."
      path="/admin"
      privatePage
      eyebrow="GCET • ADMINISTRATION"
      actions={
        <>
          <Link to="/account" className={secondaryClass}>
            <ShieldCheck className="h-4 w-4" />
            Account security
          </Link>
          <Link to="/publish" className={actionClass}>
            Publishing desk
          </Link>
        </>
      }
    >
      <CampusGuard access="admin">
        <AdminContent />
      </CampusGuard>
    </CampusShell>
  );
}
