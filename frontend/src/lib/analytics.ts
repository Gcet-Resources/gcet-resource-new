import ReactGA from "react-ga4";

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>
) {
  try {
    // react-ga4 exposes different helper names across versions — prefer `event`, fallback to `send`.
    // `event` may be undefined in some versions; use `send({ name, params })` for GA4-compatible call.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ga = ReactGA as any;
    if (typeof ga.event === "function") {
      // some versions accept (name, params)
      ga.event(name, params);
    } else if (typeof ga.send === "function") {
      // GA4-style send
      ga.send({ name, params });
    }
  } catch (e) {
    // swallow analytics errors to avoid breaking the app
    // console.debug('analytics error', e);
  }
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