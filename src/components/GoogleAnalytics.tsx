
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const GoogleAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize Google Analytics with your Measurement ID
        // REPLACE 'G-XXXXXXXXXX' with your actual Measurement ID
        ReactGA.initialize("G-VSD0SZVJPL");
    }, []);

    useEffect(() => {
        // Send pageview with a custom path
        ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }, [location]);

    return null;
};

export default GoogleAnalytics;
