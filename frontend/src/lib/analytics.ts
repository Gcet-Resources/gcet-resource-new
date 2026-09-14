import ReactGA from "react-ga4";
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (
    !import.meta.env.VITE_GA_ID ||
    /^\/(login|auth|account|admin|publish|dashboard)(\/|$)/.test(
      location.pathname,
    )
  )
    return;
  try {
    ReactGA.event(name, params);
  } catch {
    /* Nonessential telemetry. */
  }
}
export function trackPdfOpen(_title: string, subjectId: string, year: string) {
  trackEvent("pdf_open", { subject_id: subjectId, year });
}
export function trackSearch(_query: string, resultCount: number) {
  trackEvent("search", { result_count: resultCount });
}
export function trackShare(subjectId: string, year: string) {
  trackEvent("share_subject", { subject_id: subjectId, year });
}
export function trackBrokenLinkReport(
  _title: string,
  _url: string,
  subjectId?: string,
) {
  trackEvent("broken_link_report", { subject_id: subjectId || "unknown" });
}
