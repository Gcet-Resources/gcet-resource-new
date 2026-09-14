import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
const privateRoute = /^\/(login|auth|account|admin|publish|dashboard)(\/|$)/;
export default function GoogleAnalytics() {
  const { pathname } = useLocation();
  const ready = useRef(false);
  const id = import.meta.env.VITE_GA_ID;
  useEffect(() => {
    if (!id || privateRoute.test(pathname)) return;
    try {
      if (!ready.current) {
        ReactGA.initialize(id, {
          gaOptions: { send_page_view: false },
          gtagOptions: { send_page_view: false },
        });
        ready.current = true;
      }
      ReactGA.send({
        hitType: "pageview",
        page: pathname,
        page_location: `${window.location.origin}${pathname}`,
      });
    } catch {
      /* Analytics failure must not interrupt campus. */
    }
  }, [id, pathname]);
  return null;
}
