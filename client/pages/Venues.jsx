import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Star,
  DollarSign,
  Wifi,
  Car,
  Coffee,
  Music,
  Camera,
  Utensils,
  Filter,
  X,
} from "lucide-react";

const Venues = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    venueType: "",
    location: "",
    priceMin: "",
    priceMax: "",
    capacity: "",
  });

  // Removed scroll reveal for stability

  const venueTypes = [
    "Wedding Hall",
    "Conference Center",
    "Banquet Hall",
    "Resort",
    "Hotel",
    "Restaurant",
    "Garden",
    "Beachside",
  ];

  const venues = [
    {
      id: 1,
      name: "Grand Palace Hotel",
      location: "Bandra, Mumbai",
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 124,
      price: 50000,
      capacity: 500,
      description:
        "Luxurious wedding venue with stunning architecture and world-class amenities.",
      facilities: ["Wifi", "Parking", "Catering", "Music", "Photography"],
      type: "Wedding Hall",
    },
    {
      id: 2,
      name: "Sunset Garden Resort",
      location: "Anjuna, Goa",
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 89,
      price: 35000,
      capacity: 300,
      description:
        "Beautiful beachside resort perfect for destination weddings and corporate retreats.",
      facilities: ["Wifi", "Parking", "Catering", "Bar"],
      type: "Resort",
    },
    {
      id: 3,
      name: "Royal Convention Center",
      location: "Connaught Place, Delhi",
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 156,
      price: 75000,
      capacity: 1000,
      description:
        "Modern convention center ideal for large corporate events and conferences.",
      facilities: [
        "Wifi",
        "Parking",
        "Catering",
        "Music",
        "Photography",
        "AV Equipment",
      ],
      type: "Conference Center",
    },
    {
      id: 4,
      name: "Beachside Villa",
      location: "Kovalam, Kerala",
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 67,
      price: 25000,
      capacity: 150,
      description:
        "Intimate beachside villa with panoramic ocean views, perfect for small gatherings.",
      facilities: ["Wifi", "Parking", "Catering"],
      type: "Beachside",
    },
    {
      id: 5,
      name: "Heritage Banquet Hall",
      location: "Rajouri Garden, Delhi",
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 203,
      price: 40000,
      capacity: 400,
      description:
        "Traditional banquet hall with modern amenities and excellent catering services.",
      facilities: ["Wifi", "Parking", "Catering", "Music", "Photography"],
      type: "Banquet Hall",
    },
    {
      id: 6,
      name: "Skyline Restaurant",
      location: "Marine Drive, Mumbai",
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 91,
      price: 30000,
      capacity: 200,
      description:
        "Rooftop restaurant with breathtaking city views, ideal for cocktail parties.",
      facilities: ["Wifi", "Catering", "Bar", "Music"],
      type: "Restaurant",
    },
  ];

  const facilityIcons = {
    Wifi: Wifi,
    Parking: Car,
    Catering: Utensils,
    Music: Music,
    Photography: Camera,
    Bar: Coffee,
    "AV Equipment": Music,
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      venueType: "",
      location: "",
      priceMin: "",
      priceMax: "",
      capacity: "",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-venue-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold text-venue-text-dark mb-4">
            Find Your Perfect Venue
          </h1>
          <p className="text-lg text-venue-text-secondary">
            Discover amazing venues for your special events
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="btn-primary lg:hidden w-full px-4 py-2 rounded-lg flex items-center justify-between mb-4 hover:scale-105 animate-slide-up"
            >
              <span className="flex items-center gap-2">
                <Filter size={20} />
                Filters
              </span>
              {isFiltersOpen ? <X size={20} /> : <Filter size={20} />}
            </button>

            {/* Filter Panel */}
            <div
              className={`bg-white p-6 rounded-lg shadow-md space-y-6 transition-all-smooth hover-glow animate-fade-in-left ${
                isFiltersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-venue-text-dark">
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                                    className="text-venue-primary-accent hover:text-venue-primary-accent-hover text-sm font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Venue Type */}
              <div>
                <label className="block text-sm font-medium text-venue-text-dark mb-2">
                  Venue Type
                </label>
                <select
                  value={filters.venueType}
                  onChange={(e) =>
                    handleFilterChange("venueType", e.target.value)
                  }
                  className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent transition-all-smooth"
                >
                  <option value="">All Types</option>
                  {venueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-venue-text-dark mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  placeholder="Enter city or area"
                  className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent transition-all-smooth"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-venue-text-dark mb-2">
                  Price Range (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) =>
                      handleFilterChange("priceMin", e.target.value)
                    }
                    placeholder="Min"
                    className="w-1/2 p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent transition-all-smooth"
                  />
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) =>
                      handleFilterChange("priceMax", e.target.value)
                    }
                    placeholder="Max"
                    className="w-1/2 p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent transition-all-smooth"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-venue-text-dark mb-2">
                  Minimum Capacity
                </label>
                <input
                  type="number"
                  value={filters.capacity}
                  onChange={(e) =>
                    handleFilterChange("capacity", e.target.value)
                  }
                  placeholder="Number of guests"
                  className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent transition-all-smooth"
                />
              </div>

              {/* Apply Filters Button */}
                            <button className="btn-primary w-full py-3 rounded-lg font-semibold hover:scale-105 hover-glow">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Venue Cards Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {venues.map((venue, index) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-lg shadow-md border border-venue-border overflow-hidden hover:shadow-lg transition-all-smooth hover-lift hover-glow"
                >
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-venue-text-primary line-clamp-1">
                        {venue.name}
                      </h3>
                      <div className="flex items-center">
                        <Star
                          size={16}
                          className="text-yellow-400 fill-current"
                        />
                        <span className="ml-1 text-sm font-medium">
                          {venue.rating}
                        </span>
                        <span className="text-xs text-venue-text-secondary ml-1">
                          ({venue.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-venue-text-secondary mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span className="text-sm">{venue.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center text-venue-primary-accent">
                        <DollarSign size={16} className="mr-1" />
                        <span className="font-semibold">
                          {formatPrice(venue.price)}
                        </span>
                      </div>
                      <div className="flex items-center text-venue-text-secondary">
                        <Users size={16} className="mr-1" />
                        <span className="text-sm">{venue.capacity} guests</span>
                      </div>
                    </div>

                    <p className="text-venue-text-secondary text-sm mb-3 line-clamp-2">
                      {venue.description}
                    </p>

                    {/* Facilities */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {venue.facilities.slice(0, 4).map((facility, index) => {
                        const IconComponent = facilityIcons[facility] || Wifi;
                        return (
                          <div
                            key={index}
                                                        className="flex items-center gap-1 bg-venue-secondary-bg text-venue-text-primary px-2 py-1 rounded-full text-xs"
                          >
                            <IconComponent size={12} />
                            <span>{facility}</span>
                          </div>
                        );
                      })}
                      {venue.facilities.length > 4 && (
                        <span className="text-xs text-venue-text-secondary px-2 py-1">
                          +{venue.facilities.length - 4} more
                        </span>
                      )}
                    </div>

                                        <Link
                      to={`/venue/${venue.id}`}
                      className="btn-primary w-full py-2 rounded-lg font-medium hover:scale-105 flex items-center justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
                            <button className="btn-primary px-8 py-3 rounded-lg font-semibold hover-lift hover:scale-105">
                Load More Venues
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Venues;
