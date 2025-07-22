import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isDemoMode } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Venues", path: "/venues" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-venue-border transition-all-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F317fd6eb2bf64600868e324db448b428%2F64862cb0fd1849b4871cf34916b603a2?format=webp&width=800"
              alt="VenueKart Logo"
              className="w-8 h-8 rounded-lg transition-transform-smooth group-hover:scale-110 group-hover:rotate-6"
            />
            <span className="text-2xl font-bold text-venue-text-primary transition-colors-smooth group-hover:text-venue-primary-accent">
              VenueKart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all-smooth hover-lift ${
                  isActive(item.path)
                    ? "text-venue-primary-accent bg-venue-secondary-bg shadow-md"
                    : "text-venue-text-primary hover:text-venue-secondary-accent hover:bg-venue-secondary-bg/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                <span className="text-venue-text-primary">
                  Hi, {user?.name || "User"}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-venue-text-primary hover:text-venue-secondary-accent px-3 py-2 rounded-md text-sm font-medium transition-all-smooth hover-lift"
                  >
                    <User size={18} />
                    <span>Account</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-venue-border z-50">
                      {user?.userType === "venue_owner" && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-venue-text-primary hover:bg-venue-muted-bg transition-colors-smooth"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-venue-text-primary hover:bg-venue-muted-bg transition-colors-smooth flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="text-venue-text-primary hover:text-venue-secondary-accent px-4 py-2 rounded-md text-sm font-medium transition-all-smooth hover-lift"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary px-4 py-2 rounded-md text-sm font-medium hover-lift hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-venue-text-primary hover:text-venue-secondary-accent p-2 transition-all-smooth hover:scale-110"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-venue-border animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all-smooth hover-lift animate-fade-in nav-item-${index + 1} ${
                  isActive(item.path)
                    ? "text-venue-primary-accent bg-venue-secondary-bg"
                    : "text-venue-text-primary hover:text-venue-secondary-accent hover:bg-venue-secondary-bg/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-venue-border space-y-2">
              {isAuthenticated() ? (
                <>
                  <div className="px-3 py-2 text-venue-text-primary font-medium">
                    Hi, {user?.name || "User"}
                  </div>
                  {user?.userType === "venue_owner" && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-venue-text-primary hover:text-venue-secondary-accent font-medium transition-all-smooth hover-lift"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-venue-text-primary hover:text-venue-secondary-accent font-medium transition-all-smooth hover-lift"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-venue-text-primary hover:text-venue-secondary-accent font-medium transition-all-smooth hover-lift"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary block px-3 py-2 rounded-md font-medium text-center hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
  );
};

export default Navigation;
