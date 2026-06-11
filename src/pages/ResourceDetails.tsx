import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import {
  BookText,
  FileText,
  PenTool,
  Book,
  HelpCircle,
  Grid,
} from "lucide-react";
import SubjectCard, { SubjectResource } from "@/components/SubjectCard";
import PdfViewer from "@/components/PdfViewer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { ReportBrokenLink } from "@/components/ReportBrokenLink";
import { ShareButton } from "@/components/ShareButton";
import { Skeleton } from "@/components/ui/skeleton";
import { usePdfMappings } from "@/hooks/usePdfMappings";
import {
  getSubjectName,
  getYearLabel,
  RESOURCE_TYPES,
} from "@/lib/subjects";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const resourceTypeInfo = {
  "pdf-notes": {
    title: "PDF Notes",
    icon: BookText,
    color: "bg-blue-100",
    textColor: "text-blue-600",
  },
  "aktu-pyq": {
    title: "AKTU PYQ",
    icon: FileText,
    color: "bg-orange-100",
    textColor: "text-orange-600",
  },
  cae: {
    title: "CAE",
    icon: Grid,
    color: "bg-purple-100",
    textColor: "text-purple-600",
  },
  handwritten: {
    title: "Handwritten Notes",
    icon: PenTool,
    color: "bg-rose-100",
    textColor: "text-rose-600",
  },
  quantum: {
    title: "Quantum Notes",
    icon: Book,
    color: "bg-green-100",
    textColor: "text-green-600",
  },
  "question-bank": {
    title: "Question Bank",
    icon: HelpCircle,
    color: "bg-teal-100",
    textColor: "text-teal-600",
  },
} as const;

const ResourceDetails = () => {
  const { year, subjectId, resourceType } = useParams();
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<SubjectResource | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const { chapters, loading, error } = usePdfMappings(
    year,
    subjectId,
    resourceType
  );

  const info = resourceType
    ? resourceTypeInfo[resourceType as keyof typeof resourceTypeInfo]
    : null;

  const subjectName = getSubjectName(subjectId, year);
  const typeLabel =
    RESOURCE_TYPES.find((r) => r.id === resourceType)?.label ||
    resourceType ||
    "Resources";

  const mappedChapters: SubjectResource[] = chapters.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || "",
    fileUrl: c.fileUrl,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  }));

  const handleChapterClick = (chapter: SubjectResource) => {
    setSelectedChapter(chapter);
    setIsPdfOpen(true);
  };

  if (!info) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <Navigation />
        <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
          <h1 className="text-4xl font-display font-bold text-center mb-12 text-gray-900 dark:text-white">
            Resource Not Found
          </h1>
        </main>
      </div>
    );
  }

  const pagePath = `/resources/${year}/${subjectId}/${resourceType}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Seo
        title={`${subjectName} ${typeLabel} — ${getYearLabel(year || "")}`}
        description={`Download ${subjectName} (${subjectId}) ${typeLabel} for AKTU B.Tech ${getYearLabel(year || "")}. Free GCET student resources.`}
        path={pagePath}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: `${subjectName} — ${typeLabel}`,
          description: `${typeLabel} for ${subjectId}`,
          url: `${SITE_URL}${pagePath}`,
          provider: { "@type": "Organization", name: SITE_NAME },
          educationalLevel: getYearLabel(year || ""),
        }}
      />
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: getYearLabel(year || ""), href: `/resources/${year}` },
            {
              label: subjectName,
              href: `/resources/${year}/${subjectId}`,
            },
            { label: typeLabel },
          ]}
        />

        <div className="flex flex-col items-center mb-12">
          <div
            className={`w-20 h-20 rounded-full ${info.color} ${info.textColor} flex items-center justify-center mb-4`}
          >
            <info.icon size={36} />
          </div>
          <h1 className="text-4xl font-display font-bold text-center text-gray-900 dark:text-white">
            {info.title}
          </h1>
          <h2 className="text-2xl text-gray-600 dark:text-gray-300 mt-2">
            {subjectName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {getYearLabel(year || "")} · {subjectId}
          </p>
          <div className="mt-4 flex gap-2">
            <ShareButton
              year={year || ""}
              subjectId={subjectId || ""}
              subjectTitle={subjectName}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="max-w-3xl mx-auto py-20 text-center">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Failed to load resources
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 bg-primary dark:bg-teal-600 text-white rounded-md"
            >
              Go back
            </button>
          </div>
        ) : mappedChapters.length === 0 ? (
          <div className="max-w-3xl mx-auto py-20 text-center">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              No resources found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              There are no mapped resources for{" "}
              <strong>{subjectName}</strong> ({typeLabel}) in{" "}
              {getYearLabel(year || "")}.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-primary dark:bg-teal-600 text-white rounded-md hover:bg-primary/90"
              >
                Go back
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Request content
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mappedChapters.map((chapter) => (
              <SubjectCard
                key={chapter.id}
                subject={chapter}
                onClick={handleChapterClick}
              />
            ))}
          </div>
        )}
      </main>

      <PdfViewer
        subject={selectedChapter}
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        subjectId={subjectId}
        year={year}
        resourceType={resourceType}
      />
    </div>
  );
};

export default ResourceDetails;
