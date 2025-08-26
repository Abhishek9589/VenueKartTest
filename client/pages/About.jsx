import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import {
  Users,
  Shield,
  Award,
  Heart,
  MapPin,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Text Over Image */}
      <section className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=800&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content Over Image */}
        <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-poppins">
              Our Story & Mission
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              VenueKart was born from a simple idea: finding and booking a great venue should be as easy as booking a flight. We partner with verified hosts to bring transparent pricing, real availability, and trusted reviews to event planners everywhere.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">12k+</div>
                <div className="text-white/80 text-sm">Verified Venues</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">1.2M</div>
                <div className="text-white/80 text-sm">Guests Served</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
                <div className="text-white/80 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built VenueKart Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-venue-dark mb-6">
            Why We Built VenueKart
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-4xl">
            Planners were juggling calls, emails, and guesswork to lock in a space. Hosts were struggling with no-shows and mismatched expectations. We created a platform that brings both sides together with clarity: verified listings, upfront pricing, and a seamless booking flow.
          </p>
        </div>
      </section>

      {/* Mission and Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Our Mission */}
            <div>
              <h3 className="text-2xl font-bold text-venue-dark mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                Make event planning simpler by giving everyone the same truth: accurate info, transparent pricing, and fast bookings.
              </p>
            </div>
            
            {/* Our Values */}
            <div>
              <h3 className="text-2xl font-bold text-venue-dark mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Trust, transparency, and hospitality. We verify venues, protect payments, and celebrate memorable gatherings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              Why Choose VenueKart?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best venue booking experience through our core values
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Trusted Platform</h3>
                    <p className="text-gray-600">All our venues are verified and quality-checked to ensure the best experience for your events.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">No hidden charges. What you see is what you pay. Complete transparency in all our dealings.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">24/7 Support</h3>
                    <p className="text-gray-600">Our dedicated support team is available round the clock to assist you with any queries.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-venue-lavender rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-venue-indigo" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-venue-dark mb-2">Quality Assurance</h3>
                    <p className="text-gray-600">We maintain high standards and continuously monitor venue quality to exceed expectations.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
              VenueKart by the Numbers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform has helped thousands of customers find their perfect venues
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">10,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">12,000+</div>
              <div className="text-gray-600">Verified Venues</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">100+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-venue-lavender rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-venue-indigo" />
              </div>
              <div className="text-3xl font-bold text-venue-dark mb-2">5+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
