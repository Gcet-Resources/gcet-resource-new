import type { Chapter, PdfMappingEntry } from "@/lib/types";

const yearModules: Record<
  string,
  () => Promise<{ default: PdfMappingEntry[] }>
> = {
  "1st": () => import("@/data/pdfMappings/1st.json"),
  "2nd": () => import("@/data/pdfMappings/2nd.json"),
  "3rd": () => import("@/data/pdfMappings/3rd.json"),
  "4th": () => import("@/data/pdfMappings/4th.json"),
};

const cache: Partial<Record<string, PdfMappingEntry[]>> = {};

export async function loadPdfMappingsForYear(
  year: string
): Promise<PdfMappingEntry[]> {
  if (cache[year]) return cache[year]!;

  const loader = yearModules[year];
  if (!loader) return [];

  const module = await loader();
  cache[year] = module.default;
  return module.default;
}

export async function getChaptersForResource(
  year: string,
  subjectId: string,
  resourceType: string
): Promise<Chapter[]> {
  const mappings = await loadPdfMappingsForYear(year);
  const entry = mappings.find(
    (m) => m.subjectId === subjectId && m.resourceType === resourceType
  );

  if (!entry?.chapters?.length) return [];

  return entry.chapters.map((c) => ({
    id: c.id,
    title: c.title,
    fileUrl: c.fileUrl,
    description: c.description,
    pages: c.pages,
  }));
}
