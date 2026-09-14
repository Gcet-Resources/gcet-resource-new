import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/context/AuthProvider";
import { MfaSettings } from "@/components/auth/MfaSettings";
import {
  authErrorMessage,
  safeReturnPath,
  validateProfilePreferences,
} from "@/lib/auth-policy";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

type Course = { id: string; code: string; name: string; department: string };
const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export default function Account() {
  const auth = useAuth();
  const [params] = useSearchParams();
  const returnTo = safeReturnPath(params.get("next"));
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "signout" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(auth.profile?.display_name ?? "");
    setCourseId(auth.profile?.course_id ?? "");
    setYear(auth.profile?.academic_year?.toString() ?? "");
    setSemester(auth.profile?.semester?.toString() ?? "");
  }, [
    auth.profile?.id,
    auth.profile?.display_name,
    auth.profile?.course_id,
    auth.profile?.academic_year,
    auth.profile?.semester,
  ]);

  const loadCourses = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCoursesLoading(false);
      return;
    }
    setCoursesLoading(true);
    setCourseError(null);
    try {
      const result = await requireSupabase()
        .from("courses")
        .select("id,code,name,department")
        .eq("active", true)
        .order("name");
      if (result.error) throw result.error;
      setCourses((result.data ?? []) as Course[]);
    } catch (cause) {
      setCourseError(
        authErrorMessage(
          cause,
          "Course choices could not be loaded. You can leave the course unset and choose it later.",
        ),
      );
    } finally {
      setCoursesLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (busy || auth.needsMfa) return;
    const academicYear = year ? Number(year) : null;
    const semesterNumber = semester ? Number(semester) : null;
    const validation = validateProfilePreferences(
      name,
      academicYear,
      semesterNumber,
    );
    if (validation) {
      setError(validation);
      return;
    }
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const result = await requireSupabase().rpc("complete_onboarding", {
        p_display_name: name.trim(),
        p_course_id: courseId || null,
        p_academic_year: academicYear,
        p_semester: semesterNumber,
      });
      if (result.error) throw result.error;
      setMessage("Your profile and study preferences have been saved.");
      try {
        await auth.refreshProfile();
      } catch {
        setError(
          "Your preferences were saved, but account loading failed. Use Retry loading to refresh your account.",
        );
      }
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "Your profile could not be saved. Please check your details and try again.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    setBusy("signout");
    setError(null);
    try {
      await auth.signOut();
    } catch (cause) {
      setError(
        authErrorMessage(
          cause,
          "Signout could not be completed. Please try again.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }

  const content = !isSupabaseConfigured ? (
    <div className="rounded-2xl border bg-card p-8">
      <h1 className="text-2xl font-semibold">
        Campus accounts are coming online
      </h1>
      <p className="mt-3 text-muted-foreground">
        Account services are not available on this deployment yet. You can still
        browse public resources.
      </p>
      <Button asChild className="mt-6">
        <Link to="/year-selection">Explore resources</Link>
      </Button>
    </div>
  ) : auth.loading ? (
    <p role="status" className="flex items-center gap-2 py-16">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Loading
      your account…
    </p>
  ) : !auth.user && !auth.error ? (
    <Navigate to="/login?next=%2Faccount" replace />
  ) : (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
            Your campus profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {auth.profile ? "Account & preferences" : "Make yourself at home"}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {auth.profile
              ? "Choose what you study and keep your account secure."
              : "Your college email is verified. Add your name to finish setting up your student account."}
          </p>
        </div>
        {auth.user && (
          <Button
            variant="outline"
            disabled={Boolean(busy)}
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {busy === "signout" ? "Signing out…" : "Sign out"}
          </Button>
        )}
      </div>
      {(error || auth.error) && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
        >
          {error || auth.error}
          {auth.error && (
            <Button
              variant="outline"
              className="ml-3"
              onClick={() => void auth.refreshProfile().catch(() => {})}
            >
              Retry loading
            </Button>
          )}
        </div>
      )}
      {auth.user && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-6">
            {auth.membership?.status === "suspended" ||
            auth.membership?.status === "pending" ? (
              <div
                role="status"
                className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
              >
                <h2 className="text-lg font-semibold">
                  {auth.membership.status === "suspended"
                    ? "Your campus access is suspended"
                    : "Your campus access needs review"}
                </h2>
                <p className="mt-2 text-sm">
                  Contact the campus team to review your membership. Editing
                  your profile will not restore access.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/contact">Contact the team</Link>
                </Button>
              </div>
            ) : (
              <section
                aria-labelledby="profile-title"
                className="rounded-2xl border bg-card p-6 sm:p-8"
              >
                <div className="flex gap-3">
                  <UserRound
                    className="h-6 w-6 shrink-0 text-teal-700 dark:text-teal-300"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 id="profile-title" className="text-xl font-semibold">
                      Your details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Study preferences help personalize your campus updates.
                      You can change them later.
                    </p>
                  </div>
                </div>
                <form onSubmit={saveProfile} className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="profile-name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Full name
                    </label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      minLength={2}
                      maxLength={100}
                      required
                      disabled={Boolean(busy) || Boolean(auth.error)}
                      placeholder="Your full name"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="profile-email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Verified college email
                    </label>
                    <Input
                      id="profile-email"
                      value={auth.user.email ?? ""}
                      readOnly
                      className="h-11 bg-muted/50"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your verified college identity is managed separately from
                      study preferences.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="profile-course"
                      className="mb-2 block text-sm font-medium"
                    >
                      Course{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </label>
                    <select
                      id="profile-course"
                      value={courseId}
                      onChange={(event) => setCourseId(event.target.value)}
                      disabled={
                        Boolean(busy) || coursesLoading || Boolean(auth.error)
                      }
                      className={selectClass}
                    >
                      <option value="">
                        {coursesLoading
                          ? "Loading courses…"
                          : "Choose later / all courses"}
                      </option>
                      {courseId &&
                        !courses.some((course) => course.id === courseId) && (
                          <option value={courseId}>
                            Previously selected course
                          </option>
                        )}
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} — {course.name}
                        </option>
                      ))}
                    </select>
                    {courseError ? (
                      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                        {courseError}{" "}
                        <button
                          type="button"
                          className="underline"
                          onClick={() => void loadCourses()}
                        >
                          Retry courses
                        </button>
                      </p>
                    ) : (
                      !coursesLoading &&
                      courses.length === 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          No course list has been published yet. You can add
                          this preference later.
                        </p>
                      )
                    )}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="profile-year"
                        className="mb-2 block text-sm font-medium"
                      >
                        Academic year{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <select
                        id="profile-year"
                        value={year}
                        onChange={(event) => {
                          setYear(event.target.value);
                          if (
                            semester &&
                            event.target.value &&
                            Math.ceil(Number(semester) / 2) !==
                              Number(event.target.value)
                          )
                            setSemester("");
                        }}
                        disabled={Boolean(busy) || Boolean(auth.error)}
                        className={selectClass}
                      >
                        <option value="">All years / choose later</option>
                        {[1, 2, 3, 4].map((value) => (
                          <option key={value} value={value}>
                            Year {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="profile-semester"
                        className="mb-2 block text-sm font-medium"
                      >
                        Semester{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </label>
                      <select
                        id="profile-semester"
                        value={semester}
                        onChange={(event) => setSemester(event.target.value)}
                        disabled={Boolean(busy) || Boolean(auth.error)}
                        className={selectClass}
                      >
                        <option value="">Choose later</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8]
                          .filter(
                            (value) =>
                              !year || Math.ceil(value / 2) === Number(year),
                          )
                          .map((value) => (
                            <option key={value} value={value}>
                              Semester {value}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  {auth.needsMfa && (
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Complete your second verification step below before saving
                      profile changes.
                    </p>
                  )}
                  {message && (
                    <p
                      role="status"
                      className="flex items-center gap-2 text-sm text-teal-800 dark:text-teal-200"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {message}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={
                      Boolean(busy) || Boolean(auth.error) || auth.needsMfa
                    }
                  >
                    {busy === "save" ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />{" "}
                        Saving…
                      </>
                    ) : auth.profile ? (
                      "Save preferences"
                    ) : (
                      "Create my student profile"
                    )}
                  </Button>
                </form>
              </section>
            )}
            <MfaSettings />
          </div>
          <aside className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Your campus access</h2>
            <p className="mt-2 break-all text-sm text-muted-foreground">
              {auth.user.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {auth.roles.length ? (
                [...new Set(auth.roles.map((item) => item.role))].map(
                  (role) => (
                    <span
                      key={role}
                      className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize"
                    >
                      {role.replace("_", " ")}
                    </span>
                  ),
                )
              ) : (
                <span className="text-sm text-muted-foreground">
                  Finish profile setup to activate student access.
                </span>
              )}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Staff, club head, council, and administrator roles are assigned by
              campus administrators.
            </p>
            {auth.membership?.status === "active" && !auth.needsMfa && (
              <Button asChild className="mt-6 w-full">
                <Link to={returnTo === "/account" ? "/dashboard" : returnTo}>
                  Continue to campus{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {auth.needsMfa && (
              <a
                href="#security"
                className="mt-5 block text-sm font-medium underline underline-offset-4"
              >
                Complete your second verification step
              </a>
            )}
          </aside>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Seo
        title="Account & preferences"
        description="Manage your GCET campus profile, study preferences, and account security."
        path="/account"
        noIndex
      />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6" aria-hidden="true" /> GCET Campus
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Campus dashboard
        </Link>
      </header>
      <main id="main-content" className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        {content}
      </main>
    </div>
  );
}
