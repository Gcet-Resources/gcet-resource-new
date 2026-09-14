import {
  Bookmark,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Pin,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { type CampusNotice, formatCampusDate } from "@/lib/campus";

export function NoticeCard({
  notice,
  saved = false,
  read = false,
  member = false,
  busy = false,
  onSave,
  onRead,
  compact = false,
  scopeLabel,
  accountHref = "/login",
  accountLabel = "Sign in to save",
}: {
  notice: CampusNotice;
  saved?: boolean;
  read?: boolean;
  member?: boolean;
  busy?: boolean;
  compact?: boolean;
  scopeLabel?: string;
  onSave?: () => void;
  onRead?: () => void;
  accountHref?: string;
  accountLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const recent =
    !!notice.published_at &&
    Date.now() - new Date(notice.published_at).getTime() < 7 * 86400000;
  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition dark:bg-slate-900 ${notice.important ? "border-teal-200 dark:border-teal-900" : "border-slate-200 dark:border-slate-800"}`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
        <span className="rounded-md bg-teal-50 px-2 py-1 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {notice.category.replace(/_/g, " ")}
        </span>
        {notice.important && (
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <Pin className="h-3 w-3" />
            Important
          </span>
        )}
        {recent && !read && (
          <span className="text-teal-700 dark:text-teal-400">New</span>
        )}
        {read && (
          <span className="ml-auto inline-flex items-center gap-1 text-slate-400">
            <CheckCheck className="h-3 w-3" />
            Read
          </span>
        )}
      </div>
      <h3
        className={`${compact ? "text-base" : "text-lg"} font-semibold leading-snug tracking-tight`}
      >
        {notice.title}
      </h3>
      <p
        className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-400 ${expanded ? "" : "line-clamp-3"}`}
      >
        {notice.body}
      </p>
      {notice.body.length > 160 && (
        <button
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400"
        >
          {expanded ? "Show less" : "Read announcement"}
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
        <div>
          <time dateTime={notice.published_at || undefined}>
            {formatCampusDate(notice.published_at)}
          </time>
          <span className="mx-2">·</span>
          <span>
            {scopeLabel ||
              (notice.scope === "campus"
                ? "Everyone on campus"
                : notice.scope === "council"
                  ? "Student council"
                  : notice.scope === "club"
                    ? "Club update"
                    : "Course update")}
          </span>
        </div>
        {!compact &&
          (member ? (
            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={onRead}
                aria-pressed={read}
                className="rounded-lg px-2 py-1.5 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                {read ? "Mark unread" : "Mark read"}
              </button>
              <button
                disabled={busy}
                onClick={onSave}
                aria-pressed={saved}
                aria-label={`${saved ? "Unsave" : "Save"} ${notice.title}`}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800 ${saved ? "text-teal-700 dark:text-teal-400" : ""}`}
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`}
                />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          ) : (
            <Link
              to={accountHref}
              className="font-medium text-teal-700 dark:text-teal-400"
            >
              {accountLabel}
            </Link>
          ))}
      </div>
    </article>
  );
}
