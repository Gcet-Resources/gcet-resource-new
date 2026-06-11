import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const GoogleAnalytics = () => {
  const location = useLocation();
  const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

  useEffect(() => {
    if (!GA_ID) return;
    try {
      ReactGA.initialize(GA_ID);
    } catch (e) {
      // ignore init errors
    }
  }, [GA_ID]);

  useEffect(() => {
    if (!GA_ID) return;
    try {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname + location.search,
      });
    } catch (e) {
      // ignore send errors
    }
  }, [location, GA_ID]);

  return null;
};

export default GoogleAnalytics;
