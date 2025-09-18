import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import pdfMappings from "@/data/pdfMappings.json";

interface Chapter {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  color: string;
  bgColor: string;
}

// Get chapters from central mapping (e.g. pdfMappings.json). Do NOT fall back to demo chapters when mapping not found.
const getChapters = (
  subjectId: string | undefined,
  resourceType: string | undefined,
  yearParam: string | undefined
): Chapter[] => {
  if (!subjectId || !resourceType || !yearParam) return [];

  // pdfMappings.json expected shape: PdfMappingEntry[] with year, subjectId, resourceType, chapters
  const entry = (pdfMappings as any[]).find(
    (m) =>
      m.year === yearParam &&
      m.subjectId === subjectId &&
      m.resourceType === resourceType
  );

  if (entry && Array.isArray(entry.chapters) && entry.chapters.length > 0) {
    // Map incoming mapping entries to local Chapter type
    return entry.chapters.map((c: any) => ({
      id:
        c.id ||
        `${subjectId}-${resourceType}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      title: c.title || c.id || "Untitled",
      description: c.description || "",
      fileUrl: c.fileUrl || c.file || "",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    }));
  }
  // No mapping found — return empty list. The UI will show a friendly message instead of a demo PDF.
  return [];
};

const ResourceDetails = () => {
  const { year, subjectId, resourceType } = useParams();
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

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
  };

  // Get subject name from subjectId
  const getSubjectName = (id: string | undefined) => {
    if (!id) return "Unknown Subject";

    const subjectMap: Record<string, string> = {
      // 1st year subjects
      "1st-math": "Engineering Mathematics",
      "1st-physics": "Engineering Physics",
      "1st-chemistry": "Engineering Chemistry",
      "1st-programming": "Computer Programming",
      "1st-electrical": "Basic Electrical Engineering",
      "1st-mechanics": "Engineering Mechanics",
      "1st-graphics": "Engineering Graphics",
      "1st-communication": "Communication Skills",
      "1st-environment": "Environmental Studies",
      "1st-workshop": "Workshop Practice",

      // 2nd year subjects
      "2nd-dsa": "Data Structures & Algorithms",
      "2nd-oops": "Object-Oriented Programming",
      "2nd-dbms": "Database Management Systems",
      "2nd-os": "Operating Systems",
      "2nd-coa": "Computer Organization & Architecture",
      "2nd-discrete": "Discrete Mathematics",
      "2nd-digital": "Digital Electronics",
      "2nd-signal": "Signals & Systems",
      "2nd-prob": "Probability & Statistics",
      "2nd-automata": "Automata Theory",

      // 3rd year subjects
      "3rd-web": "Web Technologies",
      "3rd-ai": "Artificial Intelligence",
      "3rd-networks": "Computer Networks",
      "3rd-se": "Software Engineering",
      "3rd-theory": "Theory of Computation",
      "3rd-compiler": "Compiler Design",
      "3rd-embedded": "Embedded Systems",
      "3rd-datamining": "Data Mining",
      "3rd-distributed": "Distributed Systems",
      "3rd-mobile": "Mobile Computing",

      // 4th year subjects
      "4th-ml": "Machine Learning",
      "4th-cloud": "Cloud Computing",
      "4th-security": "Information Security",
      "4th-bigdata": "Big Data Analytics",
      "4th-mobile": "Mobile App Development",
      "4th-iot": "Internet of Things",
      "4th-blockchain": "Blockchain Technology",
      "4th-devops": "DevOps Practices",
      "4th-nlp": "Natural Language Processing",
      "4th-ar": "AR/VR Technologies",
    };

    return subjectMap[id] || "Unknown Subject";
  };

  const info = resourceType
    ? resourceTypeInfo[resourceType as keyof typeof resourceTypeInfo]
    : null;
  const chapters =
    subjectId && resourceType ? getChapters(subjectId, resourceType, year) : [];

  const handleChapterClick = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsPdfOpen(true);
  };

  const handleClosePdf = () => {
    setIsPdfOpen(false);
  };

  if (!info) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <h1 className="text-4xl font-display font-bold text-center mb-12">
            Resource Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col items-center mb-12">
          <div
            className={`w-20 h-20 rounded-full ${info.color} ${info.textColor} flex items-center justify-center mb-4`}
          >
            <info.icon size={36} />
          </div>
          <h1 className="text-4xl font-display font-bold text-center">
            {info.title}
          </h1>
          <h2 className="text-2xl text-gray-600 mt-2">
            {getSubjectName(subjectId)}
          </h2>
          <p className="text-gray-500 mt-2">{year?.toUpperCase()} Year</p>
        </div>

        {chapters.length === 0 ? (
          <div className="max-w-3xl mx-auto py-20 text-center">
            <h3 className="text-2xl font-semibold mb-4">No resources found</h3>
            <p className="text-gray-600 mb-6">
              There are no mapped resources for{" "}
              <strong>{getSubjectName(subjectId)}</strong> ({resourceType}) in{" "}
              {year?.toUpperCase()} year.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go back
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chapters.map((chapter) => (
              <SubjectCard
                key={chapter.id}
                subject={chapter}
                onClick={handleChapterClick}
              />
            ))}
          </div>
        )}
      </div>

      <PdfViewer
        subject={selectedChapter}
        isOpen={isPdfOpen}
        onClose={handleClosePdf}
      />
    </div>
  );
};

export default ResourceDetails;
