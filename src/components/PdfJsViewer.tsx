import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PdfJsViewerProps {
  url: string;
  onLoad?: () => void;
  onError?: (err?: any) => void;
}

const PdfJsViewer = ({ url, onLoad, onError }: PdfJsViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // check states
  const [checking, setChecking] = useState<boolean>(true);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);

  useEffect(() => {
    setPageNumber(1);
    setError(null);
    setChecking(true);
    setUseIframeFallback(false);

    let cancelled = false;
    // Try a simple fetch to detect 403/404 or CORS/network errors.
    (async () => {
      try {
        const resp = await fetch(url, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
        });
        if (cancelled) return;
        if (resp.ok) {
          const ct = (resp.headers.get("content-type") || "").toLowerCase();
          if (
            ct.includes("application/pdf") ||
            url.toLowerCase().endsWith(".pdf")
          ) {
            setChecking(false);
            setUseIframeFallback(false);
            return;
          } else {
            setChecking(false);
            setError("Fetched resource is not a PDF. Content-Type: " + ct);
            setUseIframeFallback(false);
            return;
          }
        } else {
          // HTTP error — still try iframe because direct navigation may work even when fetch is blocked.
          setChecking(false);
          if (resp.status === 403) {
            setError(
              "Access denied (403) — storage account may disallow public access."
            );
          } else if (resp.status === 404) {
            setError("PDF not found (404).");
          } else {
            setError(`HTTP ${resp.status} ${resp.statusText}`);
          }
          // allow iframe fallback attempt
          setUseIframeFallback(true);
        }
      } catch (err) {
        if (cancelled) return;
        // network/CORS error — try iframe fallback and show helpful message
        console.error("Fetch error checking PDF:", err);
        setChecking(false);
        setError(
          "Network/CORS error while fetching PDF. Trying iframe fallback."
        );
        setUseIframeFallback(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
    if (onLoad) onLoad();
  }

  function onDocumentLoadError(error: any) {
    console.error("PDF load error:", error);
    setError(
      "Failed to load PDF in viewer. If this is a private blob, use a signed URL or make it public."
    );
    if (onError) onError(error);
  }

  // Show pre-check spinner
  if (checking) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If iframe fallback chosen, render iframe (works even when fetch CORS blocks programmatic fetch)
  if (useIframeFallback) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="text-sm text-gray-700">PDF (iframe fallback)</div>
        </div>
        <div className="flex-1">
          <iframe
            src={url}
            title="PDF fallback"
            className="w-full h-full border-0"
            sandbox=""
          />
          {error && (
            <div className="p-2 text-sm text-yellow-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-600 p-4 text-center">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-2 border-b">
            <div className="text-sm text-gray-700">
              Page {pageNumber} / {numPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded bg-gray-100"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  setPageNumber((p) => Math.min(numPages || 1, p + 1))
                }
                className="px-3 py-1 rounded bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-white">
            <Document
              file={url}
              externalLinkTarget="_blank"
              loading={
                <div className="flex items-center justify-center p-4">
                  Loading PDF...
                </div>
              }
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              onSourceError={onDocumentLoadError}
              className="flex items-center justify-center"
              // @ts-ignore
              crossOrigin="anonymous"
            >
              <Page pageNumber={pageNumber} width={900} />
            </Document>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfJsViewer;
