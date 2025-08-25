// Shared constants for venue types and areas used across the application

export const PUNE_AREAS = [
  'Hinjewadi', 'Wagholi', 'Kharadi', 'Wakad', 'Baner', 'Hadapsar', 'Talegaon Dabhade',
  'Pimple Saudagar', 'Kothrud', 'Undri', 'Viman Nagar', 'Bavdhan', 'Sus', 'Dhanori',
  'Kondhwa', 'Balewadi', 'Sinhagad Road', 'Wadgaon Sheri', 'Moshi', 'Kalyani Nagar',
  'Ravet', 'Kesnand', 'Ambegaon Budruk', 'Pimpri Chinchwad', 'Aundh', 'Pirangut',
  'Uruli Kanchan', 'Alandi Road', 'Chakan', 'Katraj', 'Rahatani'
];

export const VENUE_TYPES = [
  'Banquet halls',
  'Hotels & resorts', 
  'Lawns/gardens',
  'Farmhouses',
  'Restaurants & cafes',
  'Lounges & rooftops',
  'Stadiums & arenas',
  'Open grounds',
  'Auditoriums'
];

// For filters - includes "All" options
export const FILTER_AREAS = ['All Locations', ...PUNE_AREAS];
export const FILTER_VENUE_TYPES = ['All Types', ...VENUE_TYPES];
