import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Home,
  Building,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Star,
  MapPin,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: "inquiry",
      message: "New booking inquiry for Grand Palace Hotel",
      client: "Priya Sharma",
      venue: "Grand Palace Hotel",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "booking",
      message: "Booking confirmed for Royal Convention Center",
      client: "Rajesh Kumar",
      venue: "Royal Convention Center",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "review",
      message: "New 5-star review received",
      client: "Anjali Patel",
      venue: "Sunset Garden Resort",
      time: "1 day ago",
      read: true,
    },
  ]);

  const [venues] = useState([
    {
      id: 1,
      name: "Grand Palace Hotel",
      location: "Bandra, Mumbai",
      price: 50000,
      capacity: 500,
      status: "active",
      bookings: 12,
      rating: 4.8,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Royal Convention Center",
      location: "Delhi",
      price: 75000,
      capacity: 1000,
      status: "active",
      bookings: 8,
      rating: 4.7,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Sunset Garden Resort",
      location: "Goa",
      price: 35000,
      capacity: 300,
      status: "pending",
      bookings: 5,
      rating: 4.9,
      image: "/placeholder.svg",
    },
  ]);

  const [stats] = useState({
    totalVenues: 15,
    activeBookings: 25,
    totalRevenue: 2850000,
    pendingInquiries: 8,
    thisMonthBookings: 12,
    averageRating: 4.7,
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const NotificationDropdown = () => (
    <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-venue-cream-dark z-50">
      <div className="p-4 border-b border-venue-cream-dark">
        <h3 className="font-semibold text-venue-text-dark">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 border-b border-venue-cream-dark hover:bg-venue-cream transition-colors-smooth ${
              !notification.read ? "bg-venue-purple-lighter/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                notification.type === "inquiry" ? "bg-blue-100 text-blue-600" :
                notification.type === "booking" ? "bg-green-100 text-green-600" :
                "bg-yellow-100 text-yellow-600"
              }`}>
                {notification.type === "inquiry" ? <MessageSquare size={16} /> :
                 notification.type === "booking" ? <CheckCircle size={16} /> :
                 <Star size={16} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-venue-text-dark">{notification.message}</p>
                <p className="text-xs text-venue-text-light">From: {notification.client}</p>
                <p className="text-xs text-venue-text-light">{notification.time}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-venue-purple rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 text-center">
        <button className="text-venue-purple text-sm hover:underline">View all notifications</button>
      </div>
    </div>
  );

  const UploadVenueModal = () => (
    <div className="fixed inset-0 bg-venue-primary-accent/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-venue-shadow">
        <div className="p-6 border-b border-venue-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-venue-text-primary">Add New Venue</h2>
          <button
            onClick={() => setShowUploadModal(false)}
            className="text-venue-text-secondary hover:text-venue-text-primary"
          >
            <X size={24} />
          </button>
        </div>
        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-venue-text-primary mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                placeholder="Enter venue name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-venue-text-primary mb-2">
                Venue Type *
              </label>
              <select className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent">
                <option>Wedding Hall</option>
                <option>Conference Center</option>
                <option>Banquet Hall</option>
                <option>Resort</option>
                <option>Restaurant</option>
                <option>Garden</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-venue-text-dark mb-2">
              Location *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-venue-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-venue-text-dark mb-2">
              Full Address *
            </label>
            <textarea
              className="w-full p-3 border border-venue-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple"
              rows="3"
              placeholder="Complete address with pincode"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-venue-text-primary mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-venue-text-primary mb-2">
                Min Capacity *
              </label>
              <input
                type="number"
                className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-venue-text-primary mb-2">
                Max Capacity *
              </label>
              <input
                type="number"
                className="w-full p-3 border border-venue-border rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-primary-accent"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-venue-text-dark mb-2">
              Description *
            </label>
            <textarea
              className="w-full p-3 border border-venue-cream-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-venue-purple"
              rows="4"
              placeholder="Detailed description of the venue"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-venue-text-dark mb-2">
              Facilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["WiFi", "Parking", "Catering", "Music System", "Photography", "Bar", "AC", "Security"].map((facility) => (
                <label key={facility} className="flex items-center gap-2">
                  <input type="checkbox" className="text-venue-purple" />
                  <span className="text-sm text-venue-text-dark">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-venue-text-dark mb-2">
              Venue Images *
            </label>
            <div className="border-2 border-dashed border-venue-cream-dark rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-2 text-venue-text-light" size={48} />
              <p className="text-venue-text-light mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-venue-text-light">PNG, JPG up to 10MB (minimum 5 images)</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="flex-1 border border-venue-border text-venue-text-primary py-3 rounded-lg font-medium hover:bg-venue-muted-bg transition-colors-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3 rounded-lg font-medium"
            >
              Upload Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-venue-text-light text-sm">Total Venues</p>
                    <p className="text-2xl font-bold text-venue-text-dark">{stats.totalVenues}</p>
                  </div>
                  <Building className="text-venue-purple" size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-venue-text-light text-sm">Active Bookings</p>
                    <p className="text-2xl font-bold text-venue-text-dark">{stats.activeBookings}</p>
                  </div>
                  <Calendar className="text-green-500" size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-venue-text-light text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-venue-text-dark">{formatPrice(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="text-green-500" size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-venue-text-light text-sm">Pending Inquiries</p>
                    <p className="text-2xl font-bold text-venue-text-dark">{stats.pendingInquiries}</p>
                  </div>
                  <MessageSquare className="text-orange-500" size={24} />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-venue-text-dark mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-venue-cream rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="text-green-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-venue-text-dark">New booking confirmed</p>
                    <p className="text-sm text-venue-text-light">Grand Palace Hotel - Wedding event for 300 guests</p>
                  </div>
                  <span className="text-sm text-venue-text-light">2 hours ago</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-venue-cream rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageSquare className="text-blue-600" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-venue-text-dark">New inquiry received</p>
                    <p className="text-sm text-venue-text-light">Royal Convention Center - Corporate event inquiry</p>
                  </div>
                  <span className="text-sm text-venue-text-light">5 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "venues":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-venue-text-dark">My Venues</h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Add New Venue
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={venue.image} alt={venue.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-venue-text-dark">{venue.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        venue.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {venue.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-venue-text-light text-sm mb-2">
                      <MapPin size={14} />
                      <span>{venue.location}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-venue-purple">{formatPrice(venue.price)}</span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm">{venue.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-venue-purple-light hover:bg-venue-purple text-white py-2 rounded text-sm transition-colors-smooth">
                        <Eye size={16} className="inline mr-1" />
                        View
                      </button>
                      <button className="flex-1 border border-venue-purple text-venue-purple hover:bg-venue-purple hover:text-white py-2 rounded text-sm transition-colors-smooth">
                        <Edit size={16} className="inline mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-venue-cream-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-venue-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-venue-purple hover:text-venue-purple-dark">
                <Home size={24} />
              </Link>
              <h1 className="text-xl font-semibold text-venue-text-dark">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-venue-text-light hover:text-venue-purple rounded-full hover:bg-venue-cream transition-all-smooth"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && <NotificationDropdown />}
              </div>
              <Link
                to="/signin"
                className="text-venue-text-light hover:text-venue-purple"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-md p-6 h-fit">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "overview"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <BarChart3 size={20} />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("venues")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "venues"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <Building size={20} />
                My Venues
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "bookings"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <Calendar size={20} />
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "inquiries"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <MessageSquare size={20} />
                Inquiries
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "analytics"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <BarChart3 size={20} />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors-smooth ${
                  activeTab === "settings"
                    ? "bg-venue-purple text-white"
                    : "text-venue-text-dark hover:bg-venue-cream"
                }`}
              >
                <Settings size={20} />
                Settings
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadVenueModal />}
    </div>
  );
};

export default AdminDashboard;
