import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Maximize, Minimize } from "lucide-react";
import { SubjectResource } from "./SubjectCard";


interface PdfViewerProps {
  subject: SubjectResource | null;
  isOpen: boolean;
  onClose: () => void;
}

const PdfViewer = ({ subject, isOpen, onClose }: PdfViewerProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const hasOpenedRef = useRef(false);


  // When the dialog opens, default to full-screen mode
  useEffect(() => {
    if (isOpen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  }, [isOpen]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // Handle Google Drive File URLs (convert /view to /preview)
    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
      return url.replace(/\/view.*/, "/preview");
    }

    // Handle Google Drive Folder URLs (convert to embedded folder view)
    if (url.includes("drive.google.com") && url.includes("/folders/")) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
      }
    }

    // Handle direct PDF links (use Google Docs Viewer)
    if (url.endsWith(".pdf")) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(
        url
      )}&embedded=true`;
    }

    return url;
  };

  const embedUrl = subject ? getEmbedUrl(subject.fileUrl) : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${isFullScreen
          ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]"
          : "max-w-4xl w-[90vw] max-h-[90vh]"
          } flex flex-col p-1 gap-0 bg-white dark:bg-gray-900 [&>button:last-child]:hidden`}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-base md:text-lg font-medium pr-8 truncate flex-1 text-left text-gray-900 dark:text-white">
            {subject?.title}
          </DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            {subject?.fileUrl && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex h-8 text-xs"
                onClick={() =>
                  window.open(subject.fileUrl, "_blank", "noopener,noreferrer")
                }
              >
                Open Original
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleFullScreen}
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

        {/* Mobile Open Button Footer */}
        {subject?.fileUrl && (
          <div className="sm:hidden p-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Button
              className="w-full bg-primary dark:bg-teal-600 text-white"
              onClick={() =>
                window.open(subject.fileUrl, "_blank", "noopener,noreferrer")
              }
            >
              Open in Drive App / Browser
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default PdfViewer;

