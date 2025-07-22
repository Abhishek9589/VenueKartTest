import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
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
  Calendar,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [guests, setGuests] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Comprehensive venue data (in a real app, this would come from an API)
  const venue = {
    id: parseInt(id),
    name: "Grand Palace Hotel",
    location: "Bandra West, Mumbai, Maharashtra",
    address: "123 Linking Road, Bandra West, Mumbai - 400050",
    coordinates: { lat: 19.0596, lng: 72.8295 },
    rating: 4.8,
    reviews: 124,
    price: 50000,
    capacity: { min: 50, max: 500 },
    type: "Wedding Hall",
    shortDescription: "Luxurious wedding venue with stunning architecture and world-class amenities.",
    fullDescription: `Grand Palace Hotel is a premier wedding destination that combines timeless elegance with modern luxury. Our magnificent ballroom features soaring ceilings, crystal chandeliers, and panoramic city views that create an unforgettable backdrop for your special day.

    With over 20 years of experience in hosting exceptional events, we understand that every celebration is unique. Our dedicated team of event coordinators works closely with you to ensure every detail is perfect, from the initial planning stages to the final farewell.

    The venue boasts state-of-the-art audiovisual equipment, customizable lighting systems, and flexible space configurations to accommodate both intimate gatherings and grand celebrations. Our award-winning culinary team offers diverse menu options, from traditional Indian cuisine to international delicacies.`,
    
    images: [
      "/placeholder.svg",
      "/placeholder.svg", 
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    
    facilities: [
      { name: "Free Wi-Fi", icon: Wifi, description: "High-speed internet throughout the venue" },
      { name: "Valet Parking", icon: Car, description: "Complimentary valet service for 200 cars" },
      { name: "Premium Catering", icon: Utensils, description: "Award-winning multi-cuisine catering" },
      { name: "Professional Sound System", icon: Music, description: "State-of-the-art audio equipment" },
      { name: "Photography Services", icon: Camera, description: "Professional photography and videography" },
      { name: "Bridal Suite", icon: Coffee, description: "Luxury preparation room for bride and groom" },
    ],
    
    included: [
      "Event coordination and planning assistance",
      "Basic lighting and sound system",
      "Tables, chairs, and basic linens",
      "Security services",
      "Cleaning and maintenance",
      "Dedicated event manager"
    ],
    
    policies: [
      "50% advance payment required for booking confirmation",
      "Cancellation allowed up to 30 days before event",
      "Outside alcohol not permitted",
      "Decorations must be approved by venue management",
      "Event must end by 1:00 AM",
      "Maximum capacity strictly enforced"
    ],
    
    availability: [
      { date: "2025-02-15", available: true },
      { date: "2025-02-22", available: false },
      { date: "2025-03-01", available: true },
      { date: "2025-03-08", available: true },
      { date: "2025-03-15", available: false },
    ],
    
    contactInfo: {
      manager: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "events@grandpalacehotel.com",
      website: "www.grandpalacehotel.com"
    },
    
    nearbyAttractions: [
      "Bandra-Worli Sea Link - 2 km",
      "Linking Road Shopping - 500m",
      "Mount Mary Church - 1.5 km",
      "Carter Road Promenade - 1 km"
    ]
  };

  const facilityIcons = {
    Wifi: Wifi,
    Car: Car,
    Utensils: Utensils,
    Music: Music,
    Camera: Camera,
    Coffee: Coffee,
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to sign in page
      navigate("/signin", {
        state: {
          from: `/venue/${id}`,
          message: "Please sign in to make a booking request"
        }
      });
      return;
    }

    // User is authenticated, process booking
    alert(`Booking inquiry submitted for ${selectedDate} with ${guests} guests. Our team will contact you shortly!`);

    // Reset form
    setSelectedDate("");
    setGuests("");
  };

  return (
    <div className="min-h-screen bg-venue-cream-light">
      {/* Header with back button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/venues" 
              className="flex items-center gap-2 text-venue-text-dark hover:text-venue-purple transition-colors-smooth"
            >
              <ArrowLeft size={20} />
              <span>Back to Venues</span>
            </Link>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-all-smooth hover:scale-110 ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-venue-text-light hover:text-venue-purple'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 rounded-full text-venue-text-light hover:text-venue-purple hover:bg-venue-cream transition-all-smooth">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img
                  src={venue.images[currentImageIndex]}
                  alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-venue-text-dark p-2 rounded-full transition-all-smooth hover:scale-110"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-venue-text-dark p-2 rounded-full transition-all-smooth hover:scale-110"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {venue.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all-smooth ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 p-4">
                {venue.images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all-smooth ${
                      index === currentImageIndex ? 'border-venue-purple' : 'border-transparent hover:border-venue-purple-light'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-venue-text-dark mb-2">{venue.name}</h1>
                    <div className="flex items-center gap-4 text-venue-text-light mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{venue.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{venue.capacity.min}-{venue.capacity.max} guests</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="font-medium">{venue.rating}</span>
                      </div>
                      <span className="text-venue-text-light">({venue.reviews} reviews)</span>
                      <span className="px-2 py-1 bg-venue-purple-lighter text-venue-purple-dark text-sm rounded-full">
                        {venue.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-venue-purple">{formatPrice(venue.price)}</div>
                    <div className="text-venue-text-light text-sm">per event</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-venue-text-dark mb-4">About This Venue</h2>
                <p className="text-venue-text-light mb-4">{venue.shortDescription}</p>
                <div className="space-y-4">
                  {venue.fullDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-venue-text-light leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-venue-text-dark mb-6">Facilities & Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue.facilities.map((facility, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-venue-cream transition-all-smooth">
                    <div className="w-10 h-10 bg-venue-purple-lighter rounded-lg flex items-center justify-center flex-shrink-0">
                      <facility.icon size={20} className="text-venue-purple-dark" />
                    </div>
                    <div>
                      <h3 className="font-medium text-venue-text-dark">{facility.name}</h3>
                      <p className="text-sm text-venue-text-light">{facility.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-venue-text-dark mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {venue.included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                    <span className="text-venue-text-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-venue-text-dark mb-6">Venue Policies</h2>
              <div className="space-y-3">
                {venue.policies.map((policy, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-venue-purple rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-venue-text-light">{policy}</span>
                  </div>
                ))}
              </div>
            </div>


          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Booking Form */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-venue-text-dark mb-6">Check Availability</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-venue-text-dark mb-2">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-venue-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-venue-text-dark mb-2">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder={`${venue.capacity.min} - ${venue.capacity.max} guests`}
                      min={venue.capacity.min}
                      max={venue.capacity.max}
                      className="w-full p-3 border border-venue-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-venue-purple hover:bg-venue-purple-dark text-white py-3 rounded-lg font-semibold transition-all-smooth hover:scale-105"
                  >
                    {isAuthenticated() ? "Request Booking" : "Sign In to Book"}
                  </button>
                </form>
                <div className="mt-4 p-3 bg-venue-cream rounded-lg">
                  <p className="text-sm text-venue-text-light text-center">
                    Free consultation • No booking fees • Instant response
                  </p>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;
