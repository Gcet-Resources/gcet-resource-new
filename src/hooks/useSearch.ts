import { useState, useMemo } from 'react';
import subjectsData from '@/data/subjects.json';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    year: string;
    color: string;
    bgColor: string;
}

type SubjectsData = {
    [key: string]: Array<{
        id: string;
        title: string;
        description: string;
        color: string;
        bgColor: string;
    }>;
};

export const useSearch = (query: string) => {
    const results = useMemo(() => {
        if (!query.trim()) return [];

        const searchTerm = query.toLowerCase().trim();
        const allResults: SearchResult[] = [];

        const years = ['1st', '2nd', '3rd', '4th'];

        years.forEach((year) => {
            const subjects = (subjectsData as SubjectsData)[year] || [];

            subjects.forEach((subject) => {
                const matchesTitle = subject.title.toLowerCase().includes(searchTerm);
                const matchesId = subject.id.toLowerCase().includes(searchTerm);

                if (matchesTitle || matchesId) {
                    allResults.push({
                        ...subject,
                        year,
                    });
                }
            });
        });

        // Sort by relevance: exact matches first, then partial matches
        return allResults.sort((a, b) => {
            const aExact = a.title.toLowerCase() === searchTerm || a.id.toLowerCase() === searchTerm;
            const bExact = b.title.toLowerCase() === searchTerm || b.id.toLowerCase() === searchTerm;

            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // Then sort by title starting with search term
            const aStarts = a.title.toLowerCase().startsWith(searchTerm);
            const bStarts = b.title.toLowerCase().startsWith(searchTerm);

            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return 0;
        }).slice(0, 10); // Limit to 10 results
    }, [query]);

    return results;
};
