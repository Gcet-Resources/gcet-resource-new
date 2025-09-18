
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { BookText, FileText, PenTool, Book, HelpCircle, Grid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SubjectResources = () => {
  const { year, subjectId } = useParams();
  const navigate = useNavigate();

  // Get subject name from subjectId
  const getSubjectName = (id: string | undefined) => {
    if (!id) return "Unknown Subject";
    
    const subjectMap: Record<string, string> = {
      // 1st year subjects
      "1st-math": "Engineering Mathematics",
      "1st-physics": "Engineering Physics",
      "1st-chemistry": "Engineering Chemistry",
      "1st-programming": "Computer Programming",
      "1st-electrical": "Basic Electrical Engineering",
      "1st-mechanics": "Engineering Mechanics",
      "1st-graphics": "Engineering Graphics",
      "1st-communication": "Communication Skills",
      "1st-environment": "Environmental Studies",
      "1st-workshop": "Workshop Practice",
      
      // 2nd year subjects
      "2nd-dsa": "Data Structures & Algorithms",
      "2nd-oops": "Object-Oriented Programming",
      "2nd-dbms": "Database Management Systems",
      "2nd-os": "Operating Systems",
      "2nd-coa": "Computer Organization & Architecture",
      "2nd-discrete": "Discrete Mathematics",
      "2nd-digital": "Digital Electronics",
      "2nd-signal": "Signals & Systems",
      "2nd-prob": "Probability & Statistics",
      "2nd-automata": "Automata Theory",
      
      // 3rd year subjects
      "3rd-web": "Web Technologies",
      "3rd-ai": "Artificial Intelligence",
      "3rd-networks": "Computer Networks",
      "3rd-se": "Software Engineering",
      "3rd-theory": "Theory of Computation",
      "3rd-compiler": "Compiler Design",
      "3rd-embedded": "Embedded Systems",
      "3rd-datamining": "Data Mining",
      "3rd-distributed": "Distributed Systems",
      "3rd-mobile": "Mobile Computing",
      
      // 4th year subjects
      "4th-ml": "Machine Learning",
      "4th-cloud": "Cloud Computing",
      "4th-security": "Information Security",
      "4th-bigdata": "Big Data Analytics",
      "4th-mobile": "Mobile App Development",
      "4th-iot": "Internet of Things",
      "4th-blockchain": "Blockchain Technology",
      "4th-devops": "DevOps Practices",
      "4th-nlp": "Natural Language Processing",
      "4th-ar": "AR/VR Technologies"
    };
    
    return subjectMap[id] || "Unknown Subject";
  };
  
  const resources = [
    {
      id: "pdf-notes",
      title: "PDF NOTES",
      icon: BookText,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      gradient: "from-blue-50 to-blue-100"
    },
    {
      id: "aktu-pyq",
      title: "AKTU PYQ",
      icon: FileText,
      color: "bg-orange-100", 
      textColor: "text-orange-600",
      gradient: "from-orange-50 to-orange-100"
    },
    {
      id: "cae",
      title: "CAE",
      icon: Grid,
      color: "bg-purple-100",
      textColor: "text-purple-600",
      gradient: "from-purple-50 to-purple-100"
    },
    {
      id: "handwritten",
      title: "Handwritten Notes",
      icon: PenTool,
      color: "bg-rose-100",
      textColor: "text-rose-600",
      gradient: "from-rose-50 to-rose-100"
    },
    {
      id: "quantum",
      title: "Quantum Notes",
      icon: Book,
      color: "bg-green-100",
      textColor: "text-green-600",
      gradient: "from-green-50 to-green-100"
    },
    {
      id: "question-bank",
      title: "Question Bank",
      icon: HelpCircle,
      color: "bg-teal-100",
      textColor: "text-teal-600",
      gradient: "from-teal-50 to-teal-100"
    }
  ];

  const handleResourceClick = (resourceId: string) => {
    navigate(`/resources/${year}/${subjectId}/${resourceId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-4">
          {getSubjectName(subjectId)}
        </h1>
        <p className="text-center text-gray-600 mb-12">
          {year?.toUpperCase()} Year - Select a resource type
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {resources.map((resource, index) => (
            <Card 
              key={resource.id}
              className="overflow-hidden rounded-lg border-0 shadow-md hover:shadow-xl transition-all duration-300 group animate-fade-up cursor-pointer bg-gradient-to-br hover:scale-105"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` 
              }}
              onClick={() => handleResourceClick(resource.id)}
            >
              <CardContent className={`p-0 h-full ${resource.gradient}`}>
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className={`w-16 h-16 rounded-full ${resource.color} ${resource.textColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                    <resource.icon size={28} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <div className="mt-auto">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${resource.textColor} bg-white bg-opacity-60 mt-4`}>
                      Explore
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectResources;
