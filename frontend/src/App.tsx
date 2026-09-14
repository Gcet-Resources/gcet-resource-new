import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { CatalogProvider } from "@/context/CatalogProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipToContent } from "@/components/SkipToContent";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import GoogleAnalytics from "@/components/GoogleAnalytics";
const CampusHome = lazy(() => import("./pages/CampusHome"));
const CampusDashboard = lazy(() => import("./pages/CampusDashboard"));
const CampusNotices = lazy(() => import("./pages/CampusNotices"));
const Clubs = lazy(() => import("./pages/Clubs"));
const AdminConsole = lazy(() => import("./pages/AdminConsole"));
const Publisher = lazy(() => import("./pages/Publisher"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Support = lazy(() => import("./pages/Support"));
const YearSelection = lazy(() => import("./pages/YearSelection"));
const ResourceSelection = lazy(() => import("./pages/ResourceSelection"));
const SubjectResources = lazy(() => import("./pages/SubjectResources"));
const ResourceDetails = lazy(() => import("./pages/ResourceDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const YouTubeResources = lazy(() => import("./pages/youtube/YouTubeResources"));
const AcademicVideos = lazy(() => import("./pages/youtube/AcademicVideos"));
const NonAcademicVideos = lazy(
  () => import("./pages/youtube/NonAcademicVideos"),
);
const CodingResources = lazy(() => import("./pages/coding/CodingResources"));
const DSA = lazy(() => import("./pages/coding/DSA"));
const Projects = lazy(() => import("./pages/coding/Projects"));
const Game = lazy(() => import("./pages/Game"));
function RouteReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <CatalogProvider>
              <BrowserRouter>
                <SkipToContent />
                <RouteReset />
                <GoogleAnalytics />
                <Toaster />
                <Sonner />
                <Suspense
                  fallback={
                    <main
                      id="main-content"
                      className="flex min-h-screen items-center justify-center"
                    >
                      <p role="status">Loading campus…</p>
                    </main>
                  }
                >
                  <Routes>
                    <Route path="/" element={<CampusHome />} />
                    <Route path="/dashboard" element={<CampusDashboard />} />
                    <Route path="/notices" element={<CampusNotices />} />
                    <Route
                      path="/notice-board"
                      element={<Navigate to="/notices" replace />}
                    />
                    <Route path="/clubs" element={<Clubs />} />
                    <Route path="/admin" element={<AdminConsole />} />
                    <Route
                      path="/admin/approvals"
                      element={<Navigate to="/admin" replace />}
                    />
                    <Route path="/publish" element={<Publisher />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<Login />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/year-selection" element={<YearSelection />} />
                    <Route
                      path="/resources/:year"
                      element={<ResourceSelection />}
                    />
                    <Route
                      path="/resources/:year/:subjectId"
                      element={<SubjectResources />}
                    />
                    <Route
                      path="/resources/:year/:subjectId/:resourceType"
                      element={<ResourceDetails />}
                    />
                    <Route
                      path="/youtube-resources"
                      element={<YouTubeResources />}
                    />
                    <Route
                      path="/youtube-resources/academic"
                      element={<AcademicVideos />}
                    />
                    <Route
                      path="/youtube-resources/non-academic"
                      element={<NonAcademicVideos />}
                    />
                    <Route
                      path="/coding-resources"
                      element={<CodingResources />}
                    />
                    <Route path="/coding-resources/dsa" element={<DSA />} />
                    <Route
                      path="/coding-resources/projects"
                      element={<Projects />}
                    />
                    <Route path="/essentials" element={<Game />} />
                    <Route
                      path="/game"
                      element={<Navigate to="/essentials" replace />}
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <PWAInstallPrompt />
              </BrowserRouter>
            </CatalogProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
