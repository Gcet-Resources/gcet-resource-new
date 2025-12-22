
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Youtube } from "lucide-react";

const AcademicVideos = () => {
  const videos = [
    {
      title: "Engineering Mathematics 1 Playlist",
      description: "Best resource for M1",
      thumbnail: "https://i.ytimg.com/vi/TStqBRLePoM/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAB71K-dSL3UxaJFMeKYGtGFdiKOg",
      link: "https://www.youtube.com/playlist?list=PL5Dqs90qDljVTfWmYSWjD99kcqdkI5zMM"
    },
    {
      title: "Advanced Mathematics",
      description: "Complex mathematical concepts explained simply",
      thumbnail: "https://i.ytimg.com/vi/sample2/maxresdefault.jpg",
      link: "https://youtube.com/watch?v=sample2"
    },
    // Add more sample videos here
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          Academic Video Resources
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <a
              key={index}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video relative bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Youtube className="w-12 h-12 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {video.description}
                  </p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicVideos;
