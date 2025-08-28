# VenueKart Technical Documentation 📚

This document provides comprehensive technical documentation for the VenueKart web application, detailing the purpose and functionality of every file in the project.

## 📁 Project Structure Overview

```
venuekart/
├── 📁 client/                    # Frontend React application
│   ├── 📁 components/            # Reusable React components
│   │   ├── 📁 ui/               # Base UI component library
│   │   └── ...                  # Feature-specific components
│   ├── 📁 pages/                # Route/page components
│   ├── 📁 contexts/             # React Context providers
│   ├── 📁 hooks/                # Custom React hooks
│   ├── 📁 services/             # API service layers
│   ├── 📁 lib/                  # Utility functions
│   ├── 📁 constants/            # Application constants
│   ├── App.jsx                  # Main application component
│   └── global.css               # Global styles and theme
├── 📁 server/                   # Backend Express application
│   ├── 📁 config/               # Configuration files
│   ├── 📁 routes/               # API route handlers
│   ├── 📁 middleware/           # Express middleware
│   ├── 📁 services/             # Business logic services
│   ├── 📁 utils/                # Server utility functions
│   └── index.js                 # Main server entry point
├── 📁 public/                   # Static assets
├── 📄 Configuration Files       # Build tools, dependencies, etc.
└── 📄 Documentation Files       # README, docs, etc.
```

---

## 🎯 Frontend Components (`client/`)

### 📄 Main Application Files

#### `client/App.jsx`
**Purpose**: Main application component with routing configuration
- Sets up React Router with all application routes
- Provides global context providers (Auth, Query Client)
- Includes error boundary for graceful error handling
- Configures toast notifications and tooltips
- Defines layout wrappers for different route types

**Key Features**:
- SPA routing with React Router 6
- Authentication-aware routing
- Global state management setup
- Error boundary integration

#### `client/global.css`
**Purpose**: Global styles, theme configuration, and TailwindCSS imports
- Imports Google Fonts (Poppins, Inter)
- Defines CSS custom properties for theming
- Includes TailwindCSS base, components, and utilities
- Sets up light and dark theme variables
- Provides brand color definitions for VenueKart

**Theme Variables**:
- Primary colors (venue-indigo, venue-purple, venue-lavender)
- Semantic color tokens (background, foreground, etc.)
- Dark mode support
- Custom radius and spacing values

### 📁 Pages (`client/pages/`)

#### `client/pages/Index.jsx`
**Purpose**: Homepage with hero section, features, and venue showcase
- Hero section with search functionality
- "Why Choose VenueKart" feature highlights
- Popular venues carousel display
- "How It Works" process explanation
- Responsive design with animations

**Key Components**:
- Search form with location and venue type filters
- Feature cards with icons and descriptions
- Venue cards with image, details, and pricing
- Step-by-step process guide

#### `client/pages/Venues.jsx`
**Purpose**: Venue listing page with search and filtering
- Advanced search and filtering interface
- Paginated venue results display
- Sort options (price, rating, capacity)
- Responsive grid layout
- Loading states and error handling

#### `client/pages/VenueDetail.jsx`
**Purpose**: Individual venue details and inquiry form
- Comprehensive venue information display
- Image gallery with navigation
- Amenities and facility listings
- Inquiry form with date selection
- Reviews and rating display (if implemented)

#### `client/pages/AdminDashboard.jsx`
**Purpose**: Comprehensive admin panel for venue owners
- Dashboard overview with statistics
- Venue management (CRUD operations)
- Booking management with status updates
- Real-time notification system
- Profile and settings management

**Key Features**:
- Revenue and booking analytics
- Inquiry notification bell with count
- Status filtering for bookings
- Optimistic UI updates
- Auto-refresh functionality

#### `client/pages/UserDashboard.jsx`
**Purpose**: Customer dashboard for booking history and profile
- Booking history with status tracking
- Profile management interface
- Notification center
- Favorites management integration
- Auto-refresh for real-time updates

#### `client/pages/SignIn.jsx`
**Purpose**: User authentication page
- Email/password login form
- Google OAuth integration
- Session expiration handling
- Form validation and error display
- Responsive design with animations

#### `client/pages/SignUp.jsx`
**Purpose**: User registration page
- Multi-step registration process
- Email verification workflow
- User type selection (customer/venue owner)
- Form validation and error handling

#### `client/pages/VerifyOTP.jsx`
**Purpose**: Email verification interface
- OTP input and validation
- Resend OTP functionality
- Success/error state handling
- Auto-navigation on success

#### `client/pages/About.jsx`
**Purpose**: Company information and mission statement
- Company background and story
- Team information
- Mission and values
- Contact information

#### `client/pages/Contact.jsx`
**Purpose**: Contact form and support information
- Contact form with validation
- Support information
- Office locations and hours
- Social media links

#### `client/pages/Favorites.jsx`
**Purpose**: User's saved/favorite venues
- Favorited venue grid display
- Remove from favorites functionality
- Empty state handling
- Integration with venue cards

#### `client/pages/AddVenue.jsx`
**Purpose**: Venue creation form for owners
- Multi-step venue creation wizard
- Image upload with preview
- Amenity selection interface
- Form validation and submission

#### `client/pages/AccountSettings.jsx`
**Purpose**: User profile and account management
- Profile information editing
- Password change functionality
- Email update with verification
- Account preferences

#### `client/pages/NotFound.jsx`
**Purpose**: 404 error page
- Custom 404 design
- Navigation suggestions
- Search functionality
- Return to home option

### 📁 Components (`client/components/`)

#### Core Components

##### `client/components/Navigation.jsx`
**Purpose**: Main site navigation header
- Responsive navigation menu
- User authentication state display
- Mobile hamburger menu
- Logo and branding
- Active link highlighting

**Features**:
- Conditional rendering based on auth state
- Mobile-responsive design
- Smooth transitions and animations
- User avatar and dropdown menu

##### `client/components/Footer.jsx`
**Purpose**: Site footer with links and information
- Company information and logo
- Quick navigation links
- Social media icons
- Copyright and legal information
- Responsive column layout

##### `client/components/AddVenueForm.jsx`
**Purpose**: Reusable venue creation/editing form
- Multi-step form wizard
- Image upload with drag-and-drop
- Amenity selection checkboxes
- Form validation with error display
- Progress indicator

##### `client/components/EditVenueForm.jsx`
**Purpose**: Venue editing form component
- Pre-populated form fields
- Image management (add/remove)
- Update submission handling
- Form validation and error states

##### `client/components/TokenExpiredNotice.jsx`
**Purpose**: Session expiration notification component
- Auto-redirect countdown
- Manual refresh and sign-in options
- User-friendly messaging
- Modal overlay design

#### Form Components

##### `client/components/ui/input.jsx`
**Purpose**: Styled input component
- Consistent styling across forms
- Focus states and validation
- Error state styling
- Forward ref support for form libraries

##### `client/components/ui/button.jsx`
**Purpose**: Reusable button component with variants
- Multiple size and style variants
- Loading states with spinners
- Icon support
- Accessibility features (ARIA labels)

##### `client/components/ui/label.jsx`
**Purpose**: Form label component
- Associated with form inputs
- Consistent typography
- Accessibility compliance

##### `client/components/ui/textarea.jsx`
**Purpose**: Multi-line text input component
- Resizable textarea
- Character count support
- Validation states
- Consistent styling

#### Display Components

##### `client/components/ui/card.jsx`
**Purpose**: Flexible card container component
- Header, content, and footer sections
- Hover effects and shadows
- Responsive design
- Multiple variants (elevated, outlined)

##### `client/components/ui/badge.jsx`
**Purpose**: Small status and category indicators
- Color variants for different states
- Size variations
- Icon support
- Semantic meaning (success, warning, error)

##### `client/components/ui/avatar.jsx`
**Purpose**: User profile image component
- Fallback to initials
- Multiple sizes
- Image loading states
- Accessibility support

#### Interactive Components

##### `client/components/ui/dialog.jsx`
**Purpose**: Modal dialog component
- Backdrop and focus management
- Accessibility (ARIA, focus trap)
- Animation transitions
- Multiple sizes and variants

##### `client/components/ui/popover.jsx`
**Purpose**: Floating content container
- Positioning and alignment
- Click outside to close
- Keyboard navigation
- Portal rendering

##### `client/components/ui/select.jsx`
**Purpose**: Dropdown selection component
- Searchable options
- Multiple selection support
- Custom option rendering
- Keyboard navigation

##### `client/components/ui/tooltip.jsx`
**Purpose**: Informational hover tooltips
- Positioning and arrows
- Delay and duration settings
- Accessibility compliance
- Portal rendering

#### Feedback Components

##### `client/components/ui/alert.jsx`
**Purpose**: Alert and notification messages
- Multiple variants (info, success, warning, error)
- Icon integration
- Dismissible alerts
- Accessibility features

##### `client/components/ui/notification.jsx`
**Purpose**: Toast notification system
- Queue management
- Auto-dismiss functionality
- Multiple types and positions
- Animation transitions

##### `client/components/ui/toaster.jsx`
**Purpose**: Toast notification container
- Global notification display
- Position management
- Animation orchestration
- Z-index stacking

#### Utility Components

##### `client/components/ui/error-boundary.jsx`
**Purpose**: React error boundary for graceful error handling
- Error catching and display
- Fallback UI for crashes
- Development error details
- User-friendly error messages

##### `client/components/ui/floating-message.jsx`
**Purpose**: Floating message component for notifications
- Position management
- Auto-hide functionality
- Animation support
- Multiple message types

### 📁 Contexts (`client/contexts/`)

#### `client/contexts/AuthContext.jsx`
**Purpose**: Global authentication state management
- User authentication state
- Login/logout functionality
- Token management
- OAuth integration
- User session persistence

**Provided Methods**:
- `login()` - User authentication
- `logout()` - Session termination
- `register()` - User registration
- `verifyOTP()` - Email verification
- `loginWithGoogle()` - OAuth authentication

### 📁 Hooks (`client/hooks/`)

#### `client/hooks/useFavorites.js`
**Purpose**: Custom hook for managing user favorites
- Add/remove favorites functionality
- Persistent favorites storage
- Real-time updates
- Authentication-aware operations

**Returned Values**:
- `favoriteIds` - Set of favorite venue IDs
- `addToFavorites()` - Add venue to favorites
- `removeFromFavorites()` - Remove venue from favorites
- `toggleFavorite()` - Toggle favorite status
- `isFavorite()` - Check if venue is favorited

### 📁 Services (`client/services/`)

#### `client/services/authService.js`
**Purpose**: Authentication API service layer
- Login/logout API calls
- Token refresh management
- OAuth flow handling
- User session management
- Password reset functionality

#### `client/services/venueService.js`
**Purpose**: Venue-related API operations
- Venue CRUD operations
- Image upload handling
- Search and filtering
- Owner venue management
- Public venue browsing

#### `client/services/notificationService.js`
**Purpose**: Real-time notification management
- Notification polling
- Update triggers
- Count management
- Real-time alerts

### 📁 Library (`client/lib/`)

#### `client/lib/apiClient.js`
**Purpose**: Centralized API client with automatic token refresh
- HTTP request wrapper
- Automatic token refresh
- Request queuing during refresh
- Error handling and retry logic
- Token management

#### `client/lib/utils.js`
**Purpose**: Utility functions for common operations
- `cn()` - Class name merging utility
- String manipulation helpers
- Date formatting functions
- Validation utilities

#### `client/lib/navigation.js`
**Purpose**: Navigation utility functions
- Smooth scrolling helpers
- Route navigation utilities
- URL parameter handling
- Page transition effects

### 📁 Constants (`client/constants/`)

#### `client/constants/venueOptions.js`
**Purpose**: Application constants and configuration
- Venue type definitions
- Amenity lists
- Capacity ranges
- Price ranges
- Filter options

---

## ⚙️ Backend Components (`server/`)

### 📄 Main Server Files

#### `server/index.js`
**Purpose**: Main server application entry point
- Express app configuration
- Route registration
- Middleware setup
- Database initialization
- Server startup logic

#### `server/dev-server.js`
**Purpose**: Development server with hot reloading
- Vite integration for development
- Hot reload configuration
- Development middleware
- Proxy setup for client requests

#### `server/node-build.js`
**Purpose**: Production server build configuration
- Production optimizations
- Static file serving
- Environment-specific settings
- Build output handling

### 📁 Configuration (`server/config/`)

#### `server/config/database.js`
**Purpose**: Database connection and schema management
- MySQL connection pool setup
- Database table creation
- Schema initialization
- Connection management
- Environment-based configuration

**Database Tables**:
- `users` - User accounts and authentication
- `venues` - Venue information and metadata
- `bookings` - Booking records and inquiries
- `venue_images` - Venue photo gallery
- `venue_facilities` - Venue amenities
- `favorites` - User favorite venues
- `refresh_tokens` - JWT token management
- `otp_verifications` - Email verification codes

### 📁 Routes (`server/routes/`)

#### `server/routes/auth.js`
**Purpose**: Authentication and user management endpoints
- User registration and login
- JWT token generation and refresh
- OAuth integration (Google)
- Email verification
- Password reset functionality

**Endpoints**:
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /refresh` - Token refresh
- `GET /me` - Current user info
- `POST /verify-otp` - Email verification
- `GET /google` - OAuth login

#### `server/routes/venues.js`
**Purpose**: Venue management and discovery endpoints
- Public venue browsing
- Venue CRUD operations
- Search and filtering
- Owner venue management
- Image and facility management

**Endpoints**:
- `GET /` - List all venues
- `GET /:id` - Venue details
- `POST /` - Create venue
- `PUT /:id` - Update venue
- `DELETE /:id` - Delete venue
- `GET /owner/my-venues` - Owner's venues

#### `server/routes/bookings.js`
**Purpose**: Booking and inquiry management endpoints
- Venue inquiry submission
- Booking status management
- Owner booking dashboard
- Customer booking history
- Real-time notifications

**Endpoints**:
- `POST /inquiry` - Submit inquiry
- `GET /owner` - Owner bookings
- `GET /customer` - Customer bookings
- `PUT /:id/status` - Update booking status
- `GET /owner/inquiry-count` - Notification count

#### `server/routes/favorites.js`
**Purpose**: User favorites management endpoints
- Add/remove favorites
- Favorites listing
- Batch operations
- User-specific favorites

#### `server/routes/upload.js`
**Purpose**: File upload handling endpoints
- Image upload to Cloudinary
- File validation and processing
- Multi-file upload support
- Error handling

#### `server/routes/demo.js`
**Purpose**: Demo and testing endpoints
- API health checks
- Development utilities
- Testing endpoints
- Debug information

### 📁 Middleware (`server/middleware/`)

#### `server/middleware/auth.js`
**Purpose**: Authentication middleware for protected routes
- JWT token validation
- User authorization
- Role-based access control
- Token refresh handling

**Middleware Functions**:
- `authenticateToken()` - Verify JWT tokens
- `requireVenueOwner()` - Venue owner access only

### 📁 Services (`server/services/`)

#### `server/services/emailService.js`
**Purpose**: Email sending and template management
- SMTP configuration
- Email templates
- Notification emails
- OTP delivery
- Booking confirmations

#### `server/services/cloudinaryService.js`
**Purpose**: Image upload and management service
- Cloudinary integration
- Image processing
- File upload handling
- Image optimization
- CDN management

### 📁 Utils (`server/utils/`)

#### `server/utils/jwt.js`
**Purpose**: JWT token utilities
- Token generation
- Token validation
- Refresh token management
- Expiration handling

**Functions**:
- `generateAccessToken()` - Create access tokens
- `generateRefreshToken()` - Create refresh tokens
- `verifyAccessToken()` - Validate access tokens
- `verifyRefreshToken()` - Validate refresh tokens

---

## 🔧 Configuration Files

### `package.json`
**Purpose**: Project metadata and dependency management
- Project description and version
- NPM script definitions
- Dependency declarations
- Build configuration

### `vite.config.js`
**Purpose**: Vite build tool configuration
- Development server settings
- Build optimizations
- Plugin configuration
- Path aliases

### `vite.config.server.js`
**Purpose**: Server-specific Vite configuration
- Server build settings
- SSR configuration
- Backend-specific optimizations

### `tailwind.config.js`
**Purpose**: TailwindCSS configuration
- Custom color palette
- Font family definitions
- Responsive breakpoints
- Plugin configuration
- Custom utility classes

### `postcss.config.js`
**Purpose**: PostCSS configuration
- TailwindCSS integration
- Autoprefixer setup
- CSS processing pipeline

### `netlify.toml`
**Purpose**: Netlify deployment configuration
- Build commands
- Redirect rules
- Environment variables
- Deploy settings

---

## 📄 Static Assets (`public/`)

### `public/favicon.ico`
**Purpose**: Website favicon
- Browser tab icon
- Bookmark icon
- PWA icon

### `public/placeholder.svg`
**Purpose**: Placeholder image for missing venue photos
- Fallback image display
- Consistent image sizing
- Loading state placeholder

### `public/robots.txt`
**Purpose**: Search engine crawler instructions
- SEO optimization
- Crawling rules
- Sitemap location

---

## 🔄 Data Flow Architecture

### Authentication Flow
1. **Registration**: User submits registration form
2. **Verification**: OTP sent and verified
3. **Login**: JWT tokens generated and stored
4. **API Calls**: Tokens attached to requests
5. **Refresh**: Automatic token renewal
6. **Logout**: Token cleanup and invalidation

### Booking Flow
1. **Inquiry**: Customer submits venue inquiry
2. **Notification**: Owner receives real-time alert
3. **Decision**: Owner accepts or declines
4. **Update**: Customer notified of status change
5. **History**: Complete timeline maintained

### State Management
- **Client State**: React Context for authentication
- **Server State**: React Query for API data
- **Local State**: Component state for UI
- **Persistent State**: localStorage for tokens

---

## 🎯 Key Technical Decisions

### Frontend Architecture
- **React 18**: Modern React features and performance
- **SPA Routing**: Client-side navigation for better UX
- **Context API**: Global state management
- **Custom Hooks**: Reusable stateful logic
- **Component Library**: Consistent UI components

### Backend Architecture
- **Express.js**: Lightweight and flexible server
- **JWT Authentication**: Stateless token-based auth
- **MySQL**: Relational data with ACID compliance
- **Cloudinary**: Scalable image management
- **Email Service**: Reliable notification delivery

### Development Experience
- **Vite**: Fast development and build tool
- **Hot Reload**: Instant feedback during development
- **TypeScript**: Type safety and better DX
- **Prettier/ESLint**: Code quality and consistency
- **Concurrent Development**: Client and server together

This documentation provides a comprehensive overview of every component in the VenueKart application. Each file serves a specific purpose in creating a robust, scalable venue booking platform.
