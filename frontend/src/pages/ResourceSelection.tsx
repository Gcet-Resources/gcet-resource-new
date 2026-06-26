import { Navigation } from "@/components/Navigation";
import { useParams, useNavigate } from "react-router-dom";
import SubjectCard, { SubjectResource } from "@/components/SubjectCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Seo } from "@/components/Seo";
import { getSubjectsForYear, getYearLabel } from "@/lib/subjects";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const ResourceSelection = () => {
  const { year } = useParams();
  const navigate = useNavigate();

  const yearPrefix = year?.split(" ")[0] || "1st";
  const subjects = getSubjectsForYear(yearPrefix);
  const yearLabel = getYearLabel(yearPrefix);

  const handleSubjectClick = (subject: SubjectResource) => {
    navigate(`/resources/${yearPrefix}/${subject.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Seo
        title={`${yearLabel} Study Materials — AKTU Notes & PYQs`}
        description={`Browse all ${yearLabel} B.Tech subjects — free PDF notes, AKTU PYQs, CAE papers and more for GCET students.`}
        path={`/resources/${yearPrefix}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${yearLabel} Resources`,
          url: `${SITE_URL}/resources/${yearPrefix}`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME },
        }}
      />
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
        <Breadcrumbs
          items={[
            { label: "Resources", href: "/year-selection" },
            { label: yearLabel },
          ]}
        />

        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white text-center mb-4">
          Study Material for {yearLabel}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Do not use college email to download resources. Use your personal
          e-mail ID.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={handleSubjectClick}
              year={yearPrefix}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default ResourceSelection;
