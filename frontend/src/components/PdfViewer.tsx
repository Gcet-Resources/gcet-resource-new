import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  RotateCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { SubjectResource } from "./SubjectCard";
import { safeSource, sourceKind, drivePreview } from "@/lib/resource-source";
import { requireSupabase } from "@/lib/supabase";
import { ResourceReport } from "@/components/ResourceReport";
interface Props {
  subject: SubjectResource | null;
  isOpen: boolean;
  onClose: () => void;
  subjectId?: string;
  year?: string;
  resourceType?: string;
}
export default function PdfViewer({
  subject,
  isOpen,
  onClose,
  subjectId,
  year,
  resourceType,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const doc = useRef<PDFDocumentProxy | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const kind = url ? sourceKind(url) : "external";
  const isPdf =
    kind === "pdf" ||
    Boolean(subject?.storagePath) ||
    (kind === "external" && subject?.provider === "pdf");
  useEffect(() => {
    let active = true;
    setUrl(null);
    setError("");
    setPage(1);
    setPages(0);
    setZoom(1);
    if (!isOpen || !subject) return;
    setLoading(true);
    async function resolve() {
      if (subject?.storagePath) {
        const { data, error } = await requireSupabase()
          .storage.from("resources")
          .createSignedUrl(subject.storagePath, 300);
        if (error) throw error;
        return data.signedUrl;
      }
      return safeSource(subject?.fileUrl);
    }
    resolve()
      .then((value) => {
        if (active) {
          if (!value) setError("This document has no supported source.");
          setUrl(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "This document is unavailable or your access has expired. Sign in or try again.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [isOpen, subject, revision]);
  useEffect(() => {
    let active = true;
    let destroy: (() => void) | undefined;
    doc.current = null;
    if (!isOpen || !url || !isPdf) return;
    setLoading(true);
    setError("");
    import("pdfjs-dist")
      .then((pdf) => {
        if (!active) return;
        pdf.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
        const task = pdf.getDocument({ url });
        destroy = () => {
          void task.destroy();
        };
        return task.promise;
      })
      .then((document) => {
        if (active && document) {
          doc.current = document;
          setPages(document.numPages);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(
            "The embedded reader could not load this PDF. Open the original document or retry.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
      doc.current = null;
      destroy?.();
    };
  }, [url, isPdf, isOpen]);
  useEffect(() => {
    let active = true;
    let render: RenderTask | undefined;
    const document = doc.current;
    if (!document || !canvas.current || !pages) return;
    setLoading(true);
    document
      .getPage(page)
      .then((pdfPage) => {
        if (!active || !canvas.current) return;
        const viewport = pdfPage.getViewport({ scale: zoom * 1.35 });
        const target = canvas.current;
        const context = target.getContext("2d");
        if (!context) throw new Error("Canvas is not available");
        target.width = viewport.width;
        target.height = viewport.height;
        render = pdfPage.render({
          canvas: target,
          canvasContext: context,
          viewport,
        });
        return render.promise;
      })
      .then(() => {
        if (active) setLoading(false);
      })
      .catch((e: unknown) => {
        if (
          active &&
          !(e instanceof Error && e.name === "RenderingCancelledException")
        ) {
          setError(
            "This page could not be rendered. Try another page or open the original.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
      render?.cancel();
    };
  }, [page, pages, zoom, url]);
  const preview = url ? drivePreview(url) : null;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="flex h-[90dvh] max-w-6xl flex-col p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle>{subject?.title || "Document"}</DialogTitle>
          <DialogDescription>
            Read the document here, or open the original for downloads and an
            alternative accessible reader.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          {isPdf && pages > 0 && (
            <>
              <Button
                size="icon"
                variant="outline"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
              </Button>
              <span aria-live="polite" className="min-w-24 text-center text-sm">
                Page {page} of {pages}
              </span>
              <Button
                size="icon"
                variant="outline"
                aria-label="Next page"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom out"
                disabled={zoom <= 0.5}
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              >
                <ZoomOut />
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Zoom in"
                disabled={zoom >= 2.5}
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
              >
                <ZoomIn />
              </Button>
            </>
          )}
          {url && (
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2" size={16} />
                Open original / download
              </a>
            </Button>
          )}
          {subject && (
            <ResourceReport
              resourceId={subject.id}
              title={subject.title}
              subjectId={subjectId}
              year={year}
              resourceType={resourceType}
            />
          )}
          <Button variant="ghost" onClick={() => setRevision((n) => n + 1)}>
            <RotateCw className="mr-2" size={16} />
            Retry
          </Button>
        </div>
        {loading && (
          <p role="status" className="text-sm text-slate-500">
            Loading document…
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
          >
            {error}
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-auto rounded-xl bg-slate-100 p-2 dark:bg-slate-950">
          {url && isPdf ? (
            <canvas
              ref={canvas}
              className="mx-auto max-w-none bg-white"
              aria-label={`Document page ${page}. Use Open original for a text-accessible reader.`}
            />
          ) : preview ? (
            <iframe
              title={`${subject?.title} preview`}
              src={preview}
              className="h-full w-full border-0"
              onLoad={() => setLoading(false)}
              allow="fullscreen"
            />
          ) : url ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <h2 className="text-xl font-semibold">
                {kind === "drive-folder"
                  ? "Open the resource folder"
                  : "Continue to the resource"}
              </h2>
              <p className="max-w-md text-slate-500">
                This source opens on its original website. If it requires
                access, use the source owner's sharing instructions.
              </p>
              <a
                className="rounded-xl bg-teal-700 px-5 py-3 text-white"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open resource <ExternalLink className="ml-2 inline" size={16} />
              </a>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
