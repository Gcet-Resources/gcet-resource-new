import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { useNavigate } from 'react-router-dom';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const results = useSearch(query);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [results]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex, onClose]);

    const handleSelect = (result: SearchResult) => {
        navigate(`/resources/${result.year}/${result.id}`);
        onClose();
    };

    const getYearLabel = (year: string) => {
        const labels: Record<string, string> = {
            '1st': '1st Year',
            '2nd': '2nd Year',
            '3rd': '3rd Year',
            '4th': '4th Year',
        };
        return labels[year] || year;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search subjects by name or code (e.g., 'BCS301' or 'Data Structure')"
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                    <div className="ml-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
                        ESC
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {query && results.length === 0 && (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No subjects found for "{query}"
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="py-2">
                            {results.map((result, index) => (
                                <button
                                    key={`${result.year}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full px-4 py-3 flex items-center gap-4 transition-colors ${index === selectedIndex
                                            ? 'bg-primary/10 dark:bg-teal-500/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${result.bgColor} flex items-center justify-center text-sm font-bold ${result.color}`}>
                                        {result.id.slice(0, 3)}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {result.title}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {result.id} • {getYearLabel(result.year)}
                                        </div>
                                    </div>
                                    {index === selectedIndex && (
                                        <ArrowRight className="w-4 h-4 text-primary dark:text-teal-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {!query && (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-2">Search for subjects across all years</p>
                            <p className="text-sm">Try "Data Structure", "BCS301", or "Machine Learning"</p>
                        </div>
                    )}
                </div>

                {/* Footer with keyboard hints */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑↓</span>
                        <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Enter</span>
                        <span>Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Esc</span>
                        <span>Close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
