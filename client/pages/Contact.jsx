import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Calendar,
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "info@venuekart.com",
      subtitle: "We'll respond within 24 hours",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 98765 43210",
      subtitle: "Mon-Sat, 9:00 AM - 8:00 PM",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "Mumbai, India",
      subtitle: "Schedule an appointment",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Mon-Sat: 9:00 AM - 8:00 PM",
      subtitle: "Sunday: 10:00 AM - 6:00 PM",
    },
  ];

  const supportTypes = [
    {
      icon: MessageCircle,
      title: "General Inquiry",
      description: "Questions about our platform and services",
    },
    {
      icon: Calendar,
      title: "Booking Support",
      description: "Help with existing bookings or new reservations",
    },
    {
      icon: Users,
      title: "Venue Partnership",
      description: "Information about listing your venue with us",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
            <section className="bg-gradient-to-br from-venue-primary-accent to-venue-secondary-accent py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Have questions? We're here to help you find the perfect venue for
            your event.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-venue-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-200"
              >
                                <div className="w-16 h-16 bg-venue-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4">
                                    <info.icon className="w-8 h-8 text-venue-primary-accent" />
                </div>
                                <h3 className="text-lg font-semibold text-venue-text-dark mb-2">
                  {info.title}
                </h3>
                                <p className="text-venue-primary-accent font-medium mb-1">
                  {info.details}
                </p>
                <p className="text-venue-text-secondary text-sm">{info.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
                            <h2 className="text-3xl font-bold text-venue-text-dark mb-6">
                Send Us a Message
              </h2>
              <p className="text-venue-text-secondary mb-8">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                                            className="block text-sm font-medium text-venue-text-dark mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                                            className="w-full px-4 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                                            className="block text-sm font-medium text-venue-text-dark mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                                            className="w-full px-4 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                                          className="block text-sm font-medium text-venue-text-dark mb-2"
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                                          className="w-full px-4 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                                          className="block text-sm font-medium text-venue-text-dark mb-2"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent resize-vertical"
                    placeholder="Tell us more about how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                                    className="btn-primary w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            </div>

            {/* Support Types */}
            <div>
                            <h2 className="text-3xl font-bold text-venue-text-dark mb-6">
                How Can We Help?
              </h2>
              <p className="text-venue-text-secondary mb-8">
                Choose the type of support you need and we'll connect you with
                the right team member.
              </p>

              <div className="space-y-6">
                {supportTypes.map((type, index) => (
                  <div
                    key={index}
                                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-venue-secondary-accent hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-venue-secondary-bg rounded-lg flex items-center justify-center flex-shrink-0">
                                                <type.icon className="w-6 h-6 text-venue-primary-accent" />
                      </div>
                      <div>
                                                <h3 className="text-lg font-semibold text-venue-text-dark mb-2">
                          {type.title}
                        </h3>
                        <p className="text-venue-text-secondary">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Link */}
                            <div className="mt-8 p-6 bg-venue-secondary-bg rounded-lg">
                                <h3 className="text-lg font-semibold text-venue-text-dark mb-2">
                  Frequently Asked Questions
                </h3>
                <p className="text-gray-600 mb-4">
                  Check out our FAQ section for quick answers to common
                  questions.
                </p>
                                <button className="text-venue-primary-accent hover:text-venue-primary-accent-hover font-medium">
                  View FAQ →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-venue-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-venue-text-primary mb-4">
              Find Us Here
            </h2>
            <p className="text-venue-text-secondary">
              Located in the heart of Mumbai, we're easily accessible from
              anywhere in the city.
            </p>
          </div>

          {/* Placeholder for map */}
          <div className="bg-venue-muted-bg h-96 rounded-lg flex items-center justify-center border border-venue-border">
            <div className="text-center">
              <MapPin size={48} className="text-venue-text-secondary mx-auto mb-4" />
              <p className="text-venue-text-primary text-lg">Interactive Map</p>
              <p className="text-venue-text-secondary">
                Mumbai, India - Exact location available on contact
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
