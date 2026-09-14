import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export type CampusRole =
  "student" | "staff" | "club_head" | "council" | "admin";
export type PublicationStatus = "draft" | "published" | "archived";
export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  active: boolean;
}
export interface Club {
  id: string;
  slug: string;
  name: string;
  description: string;
  active: boolean;
}
export interface CampusSubject {
  id: string;
  legacy_code: string;
  year: string;
  title: string;
  description: string;
  course_id: string | null;
}
export interface CampusNotice {
  id: string;
  title: string;
  body: string;
  category: string;
  scope: string;
  course_id: string | null;
  club_id: string | null;
  academic_year: number | null;
  status: PublicationStatus;
  important: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}
export interface CampusExam {
  id: string;
  title: string;
  description: string;
  course_id: string | null;
  academic_year: number | null;
  starts_at: string;
  ends_at: string | null;
  status: PublicationStatus;
}
export interface RoleAssignment {
  id: string;
  user_id: string;
  role: CampusRole;
  club_id: string | null;
}
export interface CampusUser {
  id: string;
  email: string;
  display_name: string | null;
  course_id: string | null;
  academic_year: number | null;
  semester: number | null;
  status: string;
  roles: RoleAssignment[];
}
export interface AccessRequest {
  id: string;
  user_id: string;
  requested_role: "staff" | "club_head" | "council";
  club_id: string | null;
  reason: string;
  status: string;
  created_at: string;
}

export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "The request could not be completed. Please try again.";
}

export function checked<T>(result: {
  data: unknown;
  error: { message: string } | null;
}): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

async function collectPages<T>(
  load: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = checked<T[]>(await load(offset, offset + 499));
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}

/** A stable key explicitly describes the identity/filters of each request. */
export function useCampusQuery<T>(key: string, load: () => Promise<T>) {
  const loader = useRef(load);
  loader.current = load;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ key, data: null, loading: isSupabaseConfigured, error: null });
  useEffect(() => {
    let active = true;
    setState({ key, data: null, loading: isSupabaseConfigured, error: null });
    if (!isSupabaseConfigured) return;
    loader
      .current()
      .then((data) => {
        if (active) setState({ key, data, loading: false, error: null });
      })
      .catch((error) => {
        if (active)
          setState({
            key,
            data: null,
            loading: false,
            error: errorMessage(error),
          });
      });
    return () => {
      active = false;
    };
  }, [key, revision]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return {
    ...(state.key === key
      ? state
      : { data: null, loading: isSupabaseConfigured, error: null }),
    reload,
    configured: isSupabaseConfigured,
  };
}

export async function loadPublicCampus() {
  const client = requireSupabase();
  const now = new Date().toISOString();
  const results = await Promise.all([
    collectPages<CampusNotice>((from, to) =>
      client
        .from("notices")
        .select("*")
        .eq("status", "published")
        .lte("published_at", now)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("published_at", { ascending: false })
        .order("id")
        .range(from, to),
    ),
    client.from("clubs").select("*").eq("active", true).order("name"),
    client.from("courses").select("*").eq("active", true).order("name"),
    client
      .from("exam_events")
      .select("*")
      .eq("status", "published")
      .or(`ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`)
      .order("starts_at")
      .limit(100),
  ]);
  return {
    notices: results[0],
    clubs: checked<Club[]>(results[1]),
    courses: checked<Course[]>(results[2]),
    exams: checked<CampusExam[]>(results[3]),
  };
}

export async function loadPersonalCampus(userId: string) {
  const client = requireSupabase();
  const results = await Promise.all([
    collectPages<{ notice_id: string }>((from, to) =>
      client
        .from("notice_bookmarks")
        .select("notice_id")
        .eq("user_id", userId)
        .order("notice_id")
        .range(from, to),
    ),
    collectPages<{ notice_id: string }>((from, to) =>
      client
        .from("notice_reads")
        .select("notice_id")
        .eq("user_id", userId)
        .order("notice_id")
        .range(from, to),
    ),
    collectPages<{ club_id: string }>((from, to) =>
      client
        .from("club_follows")
        .select("club_id")
        .eq("user_id", userId)
        .order("club_id")
        .range(from, to),
    ),
  ]);
  return {
    bookmarks: results[0].map((row) => row.notice_id),
    reads: results[1].map((row) => row.notice_id),
    follows: results[2].map((row) => row.club_id),
  };
}

export async function togglePersonalItem(
  table: "notice_bookmarks" | "notice_reads" | "club_follows",
  userId: string,
  itemId: string,
  current: boolean,
) {
  const client = requireSupabase();
  const field = table === "club_follows" ? "club_id" : "notice_id";
  const result = current
    ? await client.from(table).delete().eq("user_id", userId).eq(field, itemId)
    : await client
        .from(table)
        .upsert(
          { user_id: userId, [field]: itemId },
          { onConflict: `user_id,${field}`, ignoreDuplicates: true },
        );
  if (result.error) throw new Error(result.error.message);
}

export {
  formatCampusDate,
  matchesAudience,
  validatePublication,
} from "@/components/campus/campus-logic";
