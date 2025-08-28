# VenueKart 🏛️

**VenueKart** is a comprehensive venue booking platform that simplifies event planning by connecting customers with verified venues through transparent pricing and seamless booking management.

## 🌟 Overview

VenueKart is a full-stack web application designed to revolutionize venue booking and event planning. The platform provides a modern, user-friendly interface for customers to discover, compare, and book venues for various events while offering venue owners powerful tools to manage their properties and bookings.

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
- **📱 Real-time Notifications**: Instant updates on booking status
- **❤️ Favorites Management**: Save and organize preferred venues
- **📊 User Dashboard**: Track inquiry history and booking status
- **🔐 Secure Authentication**: OAuth and traditional login options

### For Venue Owners
- **🏢 Venue Management**: Complete venue profile creation and editing
- **📋 Booking Management**: Real-time inquiry handling and booking workflow
- **📈 Analytics Dashboard**: Revenue tracking and booking statistics
- **🔔 Notification System**: Instant alerts for new inquiries
- **📧 Automated Communications**: Email notifications for booking updates
- **💼 Admin Portal**: Comprehensive management interface

### Platform Features
- **🔒 Secure Payment Processing**: JWT-based authentication and secure transactions
- **☁️ Cloud Storage**: Cloudinary integration for image management
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **⚡ Real-time Updates**: Live notifications and data synchronization
- **🎨 Modern UI/UX**: Built with Radix UI and TailwindCSS

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
- **ESLint** - Code linting
- **Concurrently** - Run multiple commands

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

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Application URLs
CLIENT_URL=http://localhost:8080
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
   - Copy `.env.example` to `.env`
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
│   └── ...             # Feature-specific components
├── pages/              # Route components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API service layers
├── lib/                # Utility functions and configurations
└── constants/          # Application constants
```

### Backend Architecture
```
server/
├── config/             # Database and app configuration
├── routes/             # Express route handlers
├── middleware/         # Custom middleware functions
├── services/           # Business logic services
└── utils/              # Utility functions
```

## 🔐 Authentication Flow

### User Authentication
1. **Registration**: Email/password or Google OAuth
2. **Email Verification**: OTP-based email verification
3. **Login**: JWT token generation
4. **Token Refresh**: Automatic token renewal
5. **Logout**: Token invalidation

### Authorization Levels
- **Guest**: Browse venues, view details
- **Customer**: Make inquiries, manage favorites, view booking history
- **Venue Owner**: Manage venues, handle bookings, access analytics
- **Admin**: Full platform management access

## 📊 Database Schema

### Core Tables
- **users**: User profiles and authentication data
- **venues**: Venue information and metadata
- **bookings**: Booking records and inquiry management
- **favorites**: User favorite venues
- **venue_images**: Venue photo gallery
- **venue_facilities**: Venue amenities and features
- **refresh_tokens**: JWT refresh token management
- **otp_verifications**: Email verification codes

## 🔄 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Token refresh
- `GET /me` - Get current user
- `POST /logout` - User logout
- `GET /google` - Google OAuth
- `POST /verify-otp` - Email verification

### Venues (`/api/venues`)
- `GET /` - Get all venues (public)
- `GET /:id` - Get venue details
- `POST /` - Create venue (venue owner)
- `PUT /:id` - Update venue (venue owner)
- `DELETE /:id` - Delete venue (venue owner)
- `GET /owner/my-venues` - Get owner's venues

### Bookings (`/api/bookings`)
- `POST /inquiry` - Submit venue inquiry
- `GET /owner` - Get owner's bookings
- `GET /customer` - Get customer's bookings
- `PUT /:id/status` - Update booking status
- `GET /owner/inquiry-count` - Get inquiry count

### Additional APIs
- **Favorites** (`/api/favorites`) - Manage user favorites
- **Upload** (`/api/upload`) - Handle file uploads

## 🎨 Design System

### Color Palette
- **Primary**: Venue Indigo (`#3C3B6E`)
- **Secondary**: Venue Purple (`#6C63FF`)
- **Accent**: Venue Lavender (`#E6E6FA`)
- **Dark**: Venue Dark (`#1F1F2E`)

### Typography
- **Primary Font**: Poppins (headings, UI elements)
- **Secondary Font**: Inter (body text, forms)

### Component Library
Built on Radix UI primitives with custom styling:
- Form controls (Button, Input, Select, etc.)
- Data display (Card, Badge, Avatar, etc.)
- Overlay components (Dialog, Popover, Tooltip, etc.)
- Navigation components (Tabs, Breadcrumb, etc.)

## 🔧 Key Features Deep Dive

### Smart Search System
- **Location-based filtering**: City, area, landmark search
- **Capacity filtering**: Guest count requirements
- **Amenity filtering**: Multiple facility selection
- **Price range filtering**: Budget-based venue discovery
- **Real-time results**: Instant search updates

### Booking Management Workflow
1. **Customer Inquiry**: Venue interest submission
2. **Owner Notification**: Real-time email and dashboard alerts
3. **Status Management**: Accept/decline functionality
4. **Communication**: Automated email notifications
5. **History Tracking**: Complete booking timeline

### Admin Dashboard Features
- **Revenue Analytics**: Booking statistics and trends
- **Venue Management**: Complete CRUD operations
- **User Management**: Customer and owner oversight
- **Notification Center**: Real-time alert system
- **Settings Panel**: Platform configuration

## 🚀 Deployment

### Production Environment
The application is designed for deployment on:
- **Frontend**: Netlify, Vercel, or static hosting
- **Backend**: Heroku, Railway, or VPS
- **Database**: MySQL on cloud providers (PlanetScale, AWS RDS)
- **Images**: Cloudinary CDN

### Docker Support
Docker configuration included for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Upcoming Features
- **Mobile App**: React Native application
- **Advanced Analytics**: Business intelligence dashboard
- **Multi-language Support**: Internationalization
- **Payment Integration**: Online payment processing
- **Review System**: Venue rating and reviews
- **Calendar Integration**: Availability management
- **API Documentation**: Swagger/OpenAPI specs

---

**VenueKart** - Making event planning effortless with verified venues and transparent pricing.
