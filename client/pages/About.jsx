import { Users, Target, Award, Heart } from "lucide-react";

const About = () => {
  // Removed scroll reveals for stability

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To simplify venue discovery and booking, making every event memorable and stress-free.",
    },
    {
      icon: Users,
      title: "Customer First",
      description:
        "We prioritize our customers' needs and work tirelessly to exceed their expectations.",
    },
    {
      icon: Award,
      title: "Quality Assured",
      description:
        "Every venue on our platform is verified and meets our high standards for quality and service.",
    },
    {
      icon: Heart,
      title: "Passion Driven",
      description:
        "We're passionate about creating unforgettable experiences and bringing people together.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Verified Venues" },
    { number: "50+", label: "Cities Covered" },
    { number: "99%", label: "Customer Satisfaction" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-venue-primary-accent to-venue-secondary-accent py-20 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            About VenueKart
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            We're on a mission to revolutionize how people discover and book
            venues for their special events and celebrations.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-venue-text-primary mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-venue-text-secondary">
                <p>
                  VenueKart was born from a simple idea: finding the perfect
                  venue for your special event shouldn't be complicated,
                  time-consuming, or stressful. We experienced firsthand the
                  challenges of venue hunting and knew there had to be a better
                  way.
                </p>
                <p>
                  Founded in 2024, we started as a small team of event
                  enthusiasts who believed that technology could transform the
                  venue booking experience. Today, we're proud to connect
                  thousands of customers with their dream venues across India.
                </p>
                <p>
                  From intimate birthday parties to grand weddings, from
                  corporate conferences to social gatherings, we've helped
                  create countless memorable moments by matching people with the
                  perfect spaces for their events.
                </p>
              </div>
            </div>
            <div className="lg:order-first">
              <img
                src="/placeholder.svg"
                alt="Team working together"
                className="w-full h-96 object-cover rounded-lg shadow-lg hover-glow transition-all-smooth hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-venue-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-text-dark mb-4">
              Our Values
            </h2>
            <p className="text-lg text-venue-text-secondary max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment
              to excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-all-smooth hover-lift hover-glow"
              >
                <div className="w-16 h-16 bg-venue-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-venue-primary-accent" />
                </div>
                <h3 className="text-xl font-semibold text-venue-text-dark mb-3">
                  {value.title}
                </h3>
                <p className="text-venue-text-secondary">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-venue-primary-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-white/90">
              Numbers that showcase our growing community and success
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/placeholder.svg"
                alt="Beautiful event venue"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-venue-text-primary mb-6">
                Our Vision
              </h2>
              <div className="space-y-4 text-lg text-venue-text-secondary">
                <p>
                  We envision a world where planning events is enjoyable,
                  transparent, and accessible to everyone. Our goal is to become
                  India's most trusted venue booking platform, known for our
                  quality, reliability, and exceptional customer service.
                </p>
                <p>
                  We're constantly innovating and expanding our platform to
                  include more venues, better tools, and enhanced features that
                  make event planning easier and more efficient.
                </p>
                <p className="text-venue-primary-accent font-semibold">
                  "Every celebration deserves the perfect venue, and we're here
                  to make that happen."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      
    </div>
  );
};

export default About;
