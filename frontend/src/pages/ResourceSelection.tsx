import { Navigation } from "@/components/Navigation";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import SubjectCard from "@/components/SubjectCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { getYearLabel, YEAR_KEYS } from "@/lib/subjects";
import { useCatalog } from "@/context/CatalogProvider";
import { useAuth } from "@/context/AuthProvider";
import { CatalogStatus } from "@/components/CatalogStatus";
import NotFound from "./NotFound";
export default function ResourceSelection() {
  const { year = "" } = useParams();
  const navigate = useNavigate();
  const { subjects, loading, error } = useCatalog();
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [myCourse, setMyCourse] = useState(false);
  if (!YEAR_KEYS.some((y) => y === year)) return <NotFound />;
  const found = subjects.filter(
    (s) =>
      s.year === year &&
      (!myCourse || !s.courseId || s.courseId === profile?.course_id) &&
      `${s.id} ${s.title}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Navigation />
      <Seo
        title={`${getYearLabel(year)} resources`}
        path={`/resources/${year}`}
      />
      <main
        id="main-content"
        className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28"
      >
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: getYearLabel(year) },
          ]}
        />
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-teal-700">
          Your study library
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          {getYearLabel(year)} resources
        </h1>
        <p className="mt-4 text-slate-500">
          Find your subject, then choose notes, papers and practice material.
          Only published sources are marked available.
        </p>
        <div className="my-8 flex flex-wrap items-center gap-4">
          <label className="flex-1">
            {" "}
            <span className="sr-only">Filter subjects</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject or code"
              className="w-full rounded-xl border bg-background px-4 py-3"
            />
          </label>
          {profile?.course_id && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={myCourse}
                onChange={(e) => setMyCourse(e.target.checked)}
              />
              My course and shared subjects
            </label>
          )}
        </div>
        <CatalogStatus />
        {!loading &&
          !error &&
          (found.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {found.map((s) => (
                <SubjectCard
                  key={s.id}
                  subject={s}
                  year={year}
                  onClick={() => navigate(`/resources/${year}/${s.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border p-8 text-center text-slate-500">
              No matching subjects. Try another search or course filter.
            </p>
          ))}
      </main>
    </>
  );
}
