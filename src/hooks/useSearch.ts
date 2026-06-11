import { useMemo } from "react";
import searchIndex from "@/data/search-index.json";
import { getAllSubjectsFlat } from "@/lib/subjects";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  year: string;
  color: string;
  bgColor: string;
  matchType?: "subject" | "chapter";
  resourceType?: string;
  href?: string;
}

type SearchIndexEntry = {
  year: string;
  subjectId: string;
  resourceType: string;
  title: string;
  searchText: string;
};

const subjectLookup = getAllSubjectsFlat();

export const useSearch = (query: string) => {
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    const allResults: SearchResult[] = [];
    const seen = new Set<string>();

    subjectLookup.forEach((subject) => {
      const matchesTitle = subject.title.toLowerCase().includes(searchTerm);
      const matchesId = subject.id.toLowerCase().includes(searchTerm);

      if (matchesTitle || matchesId) {
        const key = `subject-${subject.year}-${subject.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          allResults.push({
            ...subject,
            matchType: "subject",
            href: `/resources/${subject.year}/${subject.id}`,
          });
        }
      }
    });

    (searchIndex as SearchIndexEntry[]).forEach((entry) => {
      if (!entry.searchText.includes(searchTerm)) return;

      const subject = subjectLookup.find(
        (s) => s.id === entry.subjectId && s.year === entry.year
      );
      if (!subject) return;

      const key = `chapter-${entry.year}-${entry.subjectId}-${entry.resourceType}-${entry.title}`;
      if (seen.has(key)) return;
      seen.add(key);

      allResults.push({
        id: entry.subjectId,
        title: `${entry.title} — ${subject.title}`,
        description: `${entry.resourceType} · ${entry.subjectId}`,
        year: entry.year,
        color: subject.color,
        bgColor: subject.bgColor,
        matchType: "chapter",
        resourceType: entry.resourceType,
        href: `/resources/${entry.year}/${entry.subjectId}/${entry.resourceType}`,
      });
    });

    const sorted = allResults.sort((a, b) => {
      const aExact =
        a.title.toLowerCase() === searchTerm ||
        a.id.toLowerCase() === searchTerm;
      const bExact =
        b.title.toLowerCase() === searchTerm ||
        b.id.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      if (a.matchType === "subject" && b.matchType === "chapter") return -1;
      if (a.matchType === "chapter" && b.matchType === "subject") return 1;
      return 0;
    });

    return sorted.slice(0, 12);
  }, [query]);

  return results;
};
