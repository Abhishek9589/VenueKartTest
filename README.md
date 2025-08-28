# VenueKart 🏛️

**VenueKart** is a comprehensive venue booking platform that simplifies event planning by connecting customers with verified venues through transparent pricing and seamless booking management.

## 🌟 Overview

VenueKart is a full-stack web application built to revolutionize venue booking and event planning. The platform provides a modern, user-friendly interface for customers to discover, compare, and book venues for various events while offering venue owners powerful tools to manage their properties and bookings.

### 🎯 Mission
Making event planning effortless with verified venues and transparent pricing.

### 👥 Target Users
- **Event Planners**: Individuals organizing weddings, corporate events, parties
- **Venue Owners**: Hotels, banquet halls, conference centers, outdoor venues
- **Event Management Companies**: Professional event organizers

## 🚀 Key Features

### For Customers
- **🔍 Smart Search & Discovery**: Advanced filtering by location, capacity, amenities, and price
- **✅ Verified Listings**: All venues thoroughly verified for authenticity and quality
- **💰 Transparent Pricing**: Clear, upfront pricing with no hidden fees
- **📱 Real-time Notifications**: Instant updates on booking status via email
- **❤️ Favorites Management**: Save and organize preferred venues
- **📊 User Dashboard**: Track inquiry history and booking status
- **🔐 Secure Authentication**: OAuth and traditional login options

### For Venue Owners
- **🏢 Venue Management**: Complete venue profile creation and editing
- **📋 Booking Management**: Real-time inquiry handling and booking workflow
- **📈 Analytics Dashboard**: Revenue tracking and booking statistics
- **🔔 Notification System**: Instant alerts for new inquiries via email
- **📧 Automated Communications**: Email notifications for booking updates
- **💼 Admin Portal**: Comprehensive management interface

### Platform Features
- **🔒 Secure Authentication**: JWT-based authentication with refresh token support
- **☁️ Cloud Storage**: Cloudinary integration for image management
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **⚡ Real-time Updates**: Live notifications and data synchronization
- **🎨 Modern UI/UX**: Built with Radix UI and TailwindCSS
- **📧 Email Integration**: Comprehensive email notification system

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router 6** - SPA routing with authentication guards
- **Vite** - Fast development server and build tool
- **TailwindCSS 3** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **React Query** - Server state management
- **React Hook Form** - Efficient form handling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service integration
- **Cloudinary** - Image upload and management
- **Passport.js** - Authentication middleware (Google OAuth)

### Development Tools
- **TypeScript** - Type safety and better DX
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **dotenv** - Environment variable management

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional)

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=venuekart

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VENUEKART_ADMIN_EMAIL=admin@venuekart.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Application Configuration
CLIENT_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080
COOKIE_SECRET=your_cookie_secret
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd venuekart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database named `venuekart`
   - The application will automatically create tables on first run

4. **Configure environment variables**
   - Create `.env` file with the variables shown above
   - Update all required environment variables

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080`

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server (client + server)
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

## 🏗️ Project Architecture

### Frontend Architecture
```
client/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   ├── Navigation.jsx   # Site navigation
│   ├── Footer.jsx      # Site footer
│   ├── AddVenueForm.jsx # Venue creation form
│   ├── EditVenueForm.jsx # Venue editing form
│   └── TokenExpiredNotice.jsx # Token expiration handling
├── pages/              # Route components
│   ├── Index.jsx       # Homepage
│   ├── Venues.jsx      # Venue listing
│   ├── VenueDetail.jsx # Individual venue page
│   ├── AdminDashboard.jsx # Owner dashboard
│   ├── UserDashboard.jsx # Customer dashboard
│   ├── SignIn.jsx      # Login page
│   ├── SignUp.jsx      # Registration page
│   ├── VerifyOTP.jsx   # Email verification
│   └── [other pages...]
├── contexts/           # React Context providers
│   └── AuthContext.jsx # Authentication state
├── hooks/              # Custom React hooks
│   └── useFavorites.js # Favorites management
├── services/           # API service layers
│   ├── authService.js  # Authentication API
│   ├── venueService.js # Venue management API
│   └── notificationService.js # Notifications
├── lib/                # Utility functions
│   ├── apiClient.js    # HTTP client with auth
│   ├── utils.js        # General utilities
│   ├── navigation.js   # Navigation helpers
│   └── errorMessages.js # Error handling
├── constants/          # Application constants
│   └── venueOptions.js # Venue types and options
├── App.jsx             # Main app component with routing
└── global.css          # Global styles and theme
```

### Backend Architecture
```
server/
├── config/             # Configuration files
│   └── database.js     # Database setup and schema
├── routes/             # Express route handlers
│   ├── auth.js         # Authentication endpoints
│   ├── venues.js       # Venue management endpoints
│   ├── bookings.js     # Booking management endpoints
│   ├── upload.js       # File upload endpoints
│   ├── favorites.js    # Favorites endpoints
│   └── demo.js         # Demo/test endpoints
├── middleware/         # Express middleware
│   └── auth.js         # Authentication middleware
├── services/           # Business logic services
│   ├── emailService.js # Email notifications
│   └── cloudinaryService.js # Image management
├── utils/              # Server utility functions
│   └── jwt.js          # JWT token utilities
├── index.js            # Main server setup
├── dev-server.js       # Development server
└── node-build.js       # Production build
```

## 🔐 Authentication Flow

### User Authentication Options
1. **Email/Password Registration**: Traditional signup with email verification
2. **Google OAuth**: Social login integration
3. **Email Verification**: OTP-based email verification system
4. **Password Reset**: Secure password reset via email OTP

### Token Management
- **Access Tokens**: JWT tokens with 15-minute expiry
- **Refresh Tokens**: 7-day expiry, stored in database
- **Automatic Refresh**: Client-side token renewal
- **Secure Logout**: Token invalidation and cleanup

### Authorization Levels
- **Guest**: Browse venues, view details
- **Customer**: Make inquiries, manage favorites, view booking history
- **Venue Owner**: Manage venues, handle bookings, access analytics
- **Admin**: Full platform management access (future enhancement)

## 📊 Database Schema

### Core Tables
- **users**: User profiles, authentication data, and user types
- **venues**: Venue information, pricing, and metadata
- **venue_images**: Venue photo galleries with Cloudinary URLs
- **venue_facilities**: Venue amenities and features
- **bookings**: Booking records, inquiries, and status management
- **favorites**: User favorite venues relationships
- **refresh_tokens**: JWT refresh token management
- **otp_verifications**: Email verification and password reset codes

### Key Relationships
- Users can be customers or venue owners
- Venue owners can manage multiple venues
- Venues have multiple images and facilities
- Bookings link customers to venues with status tracking
- Favorites create many-to-many relationships between users and venues

## 🔄 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration with email verification
- `POST /verify-otp` - Complete email verification
- `POST /login` - Email/password login
- `GET /google` - Initiate Google OAuth flow
- `GET /google/callback` - Handle OAuth callback
- `GET /me` - Get current authenticated user
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with OTP
- `POST /logout` - Invalidate refresh token

### Venues (`/api/venues`)
- `GET /` - List all venues with filtering and pagination
- `GET /:id` - Get venue details with images and facilities
- `POST /` - Create new venue (venue owners only)
- `PUT /:id` - Update venue (venue owners only)
- `DELETE /:id` - Delete venue (venue owners only)
- `GET /owner/my-venues` - Get owner's venues

### Bookings (`/api/bookings`)
- `POST /` - Create booking inquiry
- `GET /owner` - Get bookings for venue owner
- `GET /customer` - Get bookings for customer
- `PUT /:id/status` - Update booking status (owner only)
- `GET /owner/recent` - Get recent bookings for dashboard

### Additional APIs
- **Favorites** (`/api/favorites`) - Manage user favorites
- **Upload** (`/api/upload`) - Handle image uploads to Cloudinary
- **Demo** (`/api/demo`) - Health check and testing

## 🎨 Design System

### Color Palette
- **Primary**: Venue Indigo (`#3C3B6E`) - Main brand color
- **Secondary**: Venue Purple (`#6C63FF`) - Accent and hover states
- **Accent**: Venue Lavender (`#E6E6FA`) - Light backgrounds
- **Dark**: Venue Dark (`#1F1F2E`) - Dark mode and text

### Typography
- **Primary Font**: Poppins - Headings and UI elements
- **Secondary Font**: Inter - Body text and forms

### Component Library
Built on Radix UI primitives with custom VenueKart styling:
- **Form Controls**: Button, Input, Select, Textarea, Checkbox
- **Data Display**: Card, Badge, Avatar, Table
- **Feedback**: Alert, Toast, Dialog, Tooltip
- **Navigation**: Tabs, Breadcrumb, Menu, Pagination

## 🔧 Key Features Deep Dive

### Smart Search & Discovery
- **Location-based Search**: City, area, and landmark filtering
- **Capacity Filtering**: Guest count requirements
- **Amenity Filtering**: Multiple facility selection
- **Price Range Filtering**: Budget-based venue discovery
- **Real-time Results**: Instant search with pagination

### Venue Management System
- **Complete CRUD Operations**: Create, read, update, delete venues
- **Image Gallery Management**: Multiple image upload with Cloudinary
- **Facility Management**: Add/remove venue amenities
- **Pricing Configuration**: Flexible pricing structure
- **Status Management**: Active/inactive venue states

### Booking Workflow
1. **Customer Inquiry**: Submit venue booking request with event details
2. **Owner Notification**: Real-time email notification to venue owner
3. **Status Management**: Owner can accept or decline bookings
4. **Email Communications**: Automated notifications for all status changes
5. **History Tracking**: Complete booking timeline and status history

### Email Notification System
- **OTP Verification**: Registration and password reset emails
- **Booking Notifications**: Inquiry alerts and status updates
- **Admin Notifications**: System-wide booking activity alerts
- **Template System**: Professional email templates with branding

### Image Management
- **Cloudinary Integration**: Secure cloud storage with CDN
- **Multiple Upload**: Support for venue image galleries
- **Auto-optimization**: Automatic image compression and formatting
- **Responsive Images**: Multiple sizes for different devices

## 🚀 Deployment

### Production Requirements
- **Node.js Environment**: v18 or higher
- **MySQL Database**: Cloud or on-premise
- **Cloudinary Account**: For image storage
- **SMTP Server**: For email notifications
- **SSL Certificate**: For secure HTTPS connections

### Deployment Options
- **Frontend**: Netlify, Vercel, or static hosting
- **Backend**: Heroku, Railway, DigitalOcean, or VPS
- **Database**: MySQL on PlanetScale, AWS RDS, or Google Cloud SQL
- **Images**: Cloudinary CDN (already integrated)

### Docker Support
```bash
# Build and run with Docker
docker build -t venuekart .
docker run -p 8080:8080 venuekart
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the [documentation](documentation.md) for technical details

## 🗺️ Roadmap

### Upcoming Features
- **Mobile Application**: React Native app for iOS and Android
- **Advanced Analytics**: Business intelligence dashboard with charts
- **Payment Integration**: Online payment processing with Stripe/Razorpay
- **Review System**: Venue rating and customer review system
- **Calendar Integration**: Advanced availability management
- **Multi-language Support**: Internationalization (i18n)
- **Push Notifications**: Real-time mobile notifications
- **Advanced Search**: AI-powered venue recommendations
- **Vendor Management**: Multi-vendor marketplace features
- **API Documentation**: Comprehensive Swagger/OpenAPI docs

### Technical Improvements
- **Performance Optimization**: Database indexing and query optimization
- **Caching Layer**: Redis integration for improved performance
- **Microservices**: Service decomposition for scalability
- **GraphQL API**: Alternative API interface
- **Real-time Features**: WebSocket integration for live updates
- **Security Enhancements**: Advanced security features and monitoring

---

**VenueKart** - Making event planning effortless with verified venues and transparent pricing.

Built with ❤️ using modern web technologies for a seamless venue booking experience.
