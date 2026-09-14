import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { storageSet, storedArray, storageRemove } from "@/lib/safe-storage";
export interface RecentSubject {
  id: string;
  title: string;
  year: string;
  visitedAt: number;
}
function valid(x: unknown): x is RecentSubject {
  return (
    typeof x === "object" &&
    x !== null &&
    "id" in x &&
    typeof x.id === "string" &&
    "title" in x &&
    typeof x.title === "string" &&
    "year" in x &&
    typeof x.year === "string" &&
    "visitedAt" in x &&
    typeof x.visitedAt === "number"
  );
}
export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const key = `gcet-recently-viewed:${user?.id || "guest"}`;
  const [recentSubjects, setRecentSubjects] = useState<RecentSubject[]>([]);
  useEffect(() => {
    const sync = () => setRecentSubjects(storedArray(key, valid).slice(0, 5));
    sync();
    window.addEventListener("gcet:history", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gcet:history", sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);
  const addRecentSubject = useCallback(
    (s: { id: string; title: string; year: string }) => {
      const rows = storedArray(key, valid).filter(
        (x) => x.id !== s.id || x.year !== s.year,
      );
      storageSet(
        key,
        JSON.stringify([{ ...s, visitedAt: Date.now() }, ...rows].slice(0, 5)),
      );
      window.dispatchEvent(new Event("gcet:history"));
    },
    [key],
  );
  const clearRecentSubjects = () => {
    storageRemove(key);
    window.dispatchEvent(new Event("gcet:history"));
  };
  return { recentSubjects, addRecentSubject, clearRecentSubjects };
};
