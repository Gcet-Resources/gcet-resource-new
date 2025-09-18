
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Play } from "lucide-react";

const YouTubeResources = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          YouTube Resources
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate("/youtube-resources/academic")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <GraduationCap className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-semibold">Academic Resources</h2>
              <p className="text-gray-600">
                Access course-related video content, lectures, and educational tutorials
              </p>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate("/youtube-resources/non-academic")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Play className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-semibold">Non-Academic Resources</h2>
              <p className="text-gray-600">
                Explore skill development, hobby-related, and entertainment content
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default YouTubeResources;
