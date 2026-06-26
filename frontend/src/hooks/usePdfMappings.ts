import { useEffect, useState } from "react";
import { getChaptersForResource } from "@/lib/pdfMappings";
import type { Chapter } from "@/lib/types";

export function usePdfMappings(
  year: string | undefined,
  subjectId: string | undefined,
  resourceType: string | undefined
) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year || !subjectId || !resourceType) {
      setChapters([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getChaptersForResource(year, subjectId, resourceType)
      .then((data) => {
        if (!cancelled) setChapters(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load resources");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, subjectId, resourceType]);

  return { chapters, loading, error };
}
