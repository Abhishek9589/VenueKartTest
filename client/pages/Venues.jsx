import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { scrollToTop } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { PUNE_AREAS, VENUE_TYPES } from '@/constants/venueOptions';
import {
  MapPin,
  Users,
  Filter,
  X,
  SlidersHorizontal,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// API service functions
const apiCall = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};

export default function Venues() {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [venueTypes, setVenueTypes] = useState(VENUE_TYPES);
  const [locations, setLocations] = useState(PUNE_AREAS);
  const [currentPage, setCurrentPage] = useState(1);
  const [venuesPerPage] = useState(20);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isLoggedIn } = useAuth();

  const handleFavoriteClick = async (venueId) => {
    if (!isLoggedIn) {
      alert('Please sign in to add venues to your favorites');
      return;
    }
    await toggleFavorite(venueId);
  };

  // Filter states
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [capacityRange, setCapacityRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load venues from API
  useEffect(() => {
    loadVenues();
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const location = searchParams.get('location');
    const venue = searchParams.get('venue');

    if (location) {
      setSelectedLocation(location);
    }
    if (venue) {
      setSearchQuery(venue);
    }
  }, [searchParams]);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/venues?limit=50');

      // Format API venues data
      const apiVenues = data.map(venue => ({
        id: venue.id,
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        price: parseFloat(venue.price_per_day || venue.price),
        reviews: venue.total_bookings || 0,
        image: venue.images && venue.images.length > 0 ? venue.images[0] : "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
        facilities: venue.facilities || [],
        type: venue.type || "Venue",
        description: venue.description || "Beautiful venue perfect for your special events."
      }));

      setVenues(apiVenues);

      // Set price and capacity ranges based on actual data
      const prices = apiVenues.map(v => v.price);
      const capacities = apiVenues.map(v => v.capacity);

      if (prices.length > 0) {
        const maxPrice = Math.max(...prices);
        setPriceRange([0, Math.ceil(maxPrice / 1000) * 1000]);
      }

      if (capacities.length > 0) {
        const maxCapacity = Math.max(...capacities);
        setCapacityRange([0, Math.ceil(maxCapacity / 100) * 100]);
      }

    } catch (error) {
      console.error('Error loading venues:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = venues;

    // Show favorites only filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(venue => isFavorite(venue.id));
    }

    if (selectedType && selectedType.trim() !== "") {
      filtered = filtered.filter(venue => venue.type === selectedType);
    }

    if (selectedLocation && selectedLocation.trim() !== "") {
      filtered = filtered.filter(venue => venue.location === selectedLocation);
    }

    if (searchQuery) {
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(venue =>
      venue.price >= priceRange[0] && venue.price <= priceRange[1] &&
      venue.capacity >= capacityRange[0] && venue.capacity <= capacityRange[1]
    );

    setFilteredVenues(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedType, selectedLocation, searchQuery, priceRange, capacityRange, showFavoritesOnly, isFavorite]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredVenues.length / venuesPerPage);
  const startIndex = (currentPage - 1) * venuesPerPage;
  const endIndex = startIndex + venuesPerPage;
  const currentVenues = filteredVenues.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedType("");
    setSelectedLocation("");
    setPriceRange([0, 100000]);
    setCapacityRange([0, 1000]);
    setSearchQuery("");
    setShowFavoritesOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-venue-dark mb-4">
            Find Your Perfect Venue
          </h1>
          <p className="text-gray-600 mb-6">
            {loading ? 'Loading venues...' : `Discover ${filteredVenues.length} amazing venues for your special occasions`}
          </p>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-72 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-venue-dark flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h2>
                  <Button
                    variant={showFavoritesOnly ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={showFavoritesOnly ? "bg-venue-indigo text-white" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    Favorites
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <Input
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>


              {/* Venue Type */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Venue Type</label>
                <AutocompleteInput
                  options={venueTypes}
                  value={selectedType}
                  onChange={setSelectedType}
                  placeholder="Type to search..."
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Location</label>
                <AutocompleteInput
                  options={locations}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Type to search..."
                  className="w-full"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000}
                  step={5000}
                  className="w-full"
                />
              </div>

              {/* Capacity Range */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Capacity: {capacityRange[0]} - {capacityRange[1]} guests
                </label>
                <Slider
                  value={capacityRange}
                  onValueChange={setCapacityRange}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Clear All Button at Bottom */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Venue Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="h-56 bg-gray-200"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredVenues.length === 0 && venues.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues available</h3>
                <p className="text-gray-500 mb-4">Check back later for new venue listings</p>
              </Card>
            ) : filteredVenues.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No venues found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <>
                {/* Results Summary */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredVenues.length)} of {filteredVenues.length} venues
                  </p>
                  {totalPages > 1 && (
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                  )}
                </div>

                {/* Venue Grid - Max 4 cards per row with wider cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr mb-8">
                  {currentVenues.map((venue) => (
                    <Card key={venue.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full w-full">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFavoriteClick(venue.id);
                            }}
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                isFavorite(venue.id)
                                  ? 'text-red-500 fill-red-500'
                                  : 'text-gray-600 hover:text-red-500'
                              }`}
                            />
                          </Button>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-venue-indigo text-white">
                            {venue.type}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-semibold text-venue-dark mb-2 group-hover:text-venue-indigo transition-colors line-clamp-1">
                          {venue.name}
                        </h3>

                        <div className="flex items-center text-gray-600 mb-3">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{venue.location}</span>
                        </div>

                        <div className="flex items-center text-gray-600 mb-4">
                          <Users className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">Up to {venue.capacity} guests</span>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="text-center">
                            <span className="text-xl font-bold text-venue-indigo">
                              ₹{venue.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm ml-1">/day</span>
                          </div>
                          <Button
                            asChild
                            className="w-full bg-venue-indigo hover:bg-venue-purple text-white"
                            onClick={scrollToTop}
                          >
                            <Link to={`/venue/${venue.id}`}>
                              Book Now
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className={currentPage === pageNumber ? "bg-venue-indigo text-white" : ""}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
