import subjectsData from "@/data/subjects.json";
import availabilityData from "@/data/pdfMappings/availability.json";
import type { SubjectResource } from "@/components/SubjectCard";

export type SubjectsByYear = Record<
  string,
  Array<{
    id: string;
    title: string;
    description: string;
    color: string;
    bgColor: string;
  }>
>;

export type ResourceTypeId =
  | "pdf-notes"
  | "aktu-pyq"
  | "cae"
  | "handwritten"
  | "quantum"
  | "question-bank";

export const RESOURCE_TYPES: Array<{
  id: ResourceTypeId;
  label: string;
  shortLabel: string;
}> = [
  { id: "pdf-notes", label: "PDF Notes", shortLabel: "Notes" },
  { id: "aktu-pyq", label: "AKTU PYQ", shortLabel: "PYQ" },
  { id: "cae", label: "CAE", shortLabel: "CAE" },
  { id: "handwritten", label: "Handwritten Notes", shortLabel: "HW" },
  { id: "quantum", label: "Quantum Notes", shortLabel: "Quantum" },
  { id: "question-bank", label: "Question Bank", shortLabel: "QB" },
];

const subjectsByYear = subjectsData as SubjectsByYear;
const availability = availabilityData as Record<
  string,
  Record<string, boolean>
>;

export const YEAR_KEYS = ["1st", "2nd", "3rd", "4th"] as const;

export function getSubjectsForYear(year: string): SubjectResource[] {
  return subjectsByYear[year] || [];
}

export function getSubjectName(
  subjectId: string | undefined,
  year?: string
): string {
  if (!subjectId) return "Unknown Subject";

  if (year) {
    const match = getSubjectsForYear(year).find((s) => s.id === subjectId);
    if (match) return match.title;
  }

  for (const y of YEAR_KEYS) {
    const match = getSubjectsForYear(y).find((s) => s.id === subjectId);
    if (match) return match.title;
  }

  return "Unknown Subject";
}

export function getAllSubjectsFlat(): Array<
  SubjectResource & { year: string }
> {
  return YEAR_KEYS.flatMap((year) =>
    getSubjectsForYear(year).map((s) => ({ ...s, year }))
  );
}

export function getResourceAvailability(
  year: string,
  subjectId: string
): Record<ResourceTypeId, boolean> {
  const key = `${year}/${subjectId}`;
  const entry = availability[key] || {};
  const result = {} as Record<ResourceTypeId, boolean>;
  for (const rt of RESOURCE_TYPES) {
    result[rt.id] = Boolean(entry[rt.id]);
  }
  return result;
}

export function getYearLabel(year: string): string {
  const labels: Record<string, string> = {
    "1st": "1st Year",
    "2nd": "2nd Year",
    "3rd": "3rd Year",
    "4th": "4th Year",
  };
  return labels[year] || year;
}
