import { Link } from "react-router-dom";
import {
  Search,
  Shield,
  DollarSign,
  Clock,
  Users,
  Star,
  MapPin,
  Calendar,
  Mail,
} from "lucide-react";
import { useState } from "react";

const Home = () => {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: Shield,
      title: "Verified Listings",
      description:
        "All venues are thoroughly verified and quality-checked by our team.",
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description:
        "No hidden costs. See exact pricing upfront for every venue.",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Round-the-clock customer support to help with your venue needs.",
    },
    {
      icon: Users,
      title: "Easy Booking",
      description:
        "Simple, hassle-free booking process with instant confirmation.",
    },
  ];

  const popularVenues = [
    {
      id: 1,
      name: "Grand Palace Hotel",
      location: "Mumbai, Maharashtra",
      image: "/placeholder.svg",
      rating: 4.8,
      price: "₹50,000",
      capacity: 500,
    },
    {
      id: 2,
      name: "Sunset Garden Resort",
      location: "Goa",
      image: "/placeholder.svg",
      rating: 4.9,
      price: "₹35,000",
      capacity: 300,
    },
    {
      id: 3,
      name: "Royal Convention Center",
      location: "Delhi",
      image: "/placeholder.svg",
      rating: 4.7,
      price: "₹75,000",
      capacity: 1000,
    },
    {
      id: 4,
      name: "Beachside Villa",
      location: "Kerala",
      image: "/placeholder.svg",
      rating: 4.9,
      price: "₹25,000",
      capacity: 150,
    },
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-venue-primary-accent via-venue-secondary-accent to-venue-secondary-accent min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Find Your Perfect
            <span className="block text-venue-primary-accent-hover">
              Event Venue
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-stagger-2">
            Discover verified venues with transparent pricing for weddings,
            corporate events, and special celebrations.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 flex flex-col sm:flex-row gap-2 animate-stagger-3 hover-glow transition-all-smooth">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search venues by location..."
                className="w-full px-4 py-3 text-venue-text-primary placeholder-venue-text-secondary border-0 focus:outline-none rounded-lg transition-all-smooth focus:ring-2 focus:ring-venue-primary-accent"
              />
            </div>
            <Link
              to="/venues"
              className="btn-primary px-8 py-3 rounded-lg font-semibold hover-lift flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Search Venues
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-venue-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-text-primary mb-4">
              Why Choose VenueKart?
            </h2>
            <p className="text-lg text-venue-text-secondary max-w-2xl mx-auto">
              We make venue discovery and booking simple, transparent, and
              reliable for all your event needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all-smooth text-center hover-lift hover-glow"
              >
                <div className="w-16 h-16 bg-venue-secondary-bg rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-smooth hover:scale-110">
                  <feature.icon className="w-8 h-8 text-venue-primary-accent" />
                </div>
                <h3 className="text-xl font-semibold text-venue-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-venue-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Venues Carousel */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-text-primary mb-4">
              Popular Venues
            </h2>
            <p className="text-lg text-venue-text-secondary">
              Discover top-rated venues loved by our customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularVenues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all-smooth hover-lift hover-glow"
              >
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-venue-text-primary mb-2">
                    {venue.name}
                  </h3>
                  <div className="flex items-center text-venue-text-secondary mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{venue.location}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star
                        size={16}
                        className="text-yellow-400 fill-current"
                      />
                      <span className="ml-1 text-sm font-medium">
                        {venue.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-venue-text-secondary">
                      <Users size={16} className="mr-1" />
                      <span className="text-sm">{venue.capacity}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-venue-primary-accent">
                      {venue.price}
                    </span>
                    <Link
                      to={`/venue/${venue.id}`}
                      className="btn-secondary px-4 py-2 rounded-md text-sm font-medium hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-venue-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-venue-text-secondary">
              Simple 3-step process to book your perfect venue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-venue-secondary-accent rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-smooth hover:scale-110 hover:rotate-6">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-venue-text-primary mb-2">
                1. Search & Filter
              </h3>
              <p className="text-venue-text-secondary">
                Browse venues by location, capacity, price range, and amenities
                to find your perfect match.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-venue-primary-accent rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-smooth hover:scale-110 hover:rotate-6">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-venue-text-primary mb-2">
                2. Check Availability
              </h3>
              <p className="text-venue-text-secondary">
                View real-time availability, detailed photos, and transparent
                pricing for your preferred dates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-venue-primary-accent-hover rounded-full flex items-center justify-center mx-auto mb-4 transition-transform-smooth hover:scale-110 hover:rotate-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-venue-text-primary mb-2">
                3. Book Securely
              </h3>
              <p className="text-venue-text-secondary">
                Complete your booking with secure payment and receive instant
                confirmation with all details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-venue-primary-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new
            venues, special offers, and event planning tips.
          </p>

          <form
            onSubmit={handleNewsletterSubmit}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-venue-secondary-accent transition-all-smooth"
              required
            />
            <button
              type="submit"
              className="btn-secondary px-6 py-3 rounded-lg font-semibold hover:scale-105 hover-glow flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
