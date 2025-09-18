import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Maximize, Minimize } from "lucide-react";
import { SubjectResource } from "./SubjectCard";
import PdfJsViewer from "./PdfJsViewer";

interface PdfViewerProps {
  subject: SubjectResource | null;
  isOpen: boolean;
  onClose: () => void;
}

const PdfViewer = ({ subject, isOpen, onClose }: PdfViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // When the dialog opens, default to full-screen mode and reset loading state.
  useEffect(() => {
    if (isOpen) {
      setIsFullScreen(true);
      setIsLoading(true);
    } else {
      setIsFullScreen(false);
    }
  }, [isOpen]);

  // Reset loading whenever the subject or its file URL changes
  useEffect(() => {
    if (isOpen && subject?.fileUrl) {
      setIsLoading(true);
    }
  }, [subject?.fileUrl, isOpen]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${
          isFullScreen
            ? "max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh]"
            : "max-w-4xl w-[90vw] max-h-[90vh]"
        } flex flex-col`}
      >
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{subject?.title}</DialogTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={toggleFullScreen}>
              {isFullScreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            {/* Download removed: viewer is view-only */}
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 min-h-[70vh] mt-4 border border-gray-200 rounded-md overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {subject?.fileUrl ? (
            <PdfJsViewer
              url={subject.fileUrl}
              onLoad={handleLoad}
              onError={handleError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No PDF selected
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
