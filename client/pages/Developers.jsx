import {
  Github,
  Linkedin,
  Mail,
  Code,
  Palette,
  Database,
  Globe,
  Shield,
} from "lucide-react";

const Developers = () => {
  const developers = [
    {
      id: 1,
      name: "Arjun Sharma",
      role: "Frontend Developer",
      image: "/placeholder.svg",
      bio: "Passionate about creating beautiful and intuitive user interfaces. Specializes in React, TypeScript, and modern CSS frameworks.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      github: "https://github.com/arjunsharma",
      linkedin: "https://linkedin.com/in/arjunsharma",
      email: "arjun@venuekart.com",
      icon: Code,
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "UI/UX Designer",
      image: "/placeholder.svg",
      bio: "Creative designer with a keen eye for user experience. Transforms complex ideas into simple, elegant, and user-friendly designs.",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      github: "https://github.com/priyapatel",
      linkedin: "https://linkedin.com/in/priyapatel",
      email: "priya@venuekart.com",
      icon: Palette,
    },
    {
      id: 3,
      name: "Rohit Kumar",
      role: "Backend Developer",
      image: "/placeholder.svg",
      bio: "Expert in building scalable backend systems and APIs. Focuses on performance optimization and secure data management.",
      skills: ["Node.js", "Python", "MongoDB", "PostgreSQL"],
      github: "https://github.com/rohitkumar",
      linkedin: "https://linkedin.com/in/rohitkumar",
      email: "rohit@venuekart.com",
      icon: Database,
    },
    {
      id: 4,
      name: "Sneha Gupta",
      role: "Full Stack Developer",
      image: "/placeholder.svg",
      bio: "Versatile developer comfortable with both frontend and backend technologies. Loves solving complex problems with elegant solutions.",
      skills: ["React", "Node.js", "Express", "MongoDB"],
      github: "https://github.com/snehagupta",
      linkedin: "https://linkedin.com/in/snehagupta",
      email: "sneha@venuekart.com",
      icon: Globe,
    },
    {
      id: 5,
      name: "Vikash Singh",
      role: "DevOps Engineer",
      image: "/placeholder.svg",
      bio: "Ensures smooth deployment and monitoring of applications. Specializes in cloud infrastructure and automated deployment pipelines.",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      github: "https://github.com/vikashsingh",
      linkedin: "https://linkedin.com/in/vikashsingh",
      email: "vikash@venuekart.com",
      icon: Shield,
    },
  ];

  const teamStats = [
    { number: "5", label: "Team Members" },
    { number: "3+", label: "Years Experience" },
    { number: "24/7", label: "Dedicated Support" },
    { number: "100%", label: "Passion Driven" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-venue-blue to-venue-teal py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Meet Our Team</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            The passionate developers and designers who bring VenueKart to life
          </p>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-venue-blue mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-navy mb-4">
              Our Development Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the talented individuals who work tirelessly to create the
              best venue booking experience for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developers.map((developer) => (
              <div
                key={developer.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={developer.image}
                    alt={developer.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 w-12 h-12 bg-venue-teal/90 rounded-full flex items-center justify-center">
                    <developer.icon className="w-6 h-6 text-venue-navy" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-venue-navy mb-1">
                    {developer.name}
                  </h3>
                  <p className="text-venue-blue font-medium mb-3">
                    {developer.role}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {developer.bio}
                  </p>

                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-venue-navy mb-2">
                      Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {developer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-venue-green/20 text-venue-navy px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <a
                      href={developer.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-venue-teal/20 rounded-full transition-colors duration-200"
                    >
                      <Github size={18} className="text-venue-navy" />
                    </a>
                    <a
                      href={developer.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 hover:bg-venue-blue/20 rounded-full transition-colors duration-200"
                    >
                      <Linkedin size={18} className="text-venue-navy" />
                    </a>
                    <a
                      href={`mailto:${developer.email}`}
                      className="p-2 bg-gray-100 hover:bg-venue-green/20 rounded-full transition-colors duration-200"
                    >
                      <Mail size={18} className="text-venue-navy" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Culture Section */}
      <section className="py-16 bg-venue-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-venue-green mb-6">
                Our Development Philosophy
              </h2>
              <div className="space-y-4 text-lg text-venue-teal">
                <p>
                  We believe in writing clean, maintainable code that stands the
                  test of time. Our team follows modern development practices
                  and stays updated with the latest technologies.
                </p>
                <p>
                  Collaboration is at the heart of everything we do. We work
                  together, learn from each other, and support one another in
                  building amazing user experiences.
                </p>
                <p>
                  User-centric design drives our development decisions. Every
                  feature we build is carefully considered from the user's
                  perspective.
                </p>
              </div>
            </div>
            <div>
              <img
                src="/placeholder.svg"
                alt="Team collaboration"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-venue-navy mb-8">
            Technologies We Use
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              "React",
              "TypeScript",
              "Node.js",
              "MongoDB",
              "AWS",
              "Docker",
              "Tailwind CSS",
              "Next.js",
              "Express",
              "PostgreSQL",
              "Figma",
              "Git",
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <p className="font-medium text-venue-navy">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team CTA */}
      <section className="py-16 bg-gradient-to-r from-venue-teal to-venue-green">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-venue-navy mb-4">
            Want to Join Our Team?
          </h2>
          <p className="text-lg text-venue-navy mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion
            for creating exceptional user experiences.
          </p>
          <a
            href="/contact"
            className="bg-venue-navy hover:bg-venue-blue text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default Developers;
