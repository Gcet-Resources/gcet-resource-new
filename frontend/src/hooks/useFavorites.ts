import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useCatalog } from "@/context/CatalogProvider";
import { supabase } from "@/lib/supabase";
import { storageSet, storedArray, storageRemove } from "@/lib/safe-storage";

export interface FavoriteSubject {
  id: string;
  title: string;
  year: string;
  savedAt: number;
}
const KEY = "gcet-favorites";
const EMPTY_FAVORITES: FavoriteSubject[] = [];
function valid(value: unknown): value is FavoriteSubject {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "year" in value &&
    typeof value.year === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "savedAt" in value &&
    typeof value.savedAt === "number" &&
    Number.isFinite(value.savedAt)
  );
}
const announce = () => window.dispatchEvent(new Event("gcet:favorites"));

export function useFavorites() {
  const { user, membership, needsMfa, loading: authLoading } = useAuth();
  const { subjects, loading: catalogLoading } = useCatalog();
  const identity = `${user?.id || "guest"}:${needsMfa}:${membership?.status || ""}`;
  const [state, setState] = useState<{
    identity: string;
    rows: FavoriteSubject[];
  }>({ identity, rows: [] });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [revision, setRevision] = useState(0);
  const active = Boolean(
    user && membership?.status === "active" && !needsMfa && supabase,
  );
  const favorites =
    state.identity === identity && !authLoading ? state.rows : EMPTY_FAVORITES;
  useEffect(() => {
    const sync = () => setRevision((value) => value + 1);
    window.addEventListener("gcet:favorites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gcet:favorites", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    let current = true;
    setState({ identity, rows: [] });
    setError(null);
    if (authLoading) return;
    if (!user) {
      const rows = storedArray(KEY, valid).filter((row) =>
        subjects.some(
          (subject) => subject.id === row.id && subject.year === row.year,
        ),
      );
      setState({ identity, rows });
      return;
    }
    if (!active || !supabase) return;
    const client = supabase;
    const userId = user.id;
    async function load() {
      const rows: FavoriteSubject[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await client
          .from("favorites")
          .select("subject_id,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .order("subject_id")
          .range(offset, offset + 499);
        if (result.error) throw new Error(result.error.message);
        for (const row of result.data || []) {
          const subject = subjects.find((item) => item.dbId === row.subject_id);
          if (subject)
            rows.push({
              id: subject.id,
              title: subject.title,
              year: subject.year,
              savedAt: Date.parse(row.created_at),
            });
        }
        if (!result.data || result.data.length < 500) break;
      }
      if (current) setState({ identity, rows });
    }
    void load().catch((caught) => {
      if (current)
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load saved subjects.",
        );
    });
    return () => {
      current = false;
    };
  }, [user, active, subjects, authLoading, revision, identity]);

  const change = useCallback(
    async (
      subject: { id: string; year: string; title?: string },
      remove: boolean,
    ) => {
      if (locked.current) return false;
      locked.current = true;
      setBusy(true);
      setError(null);
      try {
        if (authLoading)
          throw new Error("Wait for your account to finish loading.");
        if (user) {
          if (needsMfa)
            throw new Error(
              "Complete two-step verification in Account before saving subjects.",
            );
          if (!active || !supabase)
            throw new Error(
              "Complete your college account setup before saving subjects.",
            );
          const match = subjects.find(
            (item) => item.id === subject.id && item.year === subject.year,
          );
          if (!match?.dbId)
            throw new Error(
              "This subject is not available in the account library.",
            );
          const result = remove
            ? await supabase
                .from("favorites")
                .delete()
                .eq("user_id", user.id)
                .eq("subject_id", match.dbId)
            : await supabase
                .from("favorites")
                .upsert(
                  { user_id: user.id, subject_id: match.dbId },
                  { onConflict: "user_id,subject_id", ignoreDuplicates: true },
                );
          if (result.error) throw new Error(result.error.message);
        } else {
          const match = subjects.find(
            (item) => item.id === subject.id && item.year === subject.year,
          );
          if (!remove && !match) throw new Error("Subject not found.");
          const kept = storedArray(KEY, valid).filter(
            (item) => item.id !== subject.id || item.year !== subject.year,
          );
          storageSet(
            KEY,
            JSON.stringify(
              remove
                ? kept
                : [
                    {
                      id: subject.id,
                      year: subject.year,
                      title: match?.title || subject.title,
                      savedAt: Date.now(),
                    },
                    ...kept,
                  ].slice(0, 200),
            ),
          );
        }
        announce();
        return true;
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not update saved subjects. Please retry.",
        );
        return false;
      } finally {
        locked.current = false;
        setBusy(false);
      }
    },
    [user, active, needsMfa, authLoading, subjects],
  );
  const isFavorite = useCallback(
    (id: string, year: string) =>
      favorites.some((item) => item.id === id && item.year === year),
    [favorites],
  );
  const importGuestFavorites = async () => {
    if (locked.current) return;
    if (!active || !user || !supabase || authLoading || catalogLoading) {
      setError(
        "Complete account verification and wait for the library to load before importing.",
      );
      return;
    }
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      const guestRows = storedArray(KEY, valid);
      const imports = guestRows.flatMap((item) => {
        const match = subjects.find(
          (subject) => subject.id === item.id && subject.year === item.year,
        );
        return match?.dbId
          ? [
              {
                user_id: user.id,
                subject_id: match.dbId,
                guestKey: `${item.year}/${item.id}`,
              },
            ]
          : [];
      });
      if (!imports.length && guestRows.length)
        throw new Error(
          "No browser favorites match the current catalog. Your browser list has been kept.",
        );
      const rows = [
        ...new Map(
          imports.map((row) => [
            row.subject_id,
            { user_id: row.user_id, subject_id: row.subject_id },
          ]),
        ).values(),
      ];
      if (rows.length) {
        const result = await supabase
          .from("favorites")
          .upsert(rows, {
            onConflict: "user_id,subject_id",
            ignoreDuplicates: true,
          });
        if (result.error) throw new Error(result.error.message);
      }
      const importedKeys = new Set(imports.map((row) => row.guestKey));
      const remaining = guestRows.filter(
        (item) => !importedKeys.has(`${item.year}/${item.id}`),
      );
      if (remaining.length) storageSet(KEY, JSON.stringify(remaining));
      else storageRemove(KEY);
      announce();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not import favorites.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  return {
    favorites,
    error,
    busy,
    needsVerification: Boolean(user && needsMfa),
    guestCount: active ? storedArray(KEY, valid).length : 0,
    importGuestFavorites,
    addFavorite: (subject: { id: string; title: string; year: string }) =>
      change(subject, false),
    removeFavorite: (id: string, year: string) => change({ id, year }, true),
    isFavorite,
    toggleFavorite: (subject: { id: string; title: string; year: string }) =>
      change(subject, isFavorite(subject.id, subject.year)),
  };
}
