
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import YearSelection from "./pages/YearSelection";
import ResourceSelection from "./pages/ResourceSelection";
import SubjectResources from "./pages/SubjectResources";
import ResourceDetails from "./pages/ResourceDetails";
import NotFound from "./pages/NotFound";
import YouTubeResources from "./pages/youtube/YouTubeResources";
import AcademicVideos from "./pages/youtube/AcademicVideos";
import NonAcademicVideos from "./pages/youtube/NonAcademicVideos";
import CodingResources from "./pages/coding/CodingResources";
import DSA from "./pages/coding/DSA";
import Projects from "./pages/coding/Projects";
import Game from "./pages/Game";
import NoticeBoard from "./pages/NoticeBoard";
import Store from "./pages/Store";
import BuyerPage from "./pages/BuyerPage";
import SellerPage from "./pages/SellerPage";
import BuyerLoginPage from "./pages/BuyerLoginPage";
import BuyerSignupPage from "./pages/BuyerSignupPage";
import SellerLoginPage from "./pages/SellerLoginPage";
import SellerSignupPage from "./pages/SellerSignupPage";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

import useAckee from "use-ackee";
import { useLocation } from "react-router-dom";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import GoogleAnalytics from "./components/GoogleAnalytics";

const AckeeTracker = () => {
  const location = useLocation();

  useAckee(
    location.pathname,
    {
      server: import.meta.env.VITE_ACKEE_SERVER_URL || "",
      domainId: import.meta.env.VITE_ACKEE_DOMAIN_ID || "",
    },
    {
      detailed: true,
      ignoreLocalhost: false,
      ignoreOwnVisits: false,
    }
  );

  return null;
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GoogleAnalytics />
            <AckeeTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/support" element={<Support />} />
              <Route path="/year-selection" element={<YearSelection />} />
              <Route path="/resources/:year" element={<ResourceSelection />} />
              <Route path="/resources/:year/:subjectId" element={<SubjectResources />} />
              <Route path="/resources/:year/:subjectId/:resourceType" element={<ResourceDetails />} />
              <Route path="/youtube-resources" element={<YouTubeResources />} />
              <Route path="/youtube-resources/academic" element={<AcademicVideos />} />
              <Route path="/youtube-resources/non-academic" element={<NonAcademicVideos />} />
              <Route path="/coding-resources" element={<CodingResources />} />
              <Route path="/coding-resources/dsa" element={<DSA />} />
              <Route path="/coding-resources/projects" element={<Projects />} />
              <Route path="/game" element={<Game />} />
              <Route path="/notice-board" element={<NoticeBoard />} />
              <Route path="/store" element={<Store />} />
              <Route path="/buyer" element={<BuyerLoginPage />} />
              <Route path="/buyer-signup" element={<BuyerSignupPage />} />
              <Route path="/seller" element={<SellerLoginPage />} />
              <Route path="/seller-signup" element={<SellerSignupPage />} />
              <Route element={<ProtectedRoute role="buyer" />}>
                <Route path="/buyer-dashboard" element={<BuyerPage />} />
              </Route>
              <Route element={<ProtectedRoute role="seller" />}>
                <Route path="/seller-dashboard" element={<SellerPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PWAInstallPrompt />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
