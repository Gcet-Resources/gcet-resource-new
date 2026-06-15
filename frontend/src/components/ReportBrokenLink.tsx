import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GITHUB_ISSUES_URL } from "@/lib/site";
import { trackBrokenLinkReport } from "@/lib/analytics";

interface ReportBrokenLinkProps {
  title: string;
  url: string;
  subjectId?: string;
  year?: string;
  resourceType?: string;
  className?: string;
}

export function ReportBrokenLink({
  title,
  url,
  subjectId,
  year,
  resourceType,
  className,
}: ReportBrokenLinkProps) {
  const handleReport = () => {
    trackBrokenLinkReport(title, url, subjectId);

    const body = [
      "## Broken link report",
      "",
      `- **Resource:** ${title}`,
      `- **URL:** ${url}`,
      subjectId ? `- **Subject:** ${subjectId}` : "",
      year ? `- **Year:** ${year}` : "",
      resourceType ? `- **Type:** ${resourceType}` : "",
      "",
      "Please describe the issue (link dead, wrong file, etc.):",
    ]
      .filter(Boolean)
      .join("\n");

    const issueUrl = `${GITHUB_ISSUES_URL}?title=${encodeURIComponent(
      `Broken link: ${title}`
    )}&body=${encodeURIComponent(body)}&labels=broken-link`;

    window.open(issueUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleReport}
    >
      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
      Report broken link
    </Button>
  );
}
