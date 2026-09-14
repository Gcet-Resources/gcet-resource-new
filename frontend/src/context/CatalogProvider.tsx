/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getAllSubjectsFlat, RESOURCE_TYPES } from "@/lib/subjects";
import { safeSource } from "@/lib/resource-source";
import type { SubjectResource } from "@/components/SubjectCard";
import type { PdfMappingEntry } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";

export type CatalogSubject = SubjectResource & {
  year: string;
  dbId?: string;
  courseId?: string | null;
};
export type CatalogResource = {
  id: string;
  subjectId: string;
  year: string;
  type: string;
  title: string;
  description: string;
  url: string;
  storagePath?: string;
  provider?: string;
  sortOrder?: number;
};
type CatalogState = {
  subjects: CatalogSubject[];
  resources: CatalogResource[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};
const CatalogContext = createContext<CatalogState | undefined>(undefined);
const localSubjects: CatalogSubject[] = getAllSubjectsFlat();
const localLoaders = [
  () => import("@/data/pdfMappings/1st.json"),
  () => import("@/data/pdfMappings/2nd.json"),
  () => import("@/data/pdfMappings/3rd.json"),
  () => import("@/data/pdfMappings/4th.json"),
];
export function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<CatalogSubject[]>(
    isSupabaseConfigured ? [] : localSubjects,
  );
  const [resources, setResources] = useState<CatalogResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(async () => {
    setRevision((n) => n + 1);
  }, []);
  useEffect(() => {
    const changed = () => {
      void refresh();
    };
    window.addEventListener("gcet:catalog-changed", changed);
    window.addEventListener("focus", changed);
    return () => {
      window.removeEventListener("gcet:catalog-changed", changed);
      window.removeEventListener("focus", changed);
    };
  }, [refresh]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    async function load() {
      if (!supabase) {
        const chunks = await Promise.all(localLoaders.map((load) => load()));
        const rows = chunks
          .flatMap((chunk) => chunk.default as PdfMappingEntry[])
          .flatMap((group) =>
            localSubjects.some(
              (s) => s.year === group.year && s.id === group.subjectId,
            )
              ? group.chapters.flatMap((chapter, i) => {
                  const url = safeSource(chapter.fileUrl);
                  return url
                    ? [
                        {
                          id: `${group.year}/${group.subjectId}/${group.resourceType}/${chapter.id}/${i}`,
                          subjectId: group.subjectId,
                          year: group.year,
                          type: group.resourceType,
                          title: chapter.title,
                          description: chapter.description || "",
                          url,
                        },
                      ]
                    : [];
                })
              : [],
          );
        if (active) {
          setSubjects(localSubjects);
          setResources(rows);
        }
        return;
      }
      const subjectRows: Array<{
        id: string;
        legacy_code: string;
        year: string;
        title: string;
        description: string;
        color: string;
        bg_color: string;
        course_id: string | null;
      }> = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("id")
          .range(offset, offset + 499);
        if (error) throw error;
        subjectRows.push(...(data || []));
        if (!data || data.length < 500) break;
      }
      const mapped = subjectRows.map((row) => ({
        id: row.legacy_code,
        dbId: row.id,
        year: row.year,
        title: row.title,
        description: row.description || "",
        color: row.color || "text-teal-700",
        bgColor: row.bg_color || "bg-teal-50",
        courseId: row.course_id,
      }));
      const next: CatalogResource[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase
          .from("resources")
          .select(
            "id,subject_id,resource_type,title,description,source_url,storage_path,provider,sort_order",
          )
          .eq("status", "published")
          .order("sort_order")
          .order("id")
          .range(offset, offset + 499);
        if (error) throw error;
        for (const row of data || []) {
          const subject = mapped.find((s) => s.dbId === row.subject_id);
          const url = safeSource(row.source_url);
          if (
            subject &&
            RESOURCE_TYPES.some((type) => type.id === row.resource_type) &&
            (url || row.storage_path)
          )
            next.push({
              id: row.id,
              subjectId: subject.id,
              year: subject.year,
              type: row.resource_type,
              title: row.title,
              description: row.description || "",
              url: url || "",
              storagePath: row.storage_path || undefined,
              provider: row.provider,
              sortOrder: row.sort_order,
            });
        }
        if (!data || data.length < 500) break;
      }
      if (active) {
        setSubjects(mapped);
        setResources(next);
      }
    }
    load()
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the catalog. Please retry.",
          );
          setSubjects([]);
          setResources([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision, user?.id]);
  return (
    <CatalogContext.Provider
      value={{ subjects, resources, loading, error, refresh }}
    >
      {children}
    </CatalogContext.Provider>
  );
}
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("CatalogProvider is missing");
  return value;
}
