# VenueKart Technical Documentation 📚

This document provides comprehensive technical documentation for the VenueKart venue booking platform, detailing the architecture, implementation, and functionality of every component in the system.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Upload & Image Management](#file-upload--image-management)
9. [Email System](#email-system)
10. [Venue Type System](#venue-type-system)
11. [Recent Bug Fixes](#recent-bug-fixes)
12. [Deployment & Configuration](#deployment--configuration)
13. [Development Guidelines](#development-guidelines)

---

## 📁 Project Overview

VenueKart is a full-stack venue booking platform built with React and Express.js, featuring a modern SPA frontend and a RESTful API backend with MySQL database integration. The platform supports comprehensive venue management with categorization, image galleries, booking workflows, and real-time notifications.

### Technology Stack Summary

**Frontend**: React 18, Vite, TailwindCSS, Radix UI, Framer Motion, React Router 6  
**Backend**: Node.js, Express.js, MySQL, JWT, Cloudinary, Nodemailer  
**Development**: TypeScript, Vitest, Prettier, Concurrently  
**Deployment**: Netlify (frontend), Railway/Heroku (backend), PlanetScale (database)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React SPA     │◄──►│  Express API    │◄──►│  MySQL Database │
│   (Port 8080)   │    │   (Port 5000)   ���    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  TailwindCSS    │    │   Cloudinary    │    │   Email SMTP    │
│  Radix UI       │    │   (Images)      │    │   (Nodemailer)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Request Flow
1. **Client Request**: React SPA sends authenticated requests
2. **API Processing**: Express middleware validates JWT tokens
3. **Database Operations**: MySQL queries with connection pooling
4. **External Services**: Cloudinary for images, SMTP for emails
5. **Response**: JSON data returned to client with proper error handling

---

## 🎯 Frontend Documentation

### 📄 Application Entry Point

#### `client/App.jsx`
**Purpose**: Main application component with routing and global providers

```javascript
// Key Features:
- React Router 6 configuration with protected routes
- Global context providers (Auth, Query Client)
- Error boundary integration
- Toast notification system
- Tooltip provider setup
```

**Route Structure**:
- **Public Routes**: `/`, `/venues`, `/venue/:id`, `/about`, `/contact`
- **Auth Routes**: `/signin`, `/signup`, `/verify-otp`, `/forgot-password`
- **Protected Routes**: `/dashboard`, `/favorites`, `/admin/*`
- **Catch-all**: `*` → NotFound component

#### `client/global.css`
**Purpose**: Global styles, theme system, and TailwindCSS configuration

```css
/* Key Features: */
- Google Fonts integration (Poppins, Inter)
- CSS custom properties for theming
- Light/dark mode support
- VenueKart brand colors
- Responsive design tokens
```

**VenueKart Theme Variables**:
```css
:root {
  --primary: 244 62% 32%;     /* venue-indigo #3C3B6E */
  --accent: 246 100% 69%;     /* venue-purple #6C63FF */
  --secondary: 246 100% 95%;  /* venue-lavender #E6E6FA */
  --background: 0 0% 100%;    /* white */
}
```

### 📁 Pages Directory (`client/pages/`)

#### Core Pages

##### `client/pages/Index.jsx`
**Purpose**: Homepage with hero section, features, and venue showcase

**Key Components**:
- **Hero Section**: Background image with search form
- **Search Form**: Location and venue type inputs with live search
- **Feature Cards**: Platform benefits with icons and animations
- **Popular Venues**: API-driven venue cards with favorites integration
- **How It Works**: Step-by-step process explanation

**API Integration** (Fixed):
```javascript
// Fixed data structure handling for venue loading
const loadPopularVenues = async () => {
  try {
    setLoading(true);
    const data = await apiCall('/api/venues?limit=3');
    
    // Extract venues array from API response (FIXED)
    const venues = data.venues || data;
    
    // Format venues data for display
    const formattedVenues = venues.map(venue => {
      const basePrice = parseFloat(venue.price_per_day || venue.price);
      const pricingInfo = getPricingInfo(basePrice, 'listing');
      
      return {
        id: venue.id,
        name: venue.name,
        location: venue.location,
        capacity: `Up to ${venue.capacity} guests`,
        price: pricingInfo.formattedPrice,
        image: venue.images && venue.images.length > 0 ? venue.images[0] : defaultImage,
        facilities: venue.facilities || []
      };
    });
    
    setPopularVenues(formattedVenues);
  } catch (error) {
    console.error('Error loading popular venues:', error);
    // Fallback to demo venues if API fails
    setPopularVenues(fallbackVenues);
  } finally {
    setLoading(false);
  }
};
```

##### `client/pages/Venues.jsx`
**Purpose**: Venue listing page with advanced search and filtering

**Features**:
- **Advanced Filtering**: Location, venue type, capacity, price range
- **Venue Type Integration**: Dropdown selection with database-driven options
- **Real-time Search**: URL parameter sync with instant filtering
- **Pagination**: Server-side pagination with limit/offset
- **Loading States**: Skeleton loaders and error handling
- **Badge Display**: Venue type badges on each card

**Venue Type Filtering Implementation**:
```javascript
// Load filter options from backend
const loadFilterOptions = async () => {
  try {
    setFilterOptionsLoading(true);
    const options = await venueService.getFilterOptions();
    
    setVenueTypes(options.venueTypes || []);
    setLocations(options.locations || []);
    
    // Update price and capacity ranges
    if (options.priceRange) {
      const roundedMaxPrice = Math.ceil(options.priceRange.max / 10000) * 10000;
      setMaxPrice(roundedMaxPrice);
      setPriceRange([0, roundedMaxPrice]);
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
    // Fallback to default options
    setVenueTypes(VENUE_TYPES);
    setLocations(PUNE_AREAS);
  }
};
```

##### `client/pages/VenueDetail.jsx`
**Purpose**: Individual venue details with booking functionality

**Components**:
- **Image Gallery**: Cloudinary images with navigation
- **Venue Information**: Name, location, capacity, pricing, type display
- **Facilities Display**: Amenity badges and features
- **Booking Form**: Date selection, guest count, special requirements
- **Owner Contact**: Contact information (post-acceptance)

##### `client/pages/AdminDashboard.jsx`
**Purpose**: Comprehensive dashboard for venue owners

**Dashboard Sections**:
- **Overview**: Revenue stats, booking counts, recent activity
- **Venue Management**: CRUD operations with venue type selection
- **Booking Management**: Inquiry handling with status updates
- **Notifications**: Real-time booking alerts with email integration
- **Analytics**: Revenue tracking and performance metrics

**Real-time Features**:
```javascript
// Auto-refresh booking data every 30 seconds
useEffect(() => {
  const interval = setInterval(loadBookings, 30000);
  return () => clearInterval(interval);
}, []);
```

#### Authentication Pages

##### `client/pages/SignIn.jsx`
**Purpose**: User authentication with multiple login options

**Authentication Methods**:
- **Email/Password**: Traditional login with validation
- **Google OAuth**: Social login with popup integration
- **Session Management**: Token storage and refresh handling

##### `client/pages/SignUp.jsx`
**Purpose**: User registration with email verification

**Registration Flow**:
1. User type selection (customer/venue-owner)
2. Form submission with validation
3. Email verification via OTP
4. Account activation and token issuance

##### `client/pages/VerifyOTP.jsx`
**Purpose**: Email verification interface

**Features**:
- 6-digit OTP input with auto-focus
- Resend OTP functionality with cooldown
- Auto-navigation on successful verification
- Error handling for invalid/expired codes

### 📁 Components Directory (`client/components/`)

#### Core Components

##### `client/components/Navigation.jsx`
**Purpose**: Site navigation with authentication state

**Features**:
- Responsive navigation menu
- Authentication-based menu items
- Mobile hamburger menu
- User avatar dropdown
- Active link highlighting

**Authentication Integration**:
```javascript
// Shows different menu items based on auth state
{isLoggedIn ? (
  <UserDropdown user={user} />
) : (
  <AuthLinks />
)}
```

##### `client/components/AddVenueForm.jsx`
**Purpose**: Multi-step venue creation form with venue type selection

**Form Fields**:
1. **Basic Info**: Name, description, location
2. **Venue Type**: Dropdown selection from predefined options
3. **Details**: Capacity, pricing
4. **Images**: Multiple image upload with preview
5. **Facilities**: Amenity selection with dynamic add/remove

**Venue Type Implementation**:
```javascript
// Venue type selection with autocomplete
<AutocompleteInput
  options={VENUE_TYPES}
  value={formData.venueType}
  onChange={(value) => handleInputChange('venueType', value)}
  placeholder="Type to search..."
  className="w-full"
/>
```

**Image Upload Integration**:
```javascript
// Image compression and upload to Cloudinary
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  
  for (const file of files) {
    try {
      // Compress image for faster upload
      const compressedFile = await compressImage(file, 800, 0.8);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
};
```

##### `client/components/EditVenueForm.jsx`
**Purpose**: Venue editing form with existing data pre-population

**Enhanced Features** (Recently Updated):
- **Venue Type Editing**: Ability to update venue type
- **Pre-populated Form**: Existing data including venue type
- **Image Management**: Add/remove existing images
- **Facility Updates**: Real-time facility management

**Venue Type Integration**:
```javascript
// Populate form with existing venue data including type
useEffect(() => {
  if (venue) {
    setFormData({
      venueName: venue.name || '',
      description: venue.description || '',
      venueType: venue.type || '', // Added venue type
      footfall: venue.capacity || '',
      location: venue.location || '',
      images: venue.images || [],
      facilities: venue.facilities || [''],
      price: venue.price || venue.priceMin || ''
    });
  }
}, [venue]);
```

#### UI Components (`client/components/ui/`)

##### Form Components

**`client/components/ui/autocomplete-input.jsx`**
- **Purpose**: Searchable dropdown for venue types and locations
- **Features**: Type-ahead search, keyboard navigation, custom options
- **Usage**: Venue type selection in forms

**`client/components/ui/input.jsx`**
- Styled input with focus states and validation
- Forward ref support for form libraries
- Error state styling and accessibility

**`client/components/ui/button.jsx`**
- Multiple variants (primary, secondary, ghost, destructive)
- Size variations (sm, md, lg, icon)
- Loading states with spinner integration
- Icon support and accessibility features

##### Display Components

**`client/components/ui/badge.jsx`**
- **Purpose**: Status indicators and venue type display
- **Variants**: Default, secondary, destructive, outline
- **Usage**: Venue type badges on cards

```javascript
// Venue type badge display
<Badge variant="secondary" className="bg-venue-indigo text-white">
  {venue.type}
</Badge>
```

**`client/components/ui/card.jsx`**
- Flexible container with header, content, footer
- Hover effects and elevation shadows
- Multiple variants (elevated, outlined, interactive)

### 📁 Services (`client/services/`)

#### `client/services/venueService.js`
**Purpose**: Venue-related API operations

**Enhanced CRUD Operations**:
```javascript
// Get venues with filtering including venue type
export const getVenues = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Add all filter parameters including venue type
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  const response = await fetch(`/api/venues?${params}`);
  return response.json();
};

// Get filter options from backend
export const getFilterOptions = async () => {
  const response = await fetch('/api/venues/filter-options');
  return response.json();
};

// Create venue with venue type
export const createVenue = async (venueData) => {
  const response = await apiClient.post('/api/venues', {
    ...venueData,
    venueType: venueData.venueType // Include venue type
  });
  return response.json();
};
```

### 📁 Constants (`client/constants/`)

#### `client/constants/venueOptions.js`
**Purpose**: Venue types and location options

**Venue Types**:
```javascript
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

export const PUNE_AREAS = [
  'Hinjewadi', 'Wagholi', 'Kharadi', 'Wakad', 'Baner', 'Hadapsar',
  'Talegaon Dabhade', 'Pimple Saudagar', 'Kothrud', 'Undri',
  // ... more areas
];
```

---

## ⚙️ Backend Documentation

### 📄 Server Entry Points

#### `server/index.js`
**Purpose**: Main Express application factory

```javascript
export function createServer() {
  const app = express();

  // Initialize database tables
  initializeDatabase();

  // Middleware setup
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Session and Passport setup
  app.use(session({ secret: process.env.COOKIE_SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Route mounting
  app.use("/api/auth", authRoutes);
  app.use("/api/venues", venuesRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/favorites", favoritesRoutes);

  return app;
}
```

### 📁 Configuration (`server/config/`)

#### `server/config/database.js`
**Purpose**: Database connection and schema management

**Enhanced Schema with Venue Types**:
```sql
-- Updated Venues table with type column
CREATE TABLE venues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) DEFAULT 'Venue', -- Added venue type column
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  price_per_day DECIMAL(10, 2),
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_location (location),
  INDEX idx_type (type), -- Added index for venue type
  INDEX idx_status (status)
);
```

#### `server/config/updateVenuesTable.js`
**Purpose**: Database migration for venue type column

```javascript
export async function addVenueTypeColumn() {
  try {
    console.log('Adding venue type column to venues table...');
    
    // Check if type column already exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'venues' 
      AND COLUMN_NAME = 'type'
    `);
    
    if (columns.length === 0) {
      // Add the type column
      await pool.execute(`
        ALTER TABLE venues 
        ADD COLUMN type VARCHAR(100) DEFAULT 'Venue' AFTER description
      `);
      
      // Update existing venues with inferred types
      await pool.execute(`
        UPDATE venues 
        SET type = CASE 
          WHEN LOWER(name) LIKE '%banquet%' OR LOWER(description) LIKE '%banquet%' THEN 'Banquet halls'
          WHEN LOWER(name) LIKE '%hotel%' OR LOWER(name) LIKE '%resort%' THEN 'Hotels & resorts'
          WHEN LOWER(name) LIKE '%farmhouse%' THEN 'Farmhouses'
          -- ... more type inference logic
          ELSE 'Venue'
        END 
        WHERE type = 'Venue' OR type IS NULL
      `);
    }
  } catch (error) {
    console.error('Error adding venue type column:', error);
  }
}
```

### 📁 Routes (`server/routes/`)

#### `server/routes/venues.js`
**Purpose**: Enhanced venue management with type support

**Filter Options Endpoint** (New):
```javascript
// GET /api/venues/filter-options
router.get('/filter-options', async (req, res) => {
  try {
    // Get unique venue types from database
    const [venueTypes] = await pool.execute(`
      SELECT DISTINCT type
      FROM venues
      WHERE status = 'active' AND type IS NOT NULL AND type != ''
      ORDER BY type
    `);

    // Get unique locations
    const [locations] = await pool.execute(`
      SELECT DISTINCT location
      FROM venues
      WHERE status = 'active' AND location IS NOT NULL AND location != ''
      ORDER BY location
    `);

    // Get price and capacity ranges
    const [priceRange] = await pool.execute(`
      SELECT
        MIN(COALESCE(price_min, price_per_day)) as min_price,
        MAX(COALESCE(price_max, price_per_day)) as max_price
      FROM venues
      WHERE status = 'active'
    `);

    const [capacityRange] = await pool.execute(`
      SELECT
        MIN(capacity) as min_capacity,
        MAX(capacity) as max_capacity
      FROM venues
      WHERE status = 'active'
    `);

    const filterOptions = {
      venueTypes: venueTypes.map(row => row.type).filter(type => type && type.trim()),
      locations: locations.map(row => row.location).filter(location => location && location.trim()),
      priceRange: {
        min: priceRange[0]?.min_price || 0,
        max: priceRange[0]?.max_price || 500000
      },
      capacityRange: {
        min: capacityRange[0]?.min_capacity || 0,
        max: capacityRange[0]?.max_capacity || 5000
      }
    };

    res.json(filterOptions);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});
```

**Enhanced Venue Listing with Type Filtering**:
```javascript
// GET /api/venues
router.get('/', async (req, res) => {
  try {
    const { location, search, type, limit = 20, offset = 0, page = 1 } = req.query;
    
    let whereConditions = 'v.status = \'active\'';
    const params = [];

    // Location filtering
    if (location && location.trim() !== '') {
      whereConditions += ' AND LOWER(v.location) LIKE LOWER(?)';
      params.push(`%${location}%`);
    }

    // Venue type filtering (ENHANCED)
    if (type && type.trim() !== '') {
      whereConditions += ' AND LOWER(v.type) LIKE LOWER(?)';
      params.push(`%${type}%`);
    }

    // Search filtering
    if (search && search.trim() !== '') {
      whereConditions += ' AND (LOWER(v.name) LIKE LOWER(?) OR LOWER(v.description) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Execute query with pagination
    const dataQuery = `
      SELECT v.*, u.name as owner_name, u.mobile_number as owner_phone,
             GROUP_CONCAT(DISTINCT vi.image_url) as images,
             GROUP_CONCAT(DISTINCT vf.facility_name) as facilities
      FROM venues v
      LEFT JOIN users u ON v.owner_id = u.id
      LEFT JOIN venue_images vi ON v.id = vi.venue_id
      LEFT JOIN venue_facilities vf ON v.id = vf.venue_id
      WHERE ${whereConditions}
      GROUP BY v.id
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [venues] = await pool.execute(dataQuery, [...params, limitInt, offsetInt]);

    // Format response with venue types
    const formattedVenues = venues.map(venue => ({
      ...venue,
      images: venue.images ? venue.images.split(',') : [],
      facilities: venue.facilities ? venue.facilities.split(',') : [],
      price: parseFloat(venue.price_per_day),
      type: venue.type || 'Venue' // Ensure type is included
    }));

    res.json({
      venues: formattedVenues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limitInt),
        totalCount,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ error: 'Failed to fetch venues' });
  }
});
```

**Enhanced Venue Creation with Type Support**:
```javascript
// POST /api/venues
router.post('/', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { venueName, description, location, footfall, price, priceMin, priceMax, images, facilities, venueType } = req.body;

    // Venue type handling (ENHANCED)
    const venueTypeValue = venueType && venueType.trim() ? venueType : 'Venue';

    // Insert venue with type
    const [venueResult] = await connection.execute(`
      INSERT INTO venues (owner_id, name, description, type, location, capacity, price_per_day, price_min, price_max)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [ownerId, venueName, description, venueTypeValue, location, parseInt(footfall), averagePrice, finalPriceMin, finalPriceMax]);

    const venueId = venueResult.insertId;

    // Insert images and facilities...
    
    res.status(201).json({
      message: 'Venue created successfully',
      venueId: venueId
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});
```

---

## 🐛 Recent Bug Fixes

### 1. Homepage Data Loading Issue
**Problem**: `TypeError: data.map is not a function` on homepage when loading popular venues.

**Root Cause**: The `/api/venues` endpoint returns an object with structure `{ venues: [...], pagination: {...} }`, but the homepage was trying to call `.map()` directly on the response object.

**Solution**:
```javascript
// Before (Broken)
const data = await apiCall('/api/venues?limit=3');
const formattedVenues = data.map(venue => { ... });

// After (Fixed)
const data = await apiCall('/api/venues?limit=3');
const venues = data.venues || data; // Extract venues array
const formattedVenues = venues.map(venue => { ... });
```

**Files Modified**: `client/pages/Index.jsx`

### 2. Venue Type System Implementation
**Problem**: Venue types were not being saved to database, and filtering by venue type wasn't working.

**Root Cause**: 
- Backend wasn't extracting `venueType` from request body
- Database INSERT query didn't include the `type` column
- Frontend forms weren't passing venue type to backend

**Solution**:
- **Backend**: Added `venueType` extraction and `type` column to INSERT/UPDATE queries
- **Database**: Added migration script to add `type` column and infer types for existing venues
- **Frontend**: Enhanced AddVenueForm and EditVenueForm with venue type selection

**Files Modified**:
- `server/routes/venues.js`
- `server/config/updateVenuesTable.js`
- `client/components/AddVenueForm.jsx`
- `client/components/EditVenueForm.jsx`

### 3. Venue Type Badge Display
**Problem**: Venue cards showed generic "Venue" text instead of actual venue types.

**Root Cause**: Venue type data wasn't being saved properly, so badges defaulted to "Venue".

**Solution**: Fixed venue type saving in backend, now badges display actual types like "Banquet halls", "Farmhouses", etc.

**Files Modified**: Badge display works correctly after backend venue type fixes.

### 4. Filter Options Loading
**Problem**: Venue type and location filters showed static options instead of database-driven ones.

**Solution**: Added `/api/venues/filter-options` endpoint that returns actual venue types and locations from the database.

**Files Modified**:
- `server/routes/venues.js` (added filter-options endpoint)
- `client/pages/Venues.jsx` (load dynamic filter options)

---

## 🎨 Design System

### VenueKart Brand Identity
```css
/* Primary Brand Colors */
:root {
  --venue-indigo: #3C3B6E;    /* Primary brand color */
  --venue-purple: #6C63FF;    /* Secondary/accent color */
  --venue-lavender: #E6E6FA;  /* Light background color */
  --venue-dark: #1F1F2E;      /* Dark text/background */
}

/* Usage in Components */
.venue-card {
  @apply bg-white border border-gray-200 hover:border-venue-indigo;
}

.venue-type-badge {
  @apply bg-venue-indigo text-white px-3 py-1 rounded-full text-sm;
}
```

### Component Styling Patterns
- **Cards**: White background with subtle borders and hover effects
- **Buttons**: Primary (venue-indigo), Secondary (venue-purple), Ghost (transparent)
- **Badges**: Type-specific colors for venue categories
- **Forms**: Clean inputs with venue-indigo focus states

---

## 📊 Database Schema

### Enhanced Entity Relationship Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │   Venues    │    │  Bookings   ���
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │◄──┤ owner_id(FK)│◄──┤ venue_id(FK)│
│ email       │    │ name        │    │customer_id  │
│ name        │    │ description │    │ event_date  │
│ user_type   │    │ type        │    │ status      │
│ is_verified │    │ location    │    │ amount      │
└─────────────┘    │ capacity    │    └─────────────┘
       │           │ price       │           │
       │           │ status      │           │
       │           └─────────────┘           │
       │                  │                 │
       │           ┌─────────────┐           │
       │           │VenueImages  │           │
       │           ├─────────────┤           │
       │           │ venue_id(FK)│           │
       │           │ image_url   │           │
       │           │ is_primary  │           │
       │           └─────────────┘           │
       │                                     │
       │           ┌─────────────┐           │
       └──────────►│ Favorites   │◄──────────┘
                   ├─────────────┤
                   │ user_id(FK) │
                   │venue_id(FK) │
                   └─────────────┘
```

### Key Database Indexes

```sql
-- Enhanced indexing for venue types
CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_location_type ON venues(location, type);
CREATE INDEX idx_venues_status_type ON venues(status, type);

-- Performance indexes for filtering
CREATE INDEX idx_venues_price_capacity ON venues(price_per_day, capacity);
CREATE INDEX idx_venues_created_type ON venues(created_at, type);
```

---

## 🔄 API Documentation

### Enhanced Venue Endpoints

#### GET `/api/venues/filter-options`
Get available filter options from database.

**Response**:
```json
{
  "venueTypes": [
    "Banquet halls",
    "Hotels & resorts",
    "Farmhouses",
    "Lawns/gardens"
  ],
  "locations": [
    "Hinjewadi",
    "Kharadi",
    "Wagholi"
  ],
  "priceRange": {
    "min": 15000,
    "max": 150000
  },
  "capacityRange": {
    "min": 50,
    "max": 1000
  }
}
```

#### GET `/api/venues`
Get paginated venues with enhanced filtering.

**Query Parameters**:
- `type` (string): Filter by venue type
- `location` (string): Filter by location
- `search` (string): Search in name and description
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)

**Response**:
```json
{
  "venues": [
    {
      "id": 1,
      "name": "Grand Ballroom",
      "description": "Elegant venue for weddings",
      "type": "Banquet halls",
      "location": "Mumbai, Maharashtra", 
      "capacity": 200,
      "price_per_day": 50000,
      "images": ["https://cloudinary.com/..."],
      "facilities": ["AC", "Parking", "Catering"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 87,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### POST `/api/venues`
Create venue with type support.

**Request Body**:
```json
{
  "venueName": "Royal Garden",
  "description": "Beautiful outdoor venue",
  "venueType": "Lawns/gardens",
  "location": "Pune, Maharashtra",
  "footfall": 300,
  "price": 75000,
  "images": ["data:image/jpeg;base64,..."],
  "facilities": ["Garden Area", "Parking", "Catering"]
}
```

---

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**: All required variables set
2. **Database**: MySQL with proper indexes
3. **Cloudinary**: Image upload service configured
4. **Email**: SMTP service for notifications
5. **Domain**: SSL certificate configured
6. **Monitoring**: Error tracking and logs

### Performance Optimizations

1. **Database Query Optimization**:
   - Proper indexing on frequently queried columns
   - Query result caching for filter options
   - Connection pooling for database connections

2. **Frontend Optimizations**:
   - Image compression before Cloudinary upload
   - Lazy loading for venue images
   - Pagination for large datasets
   - Skeleton loaders for better UX

3. **API Response Optimization**:
   - Proper error handling and status codes
   - Response compression
   - Request validation and sanitization

---

## 🔧 Development Guidelines

### Code Quality Standards

1. **TypeScript Usage**: Gradual adoption for type safety
2. **Error Handling**: Comprehensive try-catch blocks
3. **Validation**: Input validation on both frontend and backend
4. **Testing**: Unit tests for critical functionality
5. **Documentation**: Inline comments for complex logic

### Adding New Features

#### Adding a New Venue Type

1. **Update Constants**:
```javascript
// client/constants/venueOptions.js
export const VENUE_TYPES = [
  'Banquet halls',
  'Hotels & resorts',
  // ... existing types
  'Your New Type' // Add here
];
```

2. **Database Migration** (if needed):
```sql
-- Update existing venues if categorization rules change
UPDATE venues 
SET type = 'Your New Type' 
WHERE LOWER(name) LIKE '%your-keyword%';
```

#### Adding New Form Fields

1. **Update Form State**:
```javascript
// In AddVenueForm.jsx or EditVenueForm.jsx
const [formData, setFormData] = useState({
  // ... existing fields
  newField: ''
});
```

2. **Update API Interface**:
```javascript
// In server/routes/venues.js
const { /* existing fields */, newField } = req.body;

// Add to database query
INSERT INTO venues (..., new_field) VALUES (..., ?)
```

3. **Database Schema Update**:
```sql
ALTER TABLE venues ADD COLUMN new_field VARCHAR(255);
```

### Testing Guidelines

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test API endpoints and database interactions
3. **E2E Tests**: Test complete user workflows
4. **Manual Testing**: Verify venue type functionality across all forms

---

This documentation reflects the current state of VenueKart with all recent bug fixes and enhancements, particularly the comprehensive venue type system and improved data handling throughout the application.
