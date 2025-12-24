import { useEffect, useState, useCallback } from 'react';

export interface RecentSubject {
    id: string;
    title: string;
    year: string;
    visitedAt: number;
}

const STORAGE_KEY = 'gcet-recently-viewed';
const MAX_ITEMS = 5;

export const useRecentlyViewed = () => {
    const [recentSubjects, setRecentSubjects] = useState<RecentSubject[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRecentSubjects(parsed);
            } catch (e) {
                console.error('Failed to parse recently viewed:', e);
            }
        }
    }, []);

    // Add a subject to recently viewed
    const addRecentSubject = useCallback((subject: { id: string; title: string; year: string }) => {
        setRecentSubjects((prev) => {
            // Remove if already exists
            const filtered = prev.filter((s) => !(s.id === subject.id && s.year === subject.year));

            // Add to beginning
            const newList: RecentSubject[] = [
                {
                    ...subject,
                    visitedAt: Date.now(),
                },
                ...filtered,
            ].slice(0, MAX_ITEMS);

            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));

            return newList;
        });
    }, []);

    // Clear all recently viewed
    const clearRecentSubjects = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setRecentSubjects([]);
    }, []);

    return {
        recentSubjects,
        addRecentSubject,
        clearRecentSubjects,
    };
};
