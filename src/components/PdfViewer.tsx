import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Maximize, Minimize, Download, ExternalLink } from "lucide-react";
import { SubjectResource } from "./SubjectCard";
import { ReportBrokenLink } from "./ReportBrokenLink";
import { trackPdfOpen } from "@/lib/analytics";

interface PdfViewerProps {
  subject: SubjectResource | null;
  isOpen: boolean;
  onClose: () => void;
  subjectId?: string;
  year?: string;
  resourceType?: string;
}

const PdfViewer = ({
  subject,
  isOpen,
  onClose,
  subjectId,
  year,
  resourceType,
}: PdfViewerProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsFullScreen(true);
      if (subject && trackedRef.current !== subject.id) {
        trackedRef.current = subject.id;
        trackPdfOpen(subject.title, subjectId || "", year || "");
      }
    } else {
      setIsFullScreen(false);
    }
  }, [isOpen, subject, subjectId, year]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
      return url.replace(/\/view.*/, "/preview");
    }

    if (url.includes("drive.google.com") && url.includes("/folders/")) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
      }
    }

    if (url.endsWith(".pdf")) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }

    return url;
  };

  const getDownloadUrl = (url: string) => {
    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return url;
  };

  const embedUrl = subject?.fileUrl ? getEmbedUrl(subject.fileUrl) : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${
          isFullScreen
            ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]"
            : "max-w-4xl w-[90vw] max-h-[90vh]"
        } flex flex-col p-1 gap-0 bg-white dark:bg-gray-900 [&>button:last-child]:hidden`}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-base md:text-lg font-medium pr-8 truncate flex-1 text-left text-gray-900 dark:text-white">
            {subject?.title}
          </DialogTitle>
          <div className="flex items-center gap-1 shrink-0">
            {subject?.fileUrl && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex h-8 text-xs"
                  onClick={() =>
                    window.open(subject.fileUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-8 text-xs"
                  onClick={() =>
                    window.open(
                      getDownloadUrl(subject.fileUrl!),
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full bg-gray-100 dark:bg-gray-950 relative overflow-hidden rounded-b-lg">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={subject?.title || "PDF Viewer"}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
              <p>No document URL found.</p>
            </div>
          )}
        </div>

        {subject?.fileUrl && (
          <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-2">
            <ReportBrokenLink
              title={subject.title}
              url={subject.fileUrl}
              subjectId={subjectId}
              year={year}
              resourceType={resourceType}
              className="text-xs h-8"
            />
            <div className="flex gap-2 sm:hidden">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() =>
                  window.open(subject.fileUrl, "_blank", "noopener,noreferrer")
                }
              >
                Open in browser
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
