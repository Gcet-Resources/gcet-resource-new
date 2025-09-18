
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { FolderGit2, ExternalLink, Github } from "lucide-react";

const Projects = () => {
  const projects = [
    {
      title: "Student Portfolio",
      description: "A responsive portfolio website built with React and Tailwind CSS",
      tech: ["React", "Tailwind", "TypeScript"],
      github: "https://github.com/sample/project1"
    },
    {
      title: "Task Manager",
      description: "A full-stack task management application with authentication",
      tech: ["Next.js", "MongoDB", "Express"],
      github: "https://github.com/sample/project2"
    },
    // Add more sample projects
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          Student Projects
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-4">
                  <FolderGit2 className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                </div>
                <p className="text-gray-600 mb-4 flex-grow">
                  {project.description}
                </p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary/80"
                  >
                    <Github className="mr-2 w-4 h-4" />
                    View on GitHub
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
