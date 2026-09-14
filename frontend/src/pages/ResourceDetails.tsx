import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import SubjectCard, { type SubjectResource } from "@/components/SubjectCard";
import PdfViewer from "@/components/PdfViewer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { ShareButton } from "@/components/ShareButton";
import { getYearLabel, RESOURCE_TYPES } from "@/lib/subjects";
import { useCatalog } from "@/context/CatalogProvider";
import { CatalogStatus } from "@/components/CatalogStatus";
import NotFound from "./NotFound";
export default function ResourceDetails() {
  const { year = "", subjectId = "", resourceType = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const { subjects, resources, loading, error } = useCatalog();
  const subject = subjects.find((s) => s.id === subjectId && s.year === year);
  const type = RESOURCE_TYPES.find((t) => t.id === resourceType);
  const [selected, setSelected] = useState<SubjectResource | null>(null);
  const rows = resources.filter(
    (r) =>
      r.year === year && r.subjectId === subjectId && r.type === resourceType,
  );
  useEffect(() => {
    const id = params.get("document");
    const r = resources.find(
      (r) =>
        r.id === id &&
        r.year === year &&
        r.subjectId === subjectId &&
        r.type === resourceType,
    );
    setSelected(
      r
        ? {
            id: r.id,
            title: r.title,
            description: r.description,
            fileUrl: r.url,
            storagePath: r.storagePath,
            provider: r.provider,
            color: "text-teal-700",
            bgColor: "bg-teal-50",
          }
        : null,
    );
  }, [params, resources, year, subjectId, resourceType]);
  if (!type || (!loading && !error && !subject)) return <NotFound />;
  const path = `/resources/${year}/${subjectId}/${resourceType}`;
  const missingDocument =
    !loading &&
    !error &&
    params.has("document") &&
    !rows.some((row) => row.id === params.get("document"));
  const closeDocument = () => {
    const next = new URLSearchParams(params);
    next.delete("document");
    setParams(next, { replace: true });
  };
  return (
    <>
      <Navigation />
      <Seo
        title={`${subject?.title || subjectId} · ${type.label}`}
        path={path}
      />
      <main
        id="main-content"
        className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-28"
      >
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: getYearLabel(year), href: `/resources/${year}` },
            {
              label: subject?.title || subjectId,
              href: `/resources/${year}/${subjectId}`,
            },
            { label: type.label },
          ]}
        />
        <div className="my-10">
          <p className="text-sm text-teal-700">
            {subject?.title} · {getYearLabel(year)}
          </p>
          <h1 className="mb-5 mt-3 text-4xl font-bold">{type.label}</h1>
          <ShareButton
            year={year}
            subjectId={subjectId}
            subjectTitle={subject?.title || subjectId}
            path={`${path}${params.toString() ? `?${params}` : ""}`}
          />
        </div>
        <CatalogStatus />
        {missingDocument && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            This document is unavailable or is no longer published. Choose
            another resource below.{" "}
            <button
              className="ml-1 font-semibold underline"
              onClick={closeDocument}
            >
              Dismiss
            </button>
          </div>
        )}
        {!loading &&
          !error &&
          (rows.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((r) => (
                <SubjectCard
                  key={r.id}
                  subject={{
                    id: r.id,
                    title: r.title,
                    description: r.description || "Open this resource",
                    fileUrl: r.url,
                    storagePath: r.storagePath,
                    provider: r.provider,
                    color: "text-teal-700",
                    bgColor: "bg-teal-50",
                  }}
                  onClick={() => setParams({ document: r.id })}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <h2 className="text-xl font-semibold">
                Resources are being prepared
              </h2>
              <p className="my-3 text-slate-500">
                Nothing is published here yet. Check another resource category.
              </p>
              <Link
                className="text-teal-700 underline"
                to={`/resources/${year}/${subjectId}`}
              >
                Back to {subject?.title}
              </Link>
            </div>
          ))}
      </main>
      <PdfViewer
        subject={selected}
        isOpen={Boolean(selected)}
        onClose={closeDocument}
        year={year}
        subjectId={subjectId}
        resourceType={resourceType}
      />
    </>
  );
}
