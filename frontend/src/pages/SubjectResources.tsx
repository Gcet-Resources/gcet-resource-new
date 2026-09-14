import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { FileText, ArrowUpRight, Star } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFavorites } from "@/hooks/useFavorites";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { getYearLabel, RESOURCE_TYPES } from "@/lib/subjects";
import { useCatalog } from "@/context/CatalogProvider";
import { CatalogStatus } from "@/components/CatalogStatus";
import NotFound from "./NotFound";
export default function SubjectResources() {
  const { year = "", subjectId = "" } = useParams();
  const { subjects, resources, loading, error } = useCatalog();
  const subject = subjects.find((s) => s.year === year && s.id === subjectId);
  const { addRecentSubject } = useRecentlyViewed();
  const {
    isFavorite,
    toggleFavorite,
    error: saveError,
    busy,
    needsVerification,
  } = useFavorites();
  useEffect(() => {
    if (subject)
      addRecentSubject({
        id: subject.id,
        title: subject.title,
        year: subject.year,
      });
  }, [subject, addRecentSubject]);
  if (!loading && !error && !subject) return <NotFound />;
  return (
    <>
      <Navigation />
      <Seo
        title={subject?.title || "Subject resources"}
        path={`/resources/${year}/${subjectId}`}
      />
      <main
        id="main-content"
        className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28"
      >
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: getYearLabel(year), href: `/resources/${year}` },
            { label: subject?.title || subjectId },
          ]}
        />
        <CatalogStatus />
        {subject && (
          <>
            <div className="my-10">
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
                {getYearLabel(year)} · {subjectId}
              </p>
              <h1 className="mt-3 text-4xl font-bold">{subject.title}</h1>
              <p className="mt-3 text-slate-500">{subject.description}</p>
              <div className="mt-6 flex gap-3">
                {needsVerification ? (
                  <Button variant="outline" asChild>
                    <Link to="/account#security">Verify to save</Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    aria-pressed={isFavorite(subjectId, year)}
                    disabled={busy}
                    onClick={() =>
                      void toggleFavorite({
                        id: subjectId,
                        title: subject.title,
                        year,
                      })
                    }
                  >
                    <Star
                      size={16}
                      className={
                        isFavorite(subjectId, year)
                          ? "mr-2 fill-amber-400 text-amber-500"
                          : "mr-2"
                      }
                    />
                    {isFavorite(subjectId, year) ? "Saved" : "Save subject"}
                  </Button>
                )}
                <ShareButton
                  year={year}
                  subjectId={subjectId}
                  subjectTitle={subject.title}
                />
              </div>
              {saveError && (
                <p role="alert" className="mt-3 text-red-600">
                  {saveError}
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {RESOURCE_TYPES.map((type) => {
                const count = resources.filter(
                  (r) =>
                    r.year === year &&
                    r.subjectId === subjectId &&
                    r.type === type.id,
                ).length;
                const content = (
                  <>
                    <div className="flex justify-between">
                      <FileText
                        className={count ? "text-teal-600" : "text-slate-400"}
                      />
                      {count > 0 && <ArrowUpRight size={20} />}
                    </div>
                    <h2 className="mt-6 text-xl font-semibold">{type.label}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {count
                        ? `${count} published ${count === 1 ? "resource" : "resources"}`
                        : "Content is being prepared"}
                    </p>
                    <span
                      className={`mt-5 inline-block rounded-full px-3 py-1 text-xs ${count ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
                    >
                      {count ? "Available" : "Coming soon"}
                    </span>
                  </>
                );
                return count ? (
                  <Link
                    key={type.id}
                    to={`/resources/${year}/${subjectId}/${type.id}`}
                    className="rounded-2xl border bg-card p-6 transition hover:border-teal-500 hover:shadow-md"
                  >
                    {content}
                  </Link>
                ) : (
                  <section
                    key={type.id}
                    className="rounded-2xl border border-dashed p-6"
                  >
                    {content}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
