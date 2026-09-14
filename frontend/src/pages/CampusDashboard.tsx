import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  GraduationCap,
  Settings2,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useCatalog } from "@/context/CatalogProvider";
import {
  checked,
  loadPersonalCampus,
  loadPublicCampus,
  useCampusQuery,
  matchesAudience,
  formatCampusDate,
} from "@/lib/campus";
import { requireSupabase } from "@/lib/supabase";
import {
  CampusShell,
  CampusGuard,
  panelClass,
  actionClass,
  secondaryClass,
  SectionHeading,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components/campus/CampusShell";
import { NoticeCard } from "@/components/campus/NoticeCard";

function DashboardContent() {
  const { user, profile } = useAuth();
  const catalog = useCatalog();
  const guestFavorites = useFavorites();
  const campus = useCampusQuery(`dashboard:${user!.id}`, async () => {
    const [publicData, personal, favoritesResult] = await Promise.all([
      loadPublicCampus(),
      loadPersonalCampus(user!.id),
      requireSupabase()
        .from("favorites")
        .select("subject_id")
        .eq("user_id", user!.id),
    ]);
    return {
      ...publicData,
      personal,
      favorites: checked<{ subject_id: string }[]>(favoritesResult).map(
        (row) => row.subject_id,
      ),
    };
  });
  const course = campus.data?.courses.find(
    (item) => item.id === profile?.course_id,
  );
  const year = profile?.academic_year
    ? ["1st", "2nd", "3rd", "4th"][profile.academic_year - 1]
    : null;
  const mySubjects = catalog.subjects.filter(
    (subject) =>
      !!profile?.course_id &&
      subject.courseId === profile.course_id &&
      (!year || subject.year === year),
  );
  const sharedSubjects = catalog.subjects.filter(
    (subject) => !subject.courseId && (!year || subject.year === year),
  );
  const savedSubjects = catalog.subjects.filter(
    (subject) => subject.dbId && campus.data?.favorites.includes(subject.dbId),
  );
  const forYou =
    campus.data?.notices.filter((notice) =>
      matchesAudience(notice, profile, campus.data?.personal.follows || []),
    ) || [];
  const exams =
    campus.data?.exams.filter(
      (exam) =>
        (!exam.course_id || exam.course_id === profile?.course_id) &&
        (!exam.academic_year || exam.academic_year === profile?.academic_year),
    ) || [];
  const followedClubs =
    campus.data?.clubs.filter((club) =>
      campus.data?.personal.follows.includes(club.id),
    ) || [];
  const renderSubjects = (subjects: typeof mySubjects) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {subjects.slice(0, 8).map((subject) => {
        const resources = catalog.resources.filter(
          (resource) =>
            resource.subjectId === subject.id && resource.year === subject.year,
        );
        return (
          <Link
            to={`/resources/${subject.year}/${subject.id}`}
            key={`${subject.year}/${subject.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-teal-400 hover:bg-teal-50/40 dark:border-slate-800 dark:hover:bg-teal-950/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold tracking-widest text-slate-400">
                {subject.id}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold">
                {subject.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {resources.length
                  ? `${resources.length} resource${resources.length === 1 ? "" : "s"}`
                  : "Materials coming soon"}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-700" />
          </Link>
        );
      })}
    </div>
  );
  return (
    <>
      <section className="mb-8 grid gap-5 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 sm:p-8 dark:border-teal-900 dark:from-teal-950/50 dark:to-slate-900 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-teal-700 dark:text-teal-400">
            <GraduationCap className="h-4 w-4" />
            Your academic space
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {course?.name || "Make your dashboard yours"}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {profile?.academic_year
              ? `Year ${profile.academic_year}`
              : "Year not selected"}{" "}
            <span className="mx-2">/</span>{" "}
            {profile?.semester
              ? `Semester ${profile.semester}`
              : "Semester not selected"}
          </p>
          {!profile?.course_id && (
            <p className="mt-3 text-sm text-slate-500">
              Choose your course to bring relevant announcements into your feed.
            </p>
          )}
        </div>
        <div className="flex items-center">
          <Link className={secondaryClass} to="/account">
            <Settings2 className="h-4 w-4" />
            Edit academic profile
          </Link>
        </div>
      </section>
      {campus.error && (
        <div className="mb-6">
          <ErrorState message={campus.error} retry={campus.reload} />
        </div>
      )}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className={panelClass}>
            <SectionHeading
              title="Your study shelf"
              action={
                <Link
                  to="/year-selection"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400"
                >
                  Full library →
                </Link>
              }
            />
            {catalog.loading ? (
              <LoadingState label="Loading your subjects…" />
            ) : catalog.error ? (
              <ErrorState
                message={catalog.error}
                retry={() => void catalog.refresh()}
              />
            ) : (
              <>
                {mySubjects.length ? (
                  renderSubjects(mySubjects)
                ) : (
                  <EmptyState
                    title={
                      profile?.course_id
                        ? "Your course shelf is being organised"
                        : "Start with the shared library"
                    }
                  >
                    Course-specific subjects appear after the campus team
                    assigns them. You can browse the shared year catalog below.
                  </EmptyState>
                )}
                {sharedSubjects.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-1 text-sm font-semibold">
                      Shared catalog {year && `· ${year} year`}
                    </h3>
                    <p className="mb-4 text-xs leading-5 text-slate-500">
                      These materials have no course assignment yet. Check your
                      syllabus for subject and semester relevance.
                    </p>
                    {renderSubjects(sharedSubjects)}
                    {sharedSubjects.length > 8 && (
                      <Link
                        to={year ? `/resources/${year}` : "/year-selection"}
                        className="mt-4 inline-block text-xs font-semibold text-teal-700 dark:text-teal-400"
                      >
                        Browse all {sharedSubjects.length} shared subjects →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
          <section>
            <SectionHeading
              title="Updates for you"
              action={
                <Link
                  to="/notices"
                  className="text-xs font-semibold text-teal-700 dark:text-teal-400"
                >
                  All announcements →
                </Link>
              }
            />
            {campus.loading ? (
              <LoadingState />
            ) : campus.error ? (
              <EmptyState title="Your feed is unavailable">
                Retry above to load campus announcements.
              </EmptyState>
            ) : forYou.length ? (
              <div className="space-y-3">
                {forYou.slice(0, 4).map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    read={campus.data?.personal.reads.includes(notice.id)}
                    compact
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="You’re all caught up">
                Campus updates and announcements for your course or followed
                clubs will appear here.
              </EmptyState>
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <section className={panelClass}>
            <SectionHeading
              title="Saved subjects"
              count={campus.loading ? undefined : savedSubjects.length}
            />
            {guestFavorites.guestCount > 0 && (
              <button
                disabled={guestFavorites.busy}
                onClick={async () => {
                  await guestFavorites.importGuestFavorites();
                  campus.reload();
                }}
                className="mb-4 text-left text-xs font-semibold text-teal-700 underline dark:text-teal-400"
              >
                Import {guestFavorites.guestCount} saved subjects from this
                browser
              </button>
            )}
            {guestFavorites.error && (
              <div className="mb-3">
                <ErrorState message={guestFavorites.error} />
              </div>
            )}
            {savedSubjects.length ? (
              <div className="space-y-3">
                {savedSubjects.slice(0, 6).map((subject) => (
                  <Link
                    key={subject.dbId}
                    to={`/resources/${subject.year}/${subject.id}`}
                    className="flex items-center gap-3 text-sm hover:text-teal-700 dark:hover:text-teal-400"
                  >
                    <Bookmark className="h-4 w-4 shrink-0 text-teal-600" />
                    <span>{subject.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                Save subjects from the library to keep them close.
              </p>
            )}
          </section>
          <section className={panelClass}>
            <SectionHeading title="Coming up" />
            <CalendarDays className="mb-4 h-5 w-5 text-amber-600" />
            {exams.length ? (
              <div className="space-y-5">
                {exams.slice(0, 3).map((exam) => (
                  <div key={exam.id}>
                    <p className="text-sm font-semibold">{exam.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {formatCampusDate(exam.starts_at, true)} IST
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                {campus.loading
                  ? "Checking the calendar…"
                  : "No upcoming exams published for your profile."}
              </p>
            )}
          </section>
          <section className="rounded-3xl bg-teal-900 p-6 text-white">
            <Users className="h-6 w-6 text-teal-200" />
            <h2 className="mt-4 text-lg font-semibold">Your campus circles</h2>
            {followedClubs.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {followedClubs.map((club) => (
                  <Link
                    to="/clubs"
                    key={club.id}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-teal-100 hover:bg-white/20"
                  >
                    {club.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-teal-100/75">
                Follow clubs to bring their updates into your campus feed.
              </p>
            )}
            <Link
              to="/clubs"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-100"
            >
              Explore clubs <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function CampusDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.display_name?.trim().split(/\s+/)[0];
  return (
    <CampusShell
      title={
        firstName ? `Good to see you, ${firstName}.` : "Your campus dashboard."
      }
      description="A place for your subjects, saved updates and campus community."
      path="/dashboard"
      privatePage
      actions={
        <Link to="/year-selection" className={actionClass}>
          <BookOpen className="h-4 w-4" />
          Browse resources
        </Link>
      }
    >
      <CampusGuard>
        <DashboardContent />
      </CampusGuard>
    </CampusShell>
  );
}
