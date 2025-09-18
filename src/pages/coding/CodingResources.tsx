
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Code, FolderGit2 } from "lucide-react";

const CodingResources = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          Coding Resources
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate("/coding-resources/dsa")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Code className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-semibold">DSA Materials</h2>
              <p className="text-gray-600">
                Learn Data Structures and Algorithms with our curated resources
              </p>
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate("/coding-resources/projects")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <FolderGit2 className="w-16 h-16 text-primary" />
              <h2 className="text-2xl font-semibold">Projects</h2>
              <p className="text-gray-600">
                Explore student projects and get inspired
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodingResources;
