
import { Navigation } from "@/components/Navigation";
import { Github, Instagram, Linkedin, User } from "lucide-react";

const About = () => {
  const leads = [
    {
      name: "Gulshan Yadav",
      role: "Product Lead",
      image: "https://lh3.googleusercontent.com/d/18o6QHd3vhljGdEZ7AsXKRyP36VIZjVW1",
      social: {
        github: "https://github.com/gulshan214",
        instagram: "https://www.instagram.com/gulshan_214",
        linkedin: "https://www.linkedin.com/in/gulshan-yadav04/"
      }
    },
    {
      name: "Anshul Kushwaha",
      role: "Engineering Lead",
      image: "https://lh3.googleusercontent.com/d/1MsETTS1HStn9Ae5K9aWveS9NFxRDbrm0",
      social: {
        github: "https://github.com/sudo-anshul",
        instagram: "https://www.instagram.com/sudo_anshul/",
        linkedin: "https://www.linkedin.com/in/anshul-kushwaha"
      }
    },
    {
      name: "Harshita",
      role: "Design Lead",
      image: "https://lh3.googleusercontent.com/d/1RRXazoVId5U-q4HqKS6zKVoFrgWnZL2h",
      social: {
        github: "https://gcetresources.me/about-us#",
        instagram: "https://www.instagram.com/hyhh.harshita.124?utm_source=qr&igsh=MTR4OHFmZzhkMzlr",
        linkedin: "https://www.linkedin.com/in/harshita-pandey-4b322a274?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Himanshu Srivastava",
      role: "Content Lead",
      image: "https://lh3.googleusercontent.com/d/1CEN2QeUPSBuhwJFdYbnoXAcq39E9JDO6",
      social: {
        github: "https://github.com/travor21",
        instagram: "#",
        linkedin: "https://www.linkedin.com/in/himanshu-srivastava-276929280?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
      }
    },
    {
      name: "Aditya Kumar Gupta",
      role: "Operations Lead",
      image: "https://lh3.googleusercontent.com/d/11HOBGN3vyEmiYHXJRKLX65Kkq_LA3a-E",
      social: {
        github: "#",
        instagram: "#",
        linkedin: "#"
      }
    },
    {
      name: "Vinayak Sonthalia",
      role: "Community Lead",
      image: "https://lh3.googleusercontent.com/d/1FOUds4jlGc_d9_Px8xzDcWWelUkH9hB0",
      social: {
        github: "#",
        instagram: "https://www.instagram.com/vinayak.sonthalia/",
        linkedin: "https://in.linkedin.com/in/vinayak-sonthalia-b472411b7"
      }
    }
  ];

  const juniors = [
    {
      name: "Junior Developer",
      role: "Assistant Developer",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    },
    {
      name: "Junior Developer",
      role: "Assistant Developer",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    },
    {
      name: "Junior Designer",
      role: "Assistant Designer",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    },
    {
      name: "Junior Content",
      role: "Assistant Resource Manager",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    },
    {
      name: "Junior Operations",
      role: "Assistant Resource Manager",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    },
    {
      name: "Junior Community",
      role: "Assistant Resource Manager",
      image: null,
      social: { github: "#", instagram: "#", linkedin: "#" }
    }
  ];

  const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-teal-400 hover:bg-primary/10 dark:hover:bg-teal-500/20 transition-all duration-300 transform hover:scale-110"
    >
      <Icon size={18} />
    </a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgb(17,24,39),rgba(17,24,39,0.6))] -z-10" />
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 dark:bg-teal-500/20 text-primary dark:text-teal-400 text-sm font-medium mb-4 animate-fade-down">
            Our Team
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight animate-fade-up">
            Passing the <span className="text-primary dark:text-teal-400">Legacy</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            We're a dedicated team of seniors and upcoming juniors working together to build and maintain quality educational resources for GCET students.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-32 space-y-32">
        {/* Legacy Leaders Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4 inline-flex items-center gap-3">
              <span className="w-8 h-1 bg-primary dark:bg-teal-400 rounded-full"></span>
              The Leads
              <span className="w-8 h-1 bg-primary dark:bg-teal-400 rounded-full"></span>
            </h2>
            <p className="text-slate-500 dark:text-gray-400">The founding team passing on the torch</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {leads.map((member, index) => (
              <div
                key={member.name}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-500 border border-slate-100 dark:border-gray-700 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 dark:via-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative mb-8 text-center">
                  <div className="w-40 h-40 mx-auto rounded-full p-1 bg-gradient-to-br from-slate-100 to-white dark:from-gray-700 dark:to-gray-800 shadow-inner">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-teal-400 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 font-medium mb-6">{member.role}</p>

                  <div className="flex justify-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    <SocialLink href={member.social.github} icon={Github} />
                    <SocialLink href={member.social.instagram} icon={Instagram} />
                    <SocialLink href={member.social.linkedin} icon={Linkedin} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Future Torchbearers Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-gray-800/30 -skew-y-3 -z-10 transform scale-110" />

          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              The Next Generation
            </h2>
            <p className="text-slate-500 dark:text-gray-400">Upcoming leaders carrying the vision forward</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {juniors.map((member, index) => (
              <div
                key={index}
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200/60 dark:border-gray-700 hover:border-primary/30 dark:hover:border-teal-500/30 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${0.2 + (index * 0.1)}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-teal-400 group-hover:bg-primary/10 dark:group-hover:bg-teal-500/20 transition-colors duration-300">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-teal-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-700 flex justify-end space-x-2">
                  <div className="text-xs text-slate-400 dark:text-gray-500 italic">Incoming</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
