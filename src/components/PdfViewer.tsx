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

  // When the dialog opens, default to full-screen mode and auto-open the resource.
  useEffect(() => {
    if (isOpen) {
      setIsFullScreen(true);

      if (subject?.fileUrl && !hasOpenedRef.current) {
        hasOpenedRef.current = true;
        window.open(subject.fileUrl, "_blank", "noopener,noreferrer");
        onClose();
      }
    } else {
      setIsFullScreen(false);
      hasOpenedRef.current = false;
    }
  }, [isOpen, subject?.fileUrl, onClose]);

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

        <div className="flex-1 mt-4 flex items-center justify-center text-gray-500">
          Opening Google Drive…
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;

