import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import {
  BookText,
  FileText,
  PenTool,
  Book,
  HelpCircle,
  Grid,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFavorites } from "@/hooks/useFavorites";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  getSubjectName,
  getYearLabel,
  getResourceAvailability,
  RESOURCE_TYPES,
} from "@/lib/subjects";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const resourceMeta = {
  "pdf-notes": {
    icon: BookText,
    color: "bg-blue-100",
    textColor: "text-blue-600",
    gradient: "from-blue-50 to-blue-100",
  },
  "aktu-pyq": {
    icon: FileText,
    color: "bg-orange-100",
    textColor: "text-orange-600",
    gradient: "from-orange-50 to-orange-100",
  },
  cae: {
    icon: Grid,
    color: "bg-purple-100",
    textColor: "text-purple-600",
    gradient: "from-purple-50 to-purple-100",
  },
  handwritten: {
    icon: PenTool,
    color: "bg-rose-100",
    textColor: "text-rose-600",
    gradient: "from-rose-50 to-rose-100",
  },
  quantum: {
    icon: Book,
    color: "bg-green-100",
    textColor: "text-green-600",
    gradient: "from-green-50 to-green-100",
  },
  "question-bank": {
    icon: HelpCircle,
    color: "bg-teal-100",
    textColor: "text-teal-600",
    gradient: "from-teal-50 to-teal-100",
  },
} as const;

const SubjectResources = () => {
  const { year, subjectId } = useParams();
  const navigate = useNavigate();
  const { addRecentSubject } = useRecentlyViewed();
  const { isFavorite, toggleFavorite } = useFavorites();

  const subjectName = getSubjectName(subjectId, year);
  const availability =
    year && subjectId ? getResourceAvailability(year, subjectId) : null;

  useEffect(() => {
    if (year && subjectId && subjectName !== "Unknown Subject") {
      addRecentSubject({ id: subjectId, title: subjectName, year });
    }
  }, [year, subjectId, subjectName, addRecentSubject]);

  const pagePath = `/resources/${year}/${subjectId}`;
  const favorited = year && subjectId ? isFavorite(subjectId, year) : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Seo
        title={`${subjectName} (${subjectId}) — ${getYearLabel(year || "")}`}
        description={`Free ${subjectName} notes, AKTU PYQs, CAE papers and question banks for ${getYearLabel(
          year || ""
        )} B.Tech students at GCET.`}
        path={pagePath}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: subjectName,
          courseCode: subjectId,
          url: `${SITE_URL}${pagePath}`,
          provider: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: getYearLabel(year || ""), href: `/resources/${year}` },
            { label: subjectName },
          ]}
        />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-2 text-gray-900 dark:text-white">
            {subjectName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {getYearLabel(year || "")} · {subjectId} — Select a resource type
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {year && subjectId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggleFavorite({
                      id: subjectId,
                      title: subjectName,
                      year,
                    })
                  }
                >
                  <Star
                    className={`w-4 h-4 mr-1.5 ${
                      favorited ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                  {favorited ? "Saved" : "Save subject"}
                </Button>
                <ShareButton
                  year={year}
                  subjectId={subjectId}
                  subjectTitle={subjectName}
                />
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {RESOURCE_TYPES.map((resource, index) => {
            const meta = resourceMeta[resource.id];
            const available = availability?.[resource.id] ?? false;

            return (
              <Card
                key={resource.id}
                className={`overflow-hidden rounded-lg border-0 shadow-md transition-all duration-300 group animate-fade-up bg-gradient-to-br dark:from-gray-800 dark:to-gray-800 ${
                  available
                    ? "hover:shadow-xl cursor-pointer hover:scale-105"
                    : "opacity-60 cursor-not-allowed"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() =>
                  available &&
                  navigate(`/resources/${year}/${subjectId}/${resource.id}`)
                }
              >
                <CardContent
                  className={`p-0 h-full ${meta.gradient} dark:from-gray-800 dark:to-gray-800`}
                >
                  <div className="p-6 flex flex-col items-center text-center h-full">
                    <div
                      className={`w-16 h-16 rounded-full ${meta.color} ${meta.textColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}
                    >
                      <meta.icon size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {resource.label}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs mt-4 ${
                        available
                          ? `${meta.textColor} bg-white dark:bg-gray-700 bg-opacity-60`
                          : "text-gray-500 bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {available ? "Available" : "Coming soon"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default SubjectResources;
