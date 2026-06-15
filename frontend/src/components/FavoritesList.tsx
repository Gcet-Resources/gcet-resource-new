import { Star, X, ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { getYearLabel } from "@/lib/subjects";

const FavoritesList = () => {
  const { favorites, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  if (favorites.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Saved Subjects
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        {favorites.map((subject) => (
          <div
            key={`${subject.year}-${subject.id}`}
            className="flex items-center gap-2"
          >
            <button
              onClick={() =>
                navigate(`/resources/${subject.year}/${subject.id}`)
              }
              className="flex-1 flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary/5 dark:hover:bg-teal-500/10 transition-colors group"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-400">
                  {subject.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {subject.id} · {getYearLabel(subject.year)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => removeFavorite(subject.id, subject.year)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${subject.title} from favorites`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
