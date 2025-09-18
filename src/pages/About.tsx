
import { Navigation } from "@/components/Navigation";
import { Github, Instagram, Linkedin } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Gulshan Yadav",
      role: "Developer",
      image: "gulshan.jpg",
      social: {
        github: "https://github.com/gulshan214",
        instagram: "https://www.instagram.com/gulshan_214",
        linkedin: "https://www.linkedin.com/in/gulshan-yadav04/"
      }
    },
    {
      name: "Anshul Kushwaha",
      role: "Developer",
      image: "anshul.jpg",
      social: {
        github: "https://github.com/sudo-anshul",
        instagram: "https://www.instagram.com/sudo_anshul/",
        linkedin: "https://www.linkedin.com/in/anshul-kushwaha"
      }
    },
    {
      name: "Harshita",
      role: "Technical support",
      image: "harshita.jpg",
      social: {
        github: "https://gcetresources.me/about-us#",
        instagram: "https://www.instagram.com/hyhh.harshita.124?utm_source=qr&igsh=MTR4OHFmZzhkMzlr",
        linkedin: "https://www.linkedin.com/in/harshita-pandey-4b322a274?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Himanshu Srivastava",
      role: "Resource Management",
      image: "himanshu.jpg",
      social: {
        github: "https://github.com/travor21",
        instagram: "#",
        linkedin: "https://www.linkedin.com/in/himanshu-srivastava-276929280?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Aditya Kumar Gupta",
      role: "Resource Management",
      image: "aditya.jpg",
      social: {
        github: "#",
        instagram: "#",
        linkedin: "#"
      }
    },
    {
      name: "Vinayak Sonthalia",
      role: "Resource Management",
      image: "vinayak.jpg",
      social: {
        github: "#",
        instagram: "https://www.instagram.com/vinayak.sonthalia/",
        linkedin: "https://in.linkedin.com/in/vinayak-sonthalia-b472411b7"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Meet the team
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're a dedicated team working to provide quality educational resources for GCET students
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div
              key={member.name}
              className="group p-6 text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mb-6 inline-block">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-gray-600 mb-4">{member.role}</p>
              <div className="flex justify-center space-x-4">
                <a href={member.social.github} className="text-gray-600 hover:text-primary transition-colors">
                  <Github size={20} />
                </a>
                <a href={member.social.instagram} className="text-gray-600 hover:text-primary transition-colors">
                  <Instagram size={20} />
                </a>
                <a href={member.social.linkedin} className="text-gray-600 hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
