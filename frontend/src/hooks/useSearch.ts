import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogProvider";
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
export const useSearch = (query: string) => {
  const { subjects, resources } = useCatalog();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const found: SearchResult[] = subjects
      .filter((s) => `${s.id} ${s.title}`.toLowerCase().includes(q))
      .map((s) => ({
        ...s,
        matchType: "subject",
        href: `/resources/${s.year}/${s.id}`,
      }));
    resources
      .filter((r) =>
        `${r.subjectId} ${r.title} ${r.type}`.toLowerCase().includes(q),
      )
      .forEach((r) => {
        const s = subjects.find(
          (s) => s.year === r.year && s.id === r.subjectId,
        );
        if (s)
          found.push({
            ...s,
            title: `${r.title} — ${s.title}`,
            matchType: "chapter",
            resourceType: r.type,
            href: `/resources/${r.year}/${r.subjectId}/${r.type}?document=${encodeURIComponent(r.id)}`,
          });
      });
    return found
      .sort(
        (a, b) =>
          Number(b.id.toLowerCase() === q) - Number(a.id.toLowerCase() === q) ||
          Number(a.matchType === "chapter") - Number(b.matchType === "chapter"),
      )
      .slice(0, 20);
  }, [query, subjects, resources]);
};
