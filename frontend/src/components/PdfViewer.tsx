import { useState, useEffect, useRef } from "react";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";
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
      return `https://docs.google.com/gview?url=${encodeURIComponent(
        url
      )}&embedded=true`;
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
  const isPdfUrl = subject?.fileUrl?.toLowerCase().endsWith(".pdf");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadingTaskRef = useRef<any>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const pageCacheRef = useRef<Map<number, ImageBitmap | string>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function renderFirstPage() {
      if (!isOpen || !isPdfUrl || !subject?.fileUrl) return;
      setError(null);
      setLoading(true);
      try {
        // @ts-expect-error - pdfjs-dist legacy build has no type declarations
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
        // configure worker
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/legacy/build/pdf.worker.min.js",
            import.meta.url
          ).toString();
        } catch (e) {
          // ignore worker config errors, PDF.js may fallback
        }

        const loadingTask = pdfjs.getDocument({
          url: subject.fileUrl,
          disableStream: false,
        });
        loadingTaskRef.current = loadingTask;
        const pdf: PDFDocumentProxy = await loadingTask.promise;
        pdfRef.current = pdf;
        if (cancelled) {
          pdf.cleanup?.();
          return;
        }
        const page: PDFPageProxy = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        // size canvas appropriately for crisp rendering
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        if (context) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        const renderTask = page.render({ canvas, viewport });
        await renderTask.promise;
        // keep PDF loaded for potential further pages; we only render first page eagerly
      } catch (err: unknown) {
        console.error("PDF render error:", err);
        setError(String(err instanceof Error ? err.message : err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Start sequential background prefetch: page 2 then 3, then remaining pages (low priority)
    (function schedulePrefetch() {
      const pdfDoc = pdfRef.current;
      if (!pdfDoc || pdfDoc.numPages <= 1) return;

      const prefetch = async () => {
        const maxPrefetch = Math.min(pdfDoc.numPages, 6); // limit prefetch depth
        for (let i = 2; i <= maxPrefetch; i++) {
          try {
            // yield to idle time to avoid blocking the UI
            await new Promise((res) => setTimeout(res, 250));
            const p = await pdfDoc.getPage(i);
            const vp = p.getViewport({ scale: 1 });
            // offscreen canvas if available
            let offCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
            if (typeof OffscreenCanvas !== "undefined") {
              offCanvas = new OffscreenCanvas(
                Math.floor(vp.width),
                Math.floor(vp.height)
              );
            } else {
              offCanvas = document.createElement("canvas");
              offCanvas.width = Math.floor(vp.width);
              offCanvas.height = Math.floor(vp.height);
            }
            const offCtx = offCanvas?.getContext
              ? offCanvas.getContext("2d")
              : null;
            const rt = p.render({ canvas: offCanvas instanceof HTMLCanvasElement ? offCanvas : null, viewport: vp });
            await rt.promise;
            // try to cache image bitmap for faster display later
            try {
              if (
                typeof createImageBitmap !== "undefined" &&
                offCanvas instanceof HTMLCanvasElement
              ) {
                const blob = await new Promise<Blob | null>((resolve) =>
                  offCanvas.toBlob((b) => resolve(b))
                );
                if (blob) {
                  const bitmap = await createImageBitmap(blob);
                  pageCacheRef.current.set(i, bitmap);
                }
              }
            } catch (e) {
              // ignore per-page cache errors
            }
          } catch (e) {
            // stop prefetching on errors
            break;
          }
        }
      };

      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => prefetch(), {
          timeout: 2000,
        });
      } else {
        setTimeout(() => prefetch(), 500);
      }
    })();
    renderFirstPage();

    return () => {
      cancelled = true;
      try {
        loadingTaskRef.current?.destroy?.();
      } catch (e) {
        // ignore
      }
    };
  }, [isOpen, isPdfUrl, subject?.fileUrl]);

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
                    window.open(
                      subject.fileUrl,
                      "_blank",
                      "noopener,noreferrer"
                    )
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
            // If it's a direct PDF url (not Google Drive), use a PDF.js-powered canvas
            isPdfUrl && !embedUrl.includes("docs.google.com") ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                <div className="w-full h-full relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full block"
                    aria-label={subject?.title || "PDF canvas"}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700" />
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-600">
                      Failed to load document — defaulting to browser viewer.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Fallback to iframe/embed (Google viewer or generic URL)
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                loading="lazy"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={subject?.title || "PDF Viewer"}
              />
            )
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