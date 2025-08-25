import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from '@/lib/navigation';
import { Button } from './ui/button';
import { Menu, X, MapPin, LogOut, User, Building, Heart, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

// API service functions
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
      }
    });

    // Read response body once
    let data = null;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse response as JSON:', jsonError);
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data && data.error ? data.error : 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();
  const { user, logout, isVenueOwner, isLoggedIn } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Subscribe to real-time notification updates for customers
  useEffect(() => {
    if (isLoggedIn && !isVenueOwner()) {
      // Initial load
      loadNotificationCount();

      // Subscribe to real-time updates
      const unsubscribe = notificationService.subscribe((data) => {
        if (data.type === 'count_update') {
          setNotificationCount(data.count);
        } else if (data.type === 'notifications_update') {
          setNotifications(data.notifications);
        }
      });

      return unsubscribe;
    }
  }, [isLoggedIn, isVenueOwner]);

  // Refresh notifications when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn && !isVenueOwner()) {
        notificationService.triggerUpdate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn, isVenueOwner]);

  const loadNotificationCount = async () => {
    try {
      const data = await apiCall('/api/bookings/customer/notification-count');
      setNotificationCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Venues', path: '/venues' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const userNavLinks = [
    ...navLinks,
    // Remove favorites tab for customers - they should not see this
  ];

  const currentNavLinks = isLoggedIn ? userNavLinks : navLinks;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F181d3ec55b014ac2aead9c04dc47e7f1%2F58dccb4263c94bf8bdc07b4891c6b92d?format=webp&width=800"
              alt="VenueKart Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-venue-dark font-inter">VenueKart</span>
              <span className="text-xs text-venue-indigo font-medium -mt-1">Event Venue Discovery & Booking</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={scrollToTop}
                className={`font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActive(link.path)
                    ? 'text-venue-indigo border-b-2 border-venue-indigo pb-1'
                    : 'text-gray-700 hover:text-venue-indigo'
                }`}
              >
                {link.name === 'Favorites' && <Heart className="h-4 w-4" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Customer notification bell */}
                {!isVenueOwner() && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (!showNotifications) {
                          await loadNotifications();
                        }
                        setShowNotifications(!showNotifications);
                      }}
                      className={`relative transition-all duration-300 ease-in-out transform hover:scale-110 ${
                        notificationCount > 0
                          ? 'text-venue-purple hover:text-venue-indigo hover:bg-venue-lavender/20'
                          : 'text-gray-500 hover:text-venue-indigo hover:bg-venue-lavender/10'
                      } ${showNotifications ? 'bg-venue-lavender/30 text-venue-indigo' : ''}`}
                    >
                      <Bell className={`h-5 w-5 transition-all duration-300 ${
                        notificationCount > 0 ? 'animate-pulse' : ''
                      }`} />

                      {/* Enhanced notification badge */}
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-bounce">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}

                      {/* Pulse effect for new notifications */}
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-400 rounded-full h-5 w-5 animate-ping opacity-75"></span>
                      )}
                    </Button>

                    {/* Enhanced Notifications Dropdown */}
                    {showNotifications && (
                      <div className="notification-dropdown absolute right-0 top-full mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 transform transition-all duration-300 ease-out scale-100 opacity-100">
                        {/* Header with gradient */}
                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-venue-indigo to-venue-purple text-white rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              Your Notifications
                            </h3>
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                              {notificationCount} unread
                            </span>
                          </div>
                          <p className="text-sm text-white/90 mt-1">
                            {notificationCount === 0 ? 'All caught up!' : `You have ${notificationCount} new ${notificationCount === 1 ? 'update' : 'updates'}`}
                          </p>
                        </div>

                        {/* Scrollable content */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="font-medium">No notifications</p>
                              <p className="text-xs text-gray-400 mt-1">Inquiry updates will appear here</p>
                            </div>
                          ) : (
                            notifications.slice(0, 6).map((notification, index) => (
                              <div
                                key={notification.id}
                                className="p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-venue-lavender/20 hover:to-venue-lavender/10 transition-all duration-200 cursor-pointer group"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                        notification.status === 'confirmed' ? 'bg-green-500' :
                                        notification.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                      }`}>
                                        {notification.status === 'confirmed' ? '✓' :
                                         notification.status === 'cancelled' ? '✗' : '⏳'}
                                      </div>
                                      <p className="font-semibold text-sm text-gray-900 group-hover:text-venue-indigo transition-colors">
                                        {notification.message}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1 ml-10">{notification.venue_name}</p>
                                    <p className="text-xs text-gray-500 ml-10 flex items-center gap-1">
                                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                                      {new Date(notification.event_date).toLocaleDateString()}
                                      <span className="inline-block w-1 h-1 bg-gray-400 rounded-full mx-1"></span>
                                      {notification.guest_count} guests
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-bold text-venue-indigo">
                                      ₹{parseFloat(notification.amount).toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {new Date(notification.updated_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer with action buttons */}
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 hover:bg-venue-lavender hover:border-venue-indigo hover:text-venue-indigo transition-all duration-200"
                                onClick={() => setShowNotifications(false)}
                              >
                                Close
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 text-venue-dark">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.name || 'User'}</span>
                  {isVenueOwner() && (
                    <span className="text-xs bg-venue-lavender text-venue-indigo px-2 py-1 rounded-full">
                      Venue Owner
                    </span>
                  )}
                </div>
                {isVenueOwner() && (
                  <Button asChild variant="outline" className="border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white" onClick={scrollToTop}>
                    <Link to="/admin/dashboard">
                      <Building className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <Button onClick={handleLogout} variant="ghost" className="text-venue-indigo hover:text-venue-purple">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-venue-indigo hover:text-venue-purple hover:bg-venue-lavender/50 transition-colors" onClick={scrollToTop}>
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-venue-indigo hover:bg-venue-purple text-white" onClick={scrollToTop}>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-venue-indigo"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {currentNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                    isActive(link.path)
                      ? 'text-venue-indigo bg-venue-lavender'
                      : 'text-gray-700 hover:text-venue-indigo hover:bg-gray-50'
                  }`}
                >
                  {link.name === 'Favorites' && <Heart className="h-4 w-4" />}
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2 text-center text-venue-dark">
                      <div className="flex items-center justify-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">{user?.name || 'User'}</span>
                        {/* Mobile notification bell for customers */}
                        {!isVenueOwner() && notificationCount > 0 && (
                          <div className="relative">
                            <Bell className="h-4 w-4 text-venue-purple animate-pulse" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center font-medium">
                              {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                          </div>
                        )}
                      </div>
                      {isVenueOwner() && (
                        <span className="text-xs bg-venue-lavender text-venue-indigo px-2 py-1 rounded-full mt-1 inline-block">
                          Venue Owner
                        </span>
                      )}
                      {!isVenueOwner() && notificationCount > 0 && (
                        <p className="text-xs text-venue-indigo mt-1">
                          {notificationCount} new notification{notificationCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    {isVenueOwner() && (
                      <Button asChild variant="outline" className="w-full border-venue-indigo text-venue-indigo hover:bg-venue-indigo hover:text-white">
                        <Link to="/admin/dashboard" onClick={() => {
                          setIsMenuOpen(false);
                          scrollToTop();
                        }}>
                          <Building className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-venue-indigo hover:text-venue-purple">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full text-venue-indigo hover:text-venue-purple hover:bg-venue-lavender/50 transition-colors">
                      <Link to="/signin" onClick={scrollToTop}>Sign In</Link>
                    </Button>
                    <Button asChild className="w-full bg-venue-indigo hover:bg-venue-purple text-white">
                      <Link to="/signup" onClick={scrollToTop}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
