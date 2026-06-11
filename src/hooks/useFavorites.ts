import { useCallback, useEffect, useState } from "react";

export interface FavoriteSubject {
  id: string;
  title: string;
  year: string;
  savedAt: number;
}

const STORAGE_KEY = "gcet-favorites";
const MAX_ITEMS = 20;

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteSubject[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const addFavorite = useCallback(
    (subject: { id: string; title: string; year: string }) => {
      setFavorites((prev) => {
        const filtered = prev.filter(
          (s) => s.id !== subject.id || s.year !== subject.year
        );
        const next = [
          { ...subject, savedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeFavorite = useCallback((id: string, year: string) => {
    setFavorites((prev) => {
      const next = prev.filter((s) => s.id !== id || s.year !== year);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string, year: string) =>
      favorites.some((s) => s.id === id && s.year === year),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (subject: { id: string; title: string; year: string }) => {
      if (isFavorite(subject.id, subject.year)) {
        removeFavorite(subject.id, subject.year);
      } else {
        addFavorite(subject);
      }
    },
    [addFavorite, isFavorite, removeFavorite]
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
}
