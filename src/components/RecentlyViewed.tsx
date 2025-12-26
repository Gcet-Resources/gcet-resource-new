import { History, X, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useNavigate } from 'react-router-dom';

const RecentlyViewed = () => {
    const { recentSubjects, clearRecentSubjects } = useRecentlyViewed();
    const navigate = useNavigate();

    if (recentSubjects.length === 0) return null;

    const getYearLabel = (year: string) => {
        const labels: Record<string, string> = {
            '1st': '1st Year',
            '2nd': '2nd Year',
            '3rd': '3rd Year',
            '4th': '4th Year',
        };
        return labels[year] || year;
    };

    const handleClick = (subject: { id: string; year: string }) => {
        navigate(`/resources/${subject.year}/${subject.id}`);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary dark:text-teal-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recently Viewed
                    </h3>
                </div>
                <button
                    onClick={clearRecentSubjects}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                    <X className="w-3 h-3" />
                    Clear
                </button>
            </div>

            <div className="space-y-2">
                {recentSubjects.map((subject) => (
                    <button
                        key={`${subject.year}-${subject.id}`}
                        onClick={() => handleClick(subject)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/5 dark:hover:bg-teal-500/10 transition-colors group"
                    >
                        <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-400 transition-colors">
                                {subject.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {subject.id} • {getYearLabel(subject.year)}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary dark:group-hover:text-teal-400 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
