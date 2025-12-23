import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookText,
  PenTool,
  Book,
  Grid,
  FileText,
  HelpCircle,
} from "lucide-react";
import SubjectCard, { SubjectResource } from "@/components/SubjectCard";
import pdfMappings from "@/data/pdfMappings.json"; // Example path
import subjectsData from "@/data/subjects.json";
import type { Chapter, PdfMappingEntry } from "@/lib/types";

// load subjects from JSON file
const getSubjectsForYear = (year: string): SubjectResource[] => {
  return (subjectsData as any)[year] || [];
};

const ResourceSelection = () => {
  const { year } = useParams();
  const navigate = useNavigate();

  const resources = [
    {
      title: "PDF NOTES",
      icon: BookText,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      link: "#pdf-notes",
    },
    {
      title: "Handwritten notes",
      icon: PenTool,
      color: "bg-rose-100",
      textColor: "text-rose-600",
      link: "#",
    },
    {
      title: "Quantum notes",
      icon: Book,
      color: "bg-green-100",
      textColor: "text-green-600",
      link: "#",
    },
    {
      title: "CAE papers",
      icon: Grid,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      link: "#",
    },
    {
      title: "Aktu PYQ's",
      icon: FileText,
      color: "bg-orange-100",
      textColor: "text-orange-600",
      link: "#",
    },
    {
      title: "Question banks",
      icon: HelpCircle,
      color: "bg-teal-100",
      textColor: "text-teal-600",
      link: "#",
    },
  ];

  const yearPrefix = year?.split(" ")[0] || "1st";
  const subjects = getSubjectsForYear(yearPrefix);

  const handleSubjectClick = (subject: SubjectResource) => {
    navigate(`/resources/${yearPrefix}/${subject.id}`);
  };

  const getChapters = (subjectId: string, resourceType: string): Chapter[] => {
    const entry = pdfMappings.find(
      (m) =>
        m.year === yearPrefix &&
        m.subjectId === subjectId &&
        m.resourceType === resourceType
    );
    return entry ? entry.chapters : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white text-center mb-4">
          Study Material for {year?.toUpperCase()} Year
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Do not use college email to download resources. Use your personal
          E-mail ID
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onClick={handleSubjectClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceSelection;
