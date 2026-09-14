import { CalendarDays } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import {
  useCampusQuery,
  loadPublicCampus,
  formatCampusDate,
} from "@/lib/campus";
export default function ExamCountdown() {
  const { profile } = useAuth();
  const { data, loading, error } = useCampusQuery(
    "exam-calendar",
    loadPublicCampus,
  );
  const now = Date.now();
  const event = data?.exams.find(
    (e) =>
      (!e.course_id || e.course_id === profile?.course_id) &&
      (!e.academic_year || e.academic_year === profile?.academic_year) &&
      Date.parse(e.ends_at || e.starts_at) >= now,
  );
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <CalendarDays className="text-teal-600" />
        Your next exam
      </h2>
      {loading ? (
        <p role="status" className="mt-3">
          Loading calendar…
        </p>
      ) : error ? (
        <p className="mt-3 text-sm" role="alert">
          The calendar is unavailable. Please retry later.
        </p>
      ) : event ? (
        <>
          <h3 className="mt-4 font-semibold">{event.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {Date.parse(event.starts_at) <= now
              ? "Currently underway"
              : `Starts ${formatCampusDate(event.starts_at, true)}`}
          </p>
          <p className="mt-2 text-sm">{event.description}</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No upcoming exams have been published for your course.
        </p>
      )}
    </section>
  );
}
