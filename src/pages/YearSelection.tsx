
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { BarChart, DraftingCompass, Mail, MessageSquare } from "lucide-react";

const YearSelection = () => {
  const navigate = useNavigate();
  const years = [
    {
      year: "1st Year",
      icon: BarChart,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-500/10",
      borderColor: "border-yellow-200 dark:border-yellow-500/30",
      description: "Foundation courses and basic engineering concepts"
    },
    {
      year: "2nd Year",
      icon: DraftingCompass,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-200 dark:border-blue-500/30",
      description: "Core engineering subjects and practical applications"
    },
    {
      year: "3rd Year",
      icon: Mail,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-200 dark:border-purple-500/30",
      description: "Advanced concepts and specialization subjects"
    },
    {
      year: "4th Year",
      icon: MessageSquare,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-500/10",
      borderColor: "border-pink-200 dark:border-pink-500/30",
      description: "Coming soon.."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white text-center mb-6">
          Choose Your Year
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Select your academic year to access relevant study materials, notes, and resources
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {years.map((item, index) => (
            <button
              key={item.year}
              onClick={() => navigate(`/resources/${item.year.split(" ")[0].toLowerCase()}`)}
              className={`p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-all duration-300 border ${item.borderColor} group animate-fade-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 rounded-xl ${item.bgColor} ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
                {item.year}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearSelection;
