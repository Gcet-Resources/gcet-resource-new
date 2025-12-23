import { Navigation } from "@/components/Navigation";
import { ArrowRight, Youtube, Code, Gamepad } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
              A student lead community
            </span>
          </div>
          <h1 className="mt-8 text-4xl md:text-6xl font-display font-bold text-gray-900 animate-fade-up">
            Empowering B.Tech Students
            <br />
            <span className="text-primary">With Quality Resources</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Access a comprehensive collection of educational content, coding resources, and interactive features to enhance your learning journey.
          </p>
          <div className="mt-10 flex justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => navigate("/year-selection")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Explore Resources
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Youtube,
                title: "YouTube Resources",
                description: "Access curated academic and non-academic video content",
                link: "/youtube-resources"
              },
              {
                icon: Code,
                title: "Coding Resources",
                description: "Learn DSA and explore student projects",
                link: "/coding-resources"
              },
              {
                icon: Gamepad,
                title: "Cool Products",
                description: "Must have products for every Engineering student",
                link: "/game"
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                onClick={() => navigate(feature.link)}
                className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all duration-300 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
