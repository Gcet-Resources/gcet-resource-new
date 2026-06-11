import ReactGA from "react-ga4";

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  ReactGA.event(name, params);
}

export function trackPdfOpen(title: string, subjectId: string, year: string) {
  trackEvent("pdf_open", { title, subject_id: subjectId, year });
}

export function trackSearch(query: string, resultCount: number) {
  trackEvent("search", { search_term: query, result_count: resultCount });
}

export function trackShare(subjectId: string, year: string) {
  trackEvent("share_subject", { subject_id: subjectId, year });
}

export function trackBrokenLinkReport(
  title: string,
  url: string,
  subjectId?: string
) {
  trackEvent("broken_link_report", {
    title,
    url,
    subject_id: subjectId || "unknown",
  });
}
