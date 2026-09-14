import type { CampusNotice } from "@/lib/campus";

export function formatCampusDate(
  value: string | null | undefined,
  withTime = false,
) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function matchesAudience(
  notice: Pick<
    CampusNotice,
    "scope" | "course_id" | "academic_year" | "club_id"
  >,
  profile: { course_id?: string | null; academic_year?: number | null } | null,
  follows: string[],
) {
  if (notice.academic_year && notice.academic_year !== profile?.academic_year)
    return false;
  if (notice.scope === "club")
    return !!notice.club_id && follows.includes(notice.club_id);
  if (notice.scope === "course" && notice.course_id !== profile?.course_id)
    return false;
  return (
    !notice.academic_year || notice.academic_year === profile?.academic_year
  );
}

export function validatePublication(
  table: string,
  values: Record<string, unknown>,
): string | null {
  for (const key of ["published_at", "expires_at", "starts_at", "ends_at"]) {
    if (values[key] && Number.isNaN(new Date(String(values[key])).getTime()))
      return "Enter a valid date and time.";
  }
  if (
    values.academic_year &&
    (!Number.isInteger(Number(values.academic_year)) ||
      Number(values.academic_year) < 1 ||
      Number(values.academic_year) > 4)
  )
    return "Choose an academic year from 1 to 4.";
  if ("title" in values && !String(values.title || "").trim())
    return "Enter a title.";
  if ("name" in values && !String(values.name || "").trim())
    return "Enter a name.";
  if (table === "notices") {
    if (!String(values.body || "").trim())
      return "Enter the announcement text.";
    if (values.scope === "course" && !values.course_id)
      return "Choose the course for this announcement.";
    if (values.scope === "club" && !values.club_id)
      return "Choose the club for this announcement.";
    if (values.status === "published" && !values.published_at)
      return "Choose a publication date and time.";
    if (
      values.expires_at &&
      values.published_at &&
      new Date(String(values.expires_at)) <=
        new Date(String(values.published_at))
    )
      return "Expiry must be after publication.";
  }
  if (table === "resources") {
    if (!values.subject_id) return "Choose a subject.";
    const source = String(values.source_url || "").trim();
    if (source) {
      try {
        if (new URL(source).protocol !== "https:")
          return "Use an HTTPS resource URL.";
      } catch {
        return "Enter a complete, valid resource URL.";
      }
    }
    if (values.status === "published" && !source && !values.storage_path)
      return "Add a resource URL or storage path before publishing.";
  }
  if (table === "exam_events") {
    if (!values.starts_at) return "Choose when the exam starts.";
    if (
      values.ends_at &&
      new Date(String(values.ends_at)) <= new Date(String(values.starts_at))
    )
      return "The end must be after the start.";
  }
  if (
    table === "clubs" &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(values.slug || ""))
  )
    return "Use a club slug with lowercase letters, numbers and hyphens.";
  return null;
}
