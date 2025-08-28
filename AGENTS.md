# VenueKart

A comprehensive venue booking platform that simplifies event planning by connecting customers with verified venues through transparent pricing and seamless booking management.

VenueKart is a full-stack React application with an integrated Express server, featuring JWT authentication, MySQL database, Cloudinary integration, email notifications, and a modern responsive UI built with TailwindCSS and Radix UI.

## Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA) + Vite + TailwindCSS 3 + Radix UI
- **Backend**: Express.js + Node.js with MySQL database
- **Authentication**: JWT tokens with refresh token rotation
- **Database**: MySQL with connection pooling
- **Image Storage**: Cloudinary integration for venue photos
- **Email**: Nodemailer with SMTP for notifications
- **UI**: Radix UI components + TailwindCSS 3 + Lucide React icons
- **State Management**: React Context + React Query for server state
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion for smooth interactions

## Project Structure

```
client/                          # React SPA frontend
├── pages/                       # Route components
│   ├── Index.jsx               # Homepage with hero and search
│   ├── Venues.jsx              # Venue listing with filters
│   ├── VenueDetail.jsx         # Individual venue page
│   ├── AdminDashboard.jsx      # Venue owner dashboard
│   ├── UserDashboard.jsx       # Customer dashboard
│   ├── SignIn.jsx              # Authentication
│   ├── SignUp.jsx              # Registration with OTP
│   ├── VerifyOTP.jsx           # Email verification
│   └── [other pages...]        # About, Contact, FAQ, etc.
├── components/                  # Reusable React components
│   ├── ui/                     # Base UI component library
│   ├── Navigation.jsx          # Site navigation
│   ├── Footer.jsx              # Site footer
│   ├── AddVenueForm.jsx        # Venue creation form
│   ├── EditVenueForm.jsx       # Venue editing form
│   └── TokenExpiredNotice.jsx  # Session management
├── contexts/                    # React Context providers
│   └── AuthContext.jsx         # Authentication state
├── hooks/                       # Custom React hooks
│   └── useFavorites.js         # Favorites management
├── services/                    # API service layers
│   ├── authService.js          # Authentication APIs
│   ├── venueService.js         # Venue management APIs
│   └── notificationService.js  # Real-time notifications
├── lib/                        # Utility libraries
│   ├── apiClient.js            # HTTP client with auto-refresh
│   ├── utils.js                # General utilities
│   ├── navigation.js           # Navigation helpers
│   └── errorMessages.js        # Error handling
├── constants/                   # Application constants
│   └── venueOptions.js         # Venue types and options
├── App.jsx                     # Main app with routing
└── global.css                  # TailwindCSS theme and globals

server/                         # Express API backend
├── config/                     # Configuration files
│   └── database.js             # MySQL setup and schema
├── routes/                     # API route handlers
│   ├── auth.js                 # Authentication endpoints
│   ├── venues.js               # Venue CRUD operations
│   ├── bookings.js             # Booking management
│   ├── upload.js               # Cloudinary image upload
│   ├── favorites.js            # Favorites management
│   └── demo.js                 # Health check endpoints
├── middleware/                 # Express middleware
│   └── auth.js                 # JWT authentication middleware
├── services/                   # Business logic services
│   ├── emailService.js         # Email notifications
│   └── cloudinaryService.js   # Image management
├── utils/                      # Server utilities
│   └── jwt.js                  # JWT token utilities
├── index.js                    # Main server setup
├── dev-server.js               # Development server
└── node-build.js               # Production build

shared/                         # Shared utilities (future)
└── [shared types/constants]    # Cross-platform code
```

## Key Features

### For Customers
- **Smart Venue Discovery**: Search and filter venues by location, capacity, amenities, and price
- **Detailed Venue Pages**: Photo galleries, facility lists, pricing, and owner contact
- **Booking System**: Submit inquiries with event details and special requirements
- **Favorites Management**: Save and organize preferred venues
- **User Dashboard**: Track booking history and inquiry status
- **Real-time Notifications**: Email updates on booking status changes

### For Venue Owners
- **Venue Management**: Complete CRUD operations for venue listings
- **Image Gallery**: Multiple photo upload with Cloudinary integration
- **Booking Dashboard**: Manage inquiries and update booking status
- **Revenue Analytics**: Track bookings, revenue, and performance metrics
- **Real-time Alerts**: Email notifications for new inquiries
- **Profile Management**: Business information and contact details

### Platform Features
- **Authentication System**: Email/password + Google OAuth integration
- **Email Verification**: OTP-based registration and password reset
- **Secure API**: JWT tokens with automatic refresh
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Image Optimization**: Cloudinary CDN with auto-optimization
- **Database Management**: MySQL with automated schema initialization
- **Error Handling**: Comprehensive error boundaries and user feedback

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.jsx` represents the homepage
- Routes are defined in `client/App.jsx` using `react-router-dom`
- Route files are located in the `client/pages/` directory

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Layout><Index /></Layout>} />
  <Route path="/venues" element={<Layout><Venues /></Layout>} />
  <Route path="/venue/:id" element={<Layout><VenueDetail /></Layout>} />
  <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
  <Route path="/admin" element={<AdminDashboard />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<Layout><NotFound /></Layout>} />
</Routes>
```

### Layout Components
- **Layout**: Standard layout with Navigation + Footer for public pages
- **AuthLayout**: Minimal layout for authentication pages
- **No Layout**: Direct component rendering for admin dashboard

## Styling System

- **Primary**: TailwindCSS 3 utility classes with custom VenueKart theme
- **Theme**: Custom color palette with CSS variables in `client/global.css`
- **UI Components**: Radix UI primitives with custom styling
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge`

```javascript
// VenueKart theme colors
:root {
  --primary: 244 62% 32%;     /* venue-indigo #3C3B6E */
  --accent: 246 100% 69%;     /* venue-purple #6C63FF */
  --secondary: 246 100% 95%;  /* venue-lavender #E6E6FA */
}

// Usage example
className={cn(
  "bg-venue-indigo text-white",
  { "hover:bg-venue-purple": isInteractive },
  props.className
)}
```

## Express Server Integration

- **Development**: Single port (8080) for frontend, Express on port 5000
- **Production**: Express serves built React SPA
- **Hot reload**: Both client and server code during development
- **API endpoints**: All prefixed with `/api/`
- **Database**: MySQL connection with automatic table creation

### Core API Routes

#### Authentication (`/api/auth`)
- `POST /register` - User registration with email verification
- `POST /verify-otp` - Complete email verification
- `POST /login` - Email/password authentication
- `GET /google` - Google OAuth initiation
- `GET /google/callback` - OAuth callback handling
- `GET /me` - Get current authenticated user
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate refresh token

#### Venues (`/api/venues`)
- `GET /` - List venues with filtering and pagination
- `GET /:id` - Get venue details with images and facilities
- `POST /` - Create venue (venue owners only)
- `PUT /:id` - Update venue (venue owners only)
- `DELETE /:id` - Delete venue (venue owners only)
- `GET /owner/my-venues` - Get owner's venues

#### Bookings (`/api/bookings`)
- `POST /` - Create booking inquiry
- `GET /owner` - Get bookings for venue owner
- `GET /customer` - Get bookings for customer
- `PUT /:id/status` - Update booking status (owner only)

#### File Upload (`/api/upload`)
- `POST /image` - Upload single image to Cloudinary
- `POST /images` - Upload multiple images (max 10)
- `DELETE /image/:publicId` - Delete image from Cloudinary

#### Favorites (`/api/favorites`)
- `GET /` - List user's favorite venues
- `POST /:venueId` - Add venue to favorites
- `DELETE /:venueId` - Remove venue from favorites

## Database Integration

### MySQL Schema
The application uses MySQL with automatic table creation:

- **users**: User accounts with authentication data
- **venues**: Venue listings with owner relationships
- **venue_images**: Photo galleries for venues
- **venue_facilities**: Amenity lists for venues
- **bookings**: Booking inquiries and status tracking
- **favorites**: User-venue favorite relationships
- **refresh_tokens**: JWT refresh token management
- **otp_verifications**: Email verification codes

### Connection Management
```javascript
// Database connection with pooling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## Authentication & Security

### JWT Token System
- **Access Tokens**: 15-minute expiry for API requests
- **Refresh Tokens**: 7-day expiry stored in database
- **Auto-refresh**: Client automatically renews expired tokens
- **Secure Storage**: Tokens stored in localStorage with proper cleanup

### Security Features
- **Password Hashing**: bcrypt with salt rounds 12
- **Input Validation**: SQL injection prevention
- **CORS Protection**: Configured for specific origins
- **Token Revocation**: Database-stored refresh tokens
- **Session Management**: Automatic token cleanup on logout

## Development Commands

```bash
# Development
npm run dev              # Start dev server (client + server)
npm run dev:client       # Start only client development server
npm run dev:server       # Start only server development server

# Production
npm run build            # Build for production
npm run build:client     # Build only client
npm run build:server     # Build only server
npm start               # Start production server

# Testing & Quality
npm test                # Run tests
npm run format.fix      # Format code with Prettier
```

## Adding Features

### Add New Venue Type or Amenity

Update `client/constants/venueOptions.js`:
```javascript
export const venueTypes = [
  'Banquet Hall',
  'Wedding Venue',
  'Conference Center',
  'Garden Venue',
  'Your New Type'  // Add here
];

export const facilities = [
  'Air Conditioning',
  'Parking',
  'Catering',
  'Your New Facility'  // Add here
];
```

### Add New API Route

1. Create route handler in `server/routes/your-route.js`:
```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/your-endpoint', authenticateToken, async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

2. Register route in `server/index.js`:
```javascript
import yourRoutes from './routes/your-route.js';

// In createServer function:
app.use('/api/your-route', yourRoutes);
```

### Add New Page Route

1. Create component in `client/pages/YourPage.jsx`:
```javascript
export default function YourPage() {
  return (
    <div>
      <h1>Your New Page</h1>
    </div>
  );
}
```

2. Add route in `client/App.jsx`:
```javascript
import YourPage from './pages/YourPage';

// Add to Routes:
<Route path="/your-page" element={<Layout><YourPage /></Layout>} />
```

### Add Email Template

Update `server/services/emailService.js`:
```javascript
export const sendYourEmail = async (recipientEmail, data) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Your Subject',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Your Email Content</h1>
        <p>Dynamic data: ${data.message}</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DB_HOST=localhost
DB_USER=venuekart_user
DB_PASSWORD=secure_password
DB_NAME=venuekart

# JWT Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VENUEKART_ADMIN_EMAIL=admin@venuekart.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Application
CLIENT_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080
COOKIE_SECRET=your_session_secret
```

## Production Deployment

### Standard Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t venuekart .

# Run container
docker run -p 8080:8080 venuekart
```

### Environment-Specific Deployment
- **Frontend**: Netlify, Vercel (SPA build)
- **Backend**: Railway, Heroku, DigitalOcean
- **Database**: PlanetScale, AWS RDS, Google Cloud SQL
- **Images**: Cloudinary (already integrated)

## Architecture Notes

### Development Architecture
- **Single-port development**: Vite dev server proxies API requests
- **Hot reload**: Both client and server code reload automatically
- **Database initialization**: Tables created automatically on server start
- **Error boundaries**: Comprehensive error handling throughout the app

### Production Architecture
- **SPA serving**: Express serves built React application
- **API routing**: Express handles all `/api/*` routes
- **Static assets**: Built client files served from `/dist/spa/`
- **Database pooling**: MySQL connection pool for optimal performance

### Security Architecture
- **JWT authentication**: Stateless token-based auth with refresh rotation
- **Input sanitization**: SQL injection and XSS prevention
- **CORS protection**: Configured for specific frontend origins
- **Environment isolation**: Sensitive data in environment variables

### Scalability Considerations
- **Database indexing**: Optimized queries with proper indexes
- **Image CDN**: Cloudinary for global image delivery
- **Connection pooling**: Efficient database connection management
- **Caching strategies**: Future implementation for improved performance

This architecture supports a full-featured venue booking platform with room for growth and additional features as the business requirements evolve.
