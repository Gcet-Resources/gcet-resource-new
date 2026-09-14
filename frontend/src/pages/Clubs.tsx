import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus, Search, Users, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  loadPersonalCampus,
  loadPublicCampus,
  useCampusQuery,
  togglePersonalItem,
  errorMessage,
} from "@/lib/campus";
import {
  CampusShell,
  inputClass,
  actionClass,
  secondaryClass,
  panelClass,
  LoadingState,
  ErrorState,
  EmptyState,
  ConnectionState,
} from "@/components/campus/CampusShell";

export default function Clubs() {
  const auth = useAuth();
  const [query, setQuery] = useState("");
  const [onlyFollowing, setOnlyFollowing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const member =
    !!auth.user && auth.membership?.status === "active" && !auth.needsMfa;
  const campus = useCampusQuery(
    `clubs:${auth.user?.id || "guest"}:${member}`,
    async () => ({
      ...(await loadPublicCampus()),
      personal: member
        ? await loadPersonalCampus(auth.user!.id)
        : { follows: [], reads: [], bookmarks: [] },
    }),
  );
  const follows = campus.data?.personal.follows || [];
  const clubs =
    campus.data?.clubs.filter(
      (club) =>
        `${club.name} ${club.description}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()) &&
        (!onlyFollowing || follows.includes(club.id)),
    ) || [];
  const follow = async (clubId: string) => {
    if (!auth.user || busy) return;
    setBusy(clubId);
    setError(null);
    try {
      await togglePersonalItem(
        "club_follows",
        auth.user.id,
        clubId,
        follows.includes(clubId),
      );
      campus.reload();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(null);
    }
  };
  return (
    <CampusShell
      title="Find your people."
      description="From a shared interest to your next big idea. Explore GCET clubs and follow the communities you want to hear from."
      path="/clubs"
      actions={
        <Link to="/publish" className={secondaryClass}>
          Lead a club? Request access <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
    >
      <section className="mb-8 flex flex-col justify-between gap-5 rounded-3xl bg-teal-900 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <Users className="h-7 w-7 text-teal-200" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Campus is better together.
            </h2>
            <p className="mt-1 text-sm leading-6 text-teal-100/75">
              Following a club adds its announcements to your personal feed.
            </p>
          </div>
        </div>
        <Link to="/dashboard" className="text-sm font-semibold text-teal-100">
          My campus feed →
        </Link>
      </section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative max-w-md flex-1">
          <span className="sr-only">Search clubs</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a club or interest…"
          />
        </label>
        {member && (
          <button
            className={onlyFollowing ? actionClass : secondaryClass}
            aria-pressed={onlyFollowing}
            onClick={() => setOnlyFollowing((value) => !value)}
          >
            Following {follows.length > 0 && `(${follows.length})`}
          </button>
        )}
      </div>
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}
      {!campus.configured ? (
        <ConnectionState />
      ) : campus.loading ? (
        <LoadingState label="Finding campus communities…" />
      ) : campus.error ? (
        <ErrorState message={campus.error} retry={campus.reload} />
      ) : clubs.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <article key={club.id} className={`${panelClass} flex flex-col`}>
              <div className="mb-5 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 font-display text-2xl font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {club.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
                  GCET Club
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {club.name}
              </h2>
              <p className="mt-2 flex-1 whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">
                {club.description ||
                  "Get to know this campus community through its announcements."}
              </p>
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                {member ? (
                  <button
                    disabled={busy !== null}
                    onClick={() => void follow(club.id)}
                    className={`${follows.includes(club.id) ? secondaryClass : actionClass} w-full`}
                  >
                    {follows.includes(club.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {busy === club.id
                      ? "Saving…"
                      : follows.includes(club.id)
                        ? "Following · unfollow"
                        : "Follow club"}
                  </button>
                ) : (
                  <Link
                    to={auth.user ? "/account#security" : "/login"}
                    className={`${secondaryClass} w-full`}
                  >
                    {auth.user
                      ? "Verify account to follow"
                      : "Sign in to follow"}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            onlyFollowing
              ? "You haven’t followed a club yet"
              : query
                ? "No clubs match your search"
                : "Clubs are getting ready"
          }
          action={
            (query || onlyFollowing) && (
              <button
                className={secondaryClass}
                onClick={() => {
                  setQuery("");
                  setOnlyFollowing(false);
                }}
              >
                Explore all clubs
              </button>
            )
          }
        >
          {query || onlyFollowing
            ? "Try another interest or explore all published clubs."
            : "Active campus clubs will appear here when the campus team adds them."}
        </EmptyState>
      )}
    </CampusShell>
  );
}
