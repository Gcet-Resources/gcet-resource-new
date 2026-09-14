import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  loadPublicCampus,
  loadPersonalCampus,
  useCampusQuery,
  matchesAudience,
  togglePersonalItem,
  errorMessage,
} from "@/lib/campus";
import {
  CampusShell,
  inputClass,
  secondaryClass,
  LoadingState,
  ErrorState,
  EmptyState,
  ConnectionState,
} from "@/components/campus/CampusShell";
import { NoticeCard } from "@/components/campus/NoticeCard";

export default function CampusNotices() {
  const auth = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("all");
  const [course, setCourse] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const member =
    !!auth.user && auth.membership?.status === "active" && !auth.needsMfa;
  const feed = useCampusQuery(
    `notices:${auth.user?.id || "guest"}:${member}`,
    async () => ({
      ...(await loadPublicCampus()),
      personal: member
        ? await loadPersonalCampus(auth.user!.id)
        : { bookmarks: [], reads: [], follows: [] },
    }),
  );
  const personal = feed.data?.personal;
  const categories = [
    ...new Set<string>(
      feed.data?.notices.map((notice) => notice.category) || [],
    ),
  ];
  const notices = (feed.data?.notices || []).filter((notice) => {
    const text = `${notice.title} ${notice.body}`.toLowerCase();
    return (
      text.includes(search.trim().toLowerCase()) &&
      (category === "all" || notice.category === category) &&
      (course === "all" || notice.course_id === course) &&
      (view === "all" ||
        (view === "important" && notice.important) ||
        (view === "saved" && personal?.bookmarks.includes(notice.id)) ||
        (view === "unread" && !personal?.reads.includes(notice.id)) ||
        (view === "mine" &&
          matchesAudience(notice, auth.profile, personal?.follows || [])))
    );
  });
  const mutate = async (
    id: string,
    kind: "notice_reads" | "notice_bookmarks",
    current: boolean,
  ) => {
    if (!auth.user || busy) return;
    setBusy(id);
    setMutationError(null);
    try {
      await togglePersonalItem(kind, auth.user.id, id, current);
      feed.reload();
    } catch (error) {
      setMutationError(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };
  return (
    <CampusShell
      title="The campus noticeboard."
      description="Official updates, course announcements and everything your campus community is sharing."
      path="/notices"
      actions={
        <Link className={secondaryClass} to="/publish">
          Publish or request access
        </Link>
      }
    >
      <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All updates" },
            { id: "important", label: "Important" },
            ...(member
              ? [
                  { id: "mine", label: "For you" },
                  { id: "unread", label: "Unread" },
                  { id: "saved", label: "Saved" },
                ]
              : []),
          ].map((filter) => (
            <button
              key={filter.id}
              aria-pressed={view === filter.id}
              onClick={() => setView(filter.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${view === filter.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_200px]">
          <label className="relative">
            <span className="sr-only">Search announcements</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              className={`${inputClass} pl-9`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search announcements…"
            />
          </label>
          <label>
            <span className="sr-only">Announcement category</span>
            <select
              className={inputClass}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by course</span>
            <select
              className={inputClass}
              value={course}
              onChange={(event) => setCourse(event.target.value)}
            >
              <option value="all">All courses</option>
              {feed.data?.courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {mutationError && (
        <div className="mb-5">
          <ErrorState message={mutationError} />
        </div>
      )}
      {!feed.configured ? (
        <ConnectionState />
      ) : feed.loading ? (
        <LoadingState />
      ) : feed.error ? (
        <ErrorState message={feed.error} retry={feed.reload} />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {notices.length} announcement{notices.length === 1 ? "" : "s"}
            {view === "mine" &&
              " · Based on your course, year and followed clubs"}
          </div>
          {notices.length ? (
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {notices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  member={member}
                  accountHref={auth.user ? "/account#security" : "/login"}
                  accountLabel={
                    auth.user ? "Verify account to save" : "Sign in to save"
                  }
                  saved={personal?.bookmarks.includes(notice.id)}
                  read={personal?.reads.includes(notice.id)}
                  busy={busy !== null}
                  scopeLabel={
                    feed.data?.clubs.find((club) => club.id === notice.club_id)
                      ?.name ||
                    feed.data?.courses.find(
                      (item) => item.id === notice.course_id,
                    )?.code
                  }
                  onSave={() =>
                    void mutate(
                      notice.id,
                      "notice_bookmarks",
                      !!personal?.bookmarks.includes(notice.id),
                    )
                  }
                  onRead={() =>
                    void mutate(
                      notice.id,
                      "notice_reads",
                      !!personal?.reads.includes(notice.id),
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No announcements here yet"
              action={
                <button
                  className={secondaryClass}
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                    setCourse("all");
                    setView("all");
                  }}
                >
                  Clear filters
                </button>
              }
            >
              Try another filter, or return when your campus team publishes an
              update.
            </EmptyState>
          )}
        </>
      )}
    </CampusShell>
  );
}
