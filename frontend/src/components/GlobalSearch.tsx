import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { getYearLabel } from "@/lib/subjects";
import { trackSearch } from "@/lib/analytics";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const results = useSearch(query);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const lastTracked = useRef("");

  useEffect(() => {
    setSelectedIndex(0);
    if (query.trim() && results.length > 0 && lastTracked.current !== query) {
      lastTracked.current = query;
      trackSearch(query, results.length);
    }
  }, [results, query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      navigate(result.href || `/resources/${result.year}/${result.id}`);
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, handleSelect]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search subjects and resources"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-up"
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, PYQs, chapters (e.g. BCS301, 2024 odd)"
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-lg"
            aria-label="Search query"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <div className="ml-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
            ESC
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No results for &quot;{query}&quot;
            </div>
          )}

          {results.length > 0 && (
            <ul className="py-2" role="listbox">
              {results.map((result, index) => (
                <li
                  key={`${result.year}-${result.id}-${result.title}-${index}`}
                >
                  <button
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full px-4 py-3 flex items-center gap-4 transition-colors ${
                      index === selectedIndex
                        ? "bg-primary/10 dark:bg-teal-500/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${result.bgColor} flex items-center justify-center text-sm font-bold ${result.color}`}
                    >
                      {result.id.slice(0, 3)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {result.id} · {getYearLabel(result.year)}
                        {result.matchType === "chapter" && " · Chapter match"}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <ArrowRight className="w-4 h-4 text-primary dark:text-teal-400" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!query && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">Search subjects, PYQs, and chapter titles</p>
              <p className="text-sm">
                Try &quot;Data Structure&quot;, &quot;BCS301&quot;, or
                &quot;2024 odd&quot;
              </p>
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              ↑↓
            </span>
            Navigate
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              Enter
            </span>
            Select
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              Esc
            </span>
            Close
          </div>
        </div>
      </div>
    </div>
  );
};
