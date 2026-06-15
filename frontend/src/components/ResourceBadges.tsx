import { RESOURCE_TYPES, getResourceAvailability } from "@/lib/subjects";
import { cn } from "@/lib/utils";

export function ResourceBadges({
  year,
  subjectId,
  className,
}: {
  year: string;
  subjectId: string;
  className?: string;
}) {
  const availability = getResourceAvailability(year, subjectId);
  const available = RESOURCE_TYPES.filter((rt) => availability[rt.id]);

  if (available.length === 0) {
    return (
      <span className={cn("text-xs text-gray-400", className)}>
        No resources yet
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {available.map((rt) => (
        <span
          key={rt.id}
          className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
        >
          {rt.shortLabel}
        </span>
      ))}
    </div>
  );
}
