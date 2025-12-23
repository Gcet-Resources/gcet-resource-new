
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Code, ExternalLink } from "lucide-react";

const DSA = () => {
  const resources = [
    {
      title: "Striver Sheet",
      description: "A-Z DSA Sheet",
      difficulty: "Medium",
      link: "https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z"
    },
    {
      title: "DSA in C++",
      description: "Complete DSA YouTube playlist for C++ programmers",
      difficulty: "Medium",
      link: "https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA"
    },
    // Add more sample resources
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          DSA Resources
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-4">
                  <Code className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                <p className="text-gray-600 flex-grow mb-4">{resource.description}</p>
                <a
                  href={resource.link}
                  className="inline-flex items-center text-primary hover:text-primary/80"
                >
                  Learn More <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DSA;
