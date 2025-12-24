import { Navigation } from "@/components/Navigation";
import { ArrowRight, Youtube, Code, Gamepad } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecentlyViewed from "@/components/RecentlyViewed";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 text-sm font-medium bg-primary/10 dark:bg-teal-500/20 text-primary dark:text-teal-400 rounded-full">
              A student lead community
            </span>
          </div>
          <h1 className="mt-8 text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-white animate-fade-up">
            Empowering B.Tech Students
            <br />
            <span className="text-primary dark:text-teal-400">With Quality Resources</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Access a comprehensive collection of educational content, coding resources, and interactive features to enhance your learning journey.
          </p>
          <div className="mt-10 flex justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => navigate("/year-selection")}
              className="px-6 py-3 bg-primary dark:bg-teal-600 text-white rounded-lg hover:bg-primary/90 dark:hover:bg-teal-500 transition-colors inline-flex items-center gap-2"
            >
              Explore Academic Resources
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Youtube,
                title: "YouTube Resources",
                description: "Access curated academic and non-academic video content",
                link: "/youtube-resources"
              },
              {
                icon: Gamepad,
                title: "Student Essentials",
                description: "Must have products for every Engineering student",
                link: "/game"
              },
              {
                icon: Code,
                title: "Coding Resources",
                description: "Learn DSA and explore student projects",
                link: "/coding-resources"
              }
             
            ].map((feature, index) => (
              <div
                key={feature.title}
                onClick={() => navigate(feature.link)}
                className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <feature.icon className="w-10 h-10 text-primary dark:text-teal-400 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="py-8 px-4 flex-grow">
        <div className="container mx-auto max-w-md">
          <RecentlyViewed />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
