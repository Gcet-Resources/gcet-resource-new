import { File, ArrowUpRight } from "lucide-react";
import { ResourceBadges } from "@/components/ResourceBadges";
export interface SubjectResource {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  storagePath?: string;
  color: string;
  bgColor: string;
  provider?: string;
}
interface SubjectCardProps {
  subject: SubjectResource;
  onClick: (subject: SubjectResource) => void;
  year?: string;
}
export default function SubjectCard({
  subject,
  onClick,
  year,
}: SubjectCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(subject)}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-900"
    >
      <span className="flex items-center justify-between">
        <span
          className={`inline-flex rounded-xl p-3 ${subject.bgColor} ${subject.color}`}
        >
          <File size={24} />
        </span>
        <ArrowUpRight
          className="text-slate-400 group-hover:text-teal-600"
          size={20}
        />
      </span>
      <span className="mt-5 block text-lg font-semibold text-slate-900 dark:text-white">
        {subject.title}
      </span>
      <span className="mt-2 block text-sm leading-6 text-slate-500 dark:text-slate-400">
        {subject.description}
      </span>
      {year && (
        <span className="mt-4 block">
          <ResourceBadges year={year} subjectId={subject.id} />
        </span>
      )}
    </button>
  );
}
