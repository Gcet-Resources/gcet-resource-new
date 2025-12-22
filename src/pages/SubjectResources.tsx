
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
      // 1st Year (1st & 2nd Sem)
      "BAS101": "Engineering Physics",
      "BAS102": "Engineering Chemistry",
      "BAS103": "Engineering Mathematics I",
      "BAS104": "Environment and Ecology",
      "BAS105": "Soft Skills",
      "BCS101": "Programming for Problem Solving",
      "BEC101": "Fundamentals of Electronics Engineering",
      "BEE101": "Fundamentals of Electrical Engineering",
      "BME101": "Fundamentals of Mechanical Engineering",
     

      // 2nd Year (3rd & 4th Sem)
      "BAS301": "Technical Communication",
      "BAS303": "Mathematics IV",
      "BCC301": "Cyber Security",
      "BCC302": "Python Programming",
      "BCS301": "Data Structure",
      "BCS302": "Computer Organization and Architecture",
      "BCS303": "Discrete Structures Theory of Logic",
      "BOE301": "Electric and Hybrid Vehicles",
      "BOE302": "Automation and Robotics",
      "BOE303": "Material Science",
      "BOE304": "Energy Science Engineering",
      "BOE305": "Sensor Instrumentation",
      "BOE306": "Basics Data Structure Algorithms",
      "BOE307": "Basics of Database Management Systems",
      "BOE310": "Digital Electronics",
      "BOE312H": "Laser System and Applications",
      "BOE313": "Food Science and Nutrition",
      "BOE314": "Building Science and Engineering",
      "BVE301": "Universal Human Values and Professional Ethics",
      "BAS401": "Technical Communication",
      "BAS403": "Mathematics IV",
      "BCC401": "Cyber Security",
      "BCC402": "Python Programming",
      "BCE401": "Materials Testing Construction Practices",
      "BCE402": "Introduction to Solid Mechanics",
      "BCE403": "Hydraulic Engineering and Machines",
      "BCS401": "Operating System",
      "BCS402": "Theory of Automata and Formal Languages",
      "BCS403": "Object Oriented Programming with Java",
      "BEC401": "Communication Engineering",
      "BEC402": "Analog Circuits",
      "BEC403": "Signal System",
      "BEE401": "Digital Electronics",
      "BEE402": "Electrical Machines I",
      "BEE403": "Networks Analysis Synthesis",
      "BME401": "Applied Thermodynamics",
      "BME402": "Engineering Mechanics Strength Material",
      "BME403": "Manufacturing Processes",
      "BOE401": "Electric and Hybrid Vehicles",
      "BOE402": "Automation and Robotics",
      "BOE403": "Material Science",
      "BOE404": "Energy Science Engineering",
      "BOE405": "Sensor Instrumentation",
      "BOE406": "Basics Data Structure Algorithms",
      "BOE407": "Basics of Database Management Systems",
      "BOE408": "Analog Electronics Circuits",
      "BOE409": "Electronics Engineering",
      "BOE410": "Digital Electronics",
      "BOE411": "Polymer Science and Technology",
      "BOE412": "Laser System and Applications",
      "BOE413": "Food Science and Nutrition",
      "BOE414": "Building Science and Engineering",
      "BVE401": "Universal Human Values Professional Ethics",

      // 3rd Year (5th & 6th Sem)
      "BCAI051": "Mathematical Foundation AI ML and Data Science",
      "BCAI052": "Natural Language Processing",
      "BCAI501": "Artificial Intelligence",
      "BCAM051": "Cloud Computing",
      "BCDS051": "Business Intelligence and Analytics",
      "BCDS501": "Introduction to Data Analytics and Visualization",
      "BCE051": "Concrete Technology",
      "BCE052": "Modern Construction Materials",
      "BCE054": "Engineering Geology",
      "BCE501": "Geotechnical Engineering",
      "BCE502": "Structural Analysis",
      "BCE503": "Quantity Estimation and Construction Management",
      "BCIT052": "IoT Architecture and Protocols",
      "BCIT053": "Computer Vision",
      "BCIT054": "Artificial Intelligence",
      "BCIT055": "Programming and Interfacing with Microcontrollers",
      "BCIT056": "Privacy and Security in IoT",
      "BCS052": "Data Analytics",
      "BCS054": "Object Oriented System Design with C",
      "BCS055": "Machine Learning Techniques",
      "BCS056": "Application of Soft Computing",
      "BCS057": "Image Processing",
      "BCS501": "Database Management System",
      "BCS502": "Web Technology",
      "BCS503": "Design and Analysis of Algorithm",
      "BEC051": "IoT Architecture Communication Technology Its Applications",
      "BEC052": "Bio Medical Sensors Instrumentation",
      "BEC053": "Intelligent Systems and Robotics",
      "BEC054": "VLSI Technology",
      "BEC055": "Electronics Switching",
      "BEC056": "Bio Medical Signal Processing",
      "BEC057": "Optical Communication",
      "BEC058": "CMOS Analog VLSI Design",
      "BEC501": "Integrated Circuits",
      "BEC502": "Microprocessor Microcontroller",
      "BEC503": "Digital Signal Processing",
      "BEE051": "Robotics",
      "BEE052": "Sensors and Transducers",
      "BEE053": "Industrial Automation and Control",
      "BEE056": "Neural Networks Fuzzy System",
      "BEE057": "Digital Signal Processing",
      "BEE058": "Analog Digital Communication",
      "BEE501": "Power System I",
      "BEE502": "Control System",
      "BEE503": "Electrical Machines II",
      "BME051": "Advance Manufacturing Processes",
      "BME052": "I C Engines Fuels Lubrication",
      "BME054": "Mechatronics Systems",
      "BME055": "Turbo Machines",
      "BME056": "Mechanical Vibrations",
      "BME501": "Heat Mass Transfer",
      "BME502": "Machine Design",
      "BME503": "Industrial Engineering",
      "BNC501": "Constitution of India",
      "BNC502": "Essence of Indian Traditional Knowledge",
      "BADS601": "Data Analytics",
      "BAU061": "Automotive Electrical Electronics",
      "BAU602": "Electric Hybrid Vehicles Technology",
      "BCAI061": "Cyber Forensic Analytics",
      "BCAM061": "Social Media Analytics and Data Analysis",
      "BCD061": "Digital Marketing",
      "BCDS061": "Image Analytics",
      "BCDS062": "Machine Learning Techniques",
      "BCDS601": "Big Data and Analytics",
      "BCE061": "Advance Structural Analysis",
      "BCE062": "River Engineering",
      "BCE063": "Repair and Rehabilitation of Structures",
      "BCE601": "Design of Concrete Structures",
      "BCE602": "Transportation Engineering",
      "BCE603": "Environmental Engineering",
      "BCIT061": "Energy Harvesting Technologies and Power Management for IoT Devices",
      "BCIT601": "Data Science in IoT",
      "BCS061": "Big Data",
      "BCS062": "Augmented Virtual Reality",
      "BCS063": "Blockchain Architecture Design",
      "BCS064": "Data Compression",
      "BCS601": "Software Engineering",
      "BCS602": "Compiler Design",
      "BCS603": "Computer Networks",
      "BEC061": "Satellite Communication",
      "BEC062": "Data Communication Networks",
      "BEC063": "CMOS Digital Design Technique",
      "BEC064": "Microwave Engineering",
      "BEC601": "Digital Communication",
      "BEC602": "Control System",
      "BEC603": "Antenna and Wave Propagation",
      "BEE061": "Special Electrical Machines",
      "BEE062": "Electrical Machine Design",
      "BEE063": "Digital Control System",
      "BEE064": "Electrical and Hybrid Vehicles",
      "BEE601": "Power System II",
      "BEE602": "Microprocessor",
      "BEE603": "Power Electronics",
      "BIT601": "Data Analytics",
      "BME061": "Industrial Robotics",
      "BME062": "Computational Fluid Dynamics",
      "BME063": "Tribology",
      "BME601": "Refrigeration and Air Conditioning",
      "BME602": "CAD CAM",
      "BME603": "Theory of Machine",
      "BNC601": "Constitution of India",
      "BNC602": "Essence of Indian Traditional Knowledge",
      "BOE060": "Idea to Business Model",
      "BOE061": "Quality Control Reliability",
      "BOE062": "Embedded System",
      "BOE063": "Introduction to MEMS",
      "BOE064": "Object Oriented Programming",
      "BOE065": "Computer Based Numerical Techniques",
      "BOE066": "GIS Remote Sensing",
      "BOE067": "Basics of Data Base Management System",
      "BOE068": "Software Project Management",
      "BOE069": "Understanding the Human Being Comprehensively",

      // 4th Year (7th & 8th Sem)
      "KCE079": "Disaster Preparedness and Management",
      "KCS071": "Artificial Intelligence",
      "KCS072": "Natural Language Processing",
      "KCS073": "High Performance Computing",
      "KCS074": "Cryptography and Network Security",
      "KCS075": "Design Development of Applications",
      "KCS078": "Deep Learning",
      "KCS079": "Service Oriented Architecture",
      "KCS710": "Quantum Computing",
      "KCS711": "Mobile Computing",
      "KCS712": "Internet of Things",
      "KCS713": "Cloud Computing",
      "KCS714": "Blockchain Architecture Design",
      "KDS071": "Artificial Intelligence",
      "KDS073": "Text Analysis",
      "KDS078": "Deep Learning",
      "KDS079": "Service Oriented Architecture",
      "KEC071": "Digital Image Processing",
      "KEC072": "VLSI Design",
      "KEC073": "Optical Network",
      "KEC074": "Microwave Radar Engineering",
      "KEC075": "Information Theory Coding",
      "KEC076": "Wireless Mobile Communication",
      "KEC077": "Micro Smart Systems",
      "KEC078": "Speech Processing",
      "KEE070": "Advanced Micro Processors Micro Controllers",
      "KEE071": "Energy Conservation and Auditing",
      "KEE072": "HVDC AC Transmission",
      "KEE073": "High Voltage Engineering",
      "KEE074": "Power Quality and Facts",
      "KEE075": "Electric Drives",
      "KEE076": "Power System Dynamics and Control",
      "KEE077": "Power System Protection",
      "KEE078": "Deregulated Power System",
      "KEE079": "Utilization of Electrical Energy Electric Traction",
      "KHU701": "Rural Development Administration Planning",
      "KHU702": "Project Management Entrepreneurship",
      "KIT071": "Software Project Management",
      "KME071": "Additive Manufacturing",
      "KME072": "HVAC Systems",
      "KME073": "Mathematical Modeling of Manufacturing Processes",
      "KME074": "Machine Learning",
      "KME075": "Maintenance Engineering Management",
      "KME076": "Power Plant Engineering",
      "KOE071": "Filter Design",
      "KOE072": "Bioeconomics",
      "KOE073": "Machine Learning",
      "KOE074": "Renewable Energy Resources",
      "KOE075": "Operations Research",
      "KOE076": "Vision for Humane Society",
      "KOE077": "Design Thinking",
      "KOE078": "Soil Water Conservation Engineering",
      "KOE079": "Introduction to Womens Gender Studies",
      "KOT071": "IoT Security",
      "KOT075": "Real Time Operating Systems",
      "KOT076": "Deep Learning",
      "KOT710": "IoT System Architecture",
      "KOT712": "Mobile Application Development for IoT",
      "KHU801": "Rural Development Administration and Planning",
      "KHU802": "Project Management Entrepreneurship",
      "KOE080": "Fundamentals of Drone Technology",
      "KOE081": "Cloud Computing",
      "KOE082": "Bio Medical Signal Processing",
      "KOE083": "Entrepreneurship Development",
      "KOE084": "Introduction to Smart Grid",
      "KOE085": "Quality Management",
      "KOE086": "Industrial Optimization Techniques",
      "KOE087": "Virology",
      "KOE088": "Natural Language Processing",
      "KOE089": "Human Values in Madhyasth Darshan",
      "KOE090": "Electric Vehicles",
      "KOE091": "Automation and Robotics",
      "KOE092": "Computerized Process Control",
      "KOE093": "Data Warehousing Data Mining",
      "KOE094": "Digital and Social Media Marketing",
      "KOE095": "Modeling of Field Effect Nano Devices",
      "KOE096": "Modeling and Simulation of Dynamics Systems",
      "KOE097": "Big Data",
      "KOE098": "Human Values in Buddha and Jain Darshan",
      "KOE099": "Human Values in Vedic Darshan"
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
