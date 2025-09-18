
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
