import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-venue-primary-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F317fd6eb2bf64600868e324db448b428%2F64862cb0fd1849b4871cf34916b603a2?format=webp&width=800"
                alt="VenueKart Logo"
                className="w-8 h-8 rounded-lg transition-transform-smooth group-hover:scale-110 group-hover:rotate-6"
              />
              <span className="text-2xl font-bold text-white transition-colors-smooth group-hover:text-venue-secondary-accent">
                VenueKart
              </span>
            </Link>
            <p className="text-white/90 mb-4 max-w-md">
              Discover and book the perfect venue for your special events. From
              intimate gatherings to grand celebrations, find verified venues
              with transparent pricing.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-white/80 hover:text-white transition-all-smooth hover:scale-125 hover:-translate-y-1"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-all-smooth hover:scale-125 hover:-translate-y-1"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-all-smooth hover:scale-125 hover:-translate-y-1"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/90 hover:text-white transition-all-smooth hover:translate-x-2"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/venues"
                  className="text-white/90 hover:text-white transition-all-smooth hover:translate-x-2"
                >
                  Venues
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/90 hover:text-white transition-all-smooth hover:translate-x-2"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/90 hover:text-white transition-all-smooth hover:translate-x-2"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 group">
                <Mail
                  size={16}
                  className="text-white/80 transition-transform-smooth group-hover:scale-125"
                />
                <span className="text-white/90">info@venuekart.com</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <Phone
                  size={16}
                  className="text-white/80 transition-transform-smooth group-hover:scale-125"
                />
                <span className="text-white/90">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2 group">
                <MapPin
                  size={16}
                  className="text-white/80 transition-transform-smooth group-hover:scale-125"
                />
                <span className="text-white/90">Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/90 transition-colors-smooth hover:text-white">
            © 2025 VenueKart. All rights reserved. | Built with ❤️ by the
            VenueKart Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
