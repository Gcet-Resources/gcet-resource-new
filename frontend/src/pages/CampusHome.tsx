import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Megaphone,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import {
  useCampusQuery,
  loadPublicCampus,
  formatCampusDate,
} from "@/lib/campus";
import {
  CampusShell,
  panelClass,
  actionClass,
  secondaryClass,
  SectionHeading,
  EmptyState,
  LoadingState,
  ErrorState,
  ConnectionState,
} from "@/components/campus/CampusShell";
import { NoticeCard } from "@/components/campus/NoticeCard";

export default function CampusHome() {
  const { user } = useAuth();
  const campus = useCampusQuery("public-campus-home", loadPublicCampus);
  const nextExam = campus.data?.exams[0];
  return (
    <CampusShell
      title="A little more connected."
      description="Your studies, your people, your campus. Find what you need and keep up with what’s happening at GCET."
      path="/"
      eyebrow="THE GCET CAMPUS COMPANION"
      actions={
        <Link className={secondaryClass} to={user ? "/dashboard" : "/login"}>
          {user ? "My dashboard" : "College sign in"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <section className="relative mb-9 grid overflow-hidden rounded-[2rem] bg-[#073f38] text-white md:grid-cols-[1.4fr_1fr]">
        <div className="relative p-7 sm:p-10 lg:p-12">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-white/5 px-3 py-1.5 text-xs text-teal-100">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            Built around student life
          </div>
          <h2 className="max-w-lg font-display text-4xl leading-[1.15] sm:text-5xl">
            Less looking around.
            <br />
            <span className="text-teal-200">More getting ahead.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-teal-100/80">
            Notes before class. An update you shouldn’t miss. A club that feels
            like your people. Make this your starting point.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/year-selection"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-teal-900 hover:bg-teal-50"
            >
              Explore study materials <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/notices"
              className="inline-flex items-center rounded-xl border border-teal-200/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Campus notices
            </Link>
          </div>
        </div>
        <div className="relative flex flex-col justify-center gap-3 border-t border-white/10 bg-white/[0.035] p-7 sm:p-10 md:border-l md:border-t-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-200/70">
            Make room for what matters
          </p>
          {[
            {
              icon: BookOpen,
              label: "A library for every year",
              description: "Notes, question papers and subject materials.",
              to: "/year-selection",
            },
            {
              icon: Megaphone,
              label: "Stay in the loop",
              description: "Read campus, course and council updates.",
              to: "/notices",
            },
            {
              icon: Users,
              label: "Find your circle",
              description: "Discover clubs and follow their updates.",
              to: "/clubs",
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
            >
              <span className="rounded-xl bg-teal-200/10 p-3 text-teal-200">
                <item.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-teal-100/65">
                  {item.description}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-teal-200 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <SectionHeading
            title="Around campus"
            action={
              <Link
                to="/notices"
                className="text-sm font-semibold text-teal-700 dark:text-teal-400"
              >
                View all →
              </Link>
            }
          />
          {!campus.configured ? (
            <ConnectionState />
          ) : campus.loading ? (
            <LoadingState />
          ) : campus.error ? (
            <ErrorState message={campus.error} retry={campus.reload} />
          ) : campus.data?.notices.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {campus.data.notices.slice(0, 4).map((notice) => (
                <NoticeCard key={notice.id} notice={notice} compact />
              ))}
            </div>
          ) : (
            <EmptyState title="A quiet moment on campus">
              Published announcements will appear here. Check back when your
              campus team has something to share.
            </EmptyState>
          )}
        </section>
        <aside className="space-y-5">
          <section className={panelClass}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold">On the academic calendar</h2>
            {nextExam ? (
              <>
                <p className="mt-3 text-sm font-medium">{nextExam.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCampusDate(nextExam.starts_at, true)} IST
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {nextExam.description}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {campus.loading
                  ? "Checking upcoming dates…"
                  : !campus.configured || campus.error
                    ? "The campus calendar is currently unavailable."
                    : "No upcoming exam dates have been published yet."}
              </p>
            )}
          </section>
          <section className="rounded-3xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-900 dark:bg-teal-950/30">
            <GraduationCap className="h-6 w-6 text-teal-700 dark:text-teal-400" />
            <h2 className="mt-4 text-lg font-semibold">
              Your own campus corner
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Set your course, year and semester. Save announcements and bring
              the clubs you follow into one feed.
            </p>
            <Link
              to={user ? "/dashboard" : "/login"}
              className={`${actionClass} mt-5`}
            >
              {user ? "Open my dashboard" : "Get started"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </CampusShell>
  );
}
