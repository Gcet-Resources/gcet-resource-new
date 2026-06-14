import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Seo } from "@/components/Seo";
import { Video } from "lucide-react";

const AcademicVideos = () => {
  const videos = [
    {
      title: "Engineering Mathematics 1 Playlist",
      description: "Best resource for M1",
      thumbnail: "https://i.ytimg.com/vi/TStqBRLePoM/hqdefault.jpg",
      link: "https://www.youtube.com/playlist?list=PL5Dqs90qDljVTfWmYSWjD99kcqdkI5zMM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Seo
        title="Academic YouTube Resources"
        description="Curated YouTube playlists for AKTU B.Tech subjects — engineering maths, CS, and more."
        path="/youtube-resources/academic"
      />
      <Navigation />
      <main id="main-content" className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12 text-gray-900 dark:text-white">
          Academic Video Resources
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <a
              key={video.link}
              href={video.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="aspect-video relative bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <Video className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary dark:group-hover:text-teal-400 transition-colors text-gray-900 dark:text-white">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {video.description}
                  </p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AcademicVideos;
