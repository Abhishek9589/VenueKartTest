# VenueKart - Complete Full-Stack Venue Booking Platform

A modern, full-stack web application for venue discovery and booking with real-time data, authentication, and admin capabilities.

## 🚀 Features

### Frontend
- **React 18** with modern hooks and context
- **Tailwind CSS** with custom VenueKart design system
- **React Router** for client-side routing
- **Real-time API integration** with loading states and error handling
- **Responsive design** optimized for all devices
- **Google OAuth** integration for seamless authentication

### Backend
- **Node.js/Express** REST API server
- **PostgreSQL** database with comprehensive schema
- **JWT authentication** with refresh tokens
- **Passport.js** for Google OAuth
- **Cloudinary** for image uploads and management
- **Rate limiting** and security middleware
- **Comprehensive error handling**

### Key Functionality
- **User Authentication**: Register/Login with email or Google OAuth
- **Role-based Access**: Separate interfaces for clients and venue owners
- **Venue Management**: Full CRUD operations with image uploads
- **Real-time Booking**: Complete booking workflow with status management
- **Admin Dashboard**: Venue owner dashboard with statistics and management
- **Search & Filtering**: Advanced venue search with multiple criteria
- **Reviews & Ratings**: User feedback system for venues

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Lucide React (icons)
- Vite (build tool)

### Backend
- Node.js
- Express.js
- PostgreSQL
- Passport.js (authentication)
- JWT (JSON Web Tokens)
- Cloudinary (image storage)
- Bcrypt (password hashing)

### DevOps
- Concurrently (development)
- Nodemon (auto-restart)
- ESLint & Prettier
- Git hooks

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd venuekart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/venuekart
DB_HOST=localhost
DB_PORT=5432
DB_NAME=venuekart
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
SESSION_SECRET=your-session-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 4. Database Setup
```bash
# Automated database setup
npm run db:setup
```

Or manually:
```sql
-- Create database
CREATE DATABASE venuekart;

-- Run the application (it will create tables automatically)
npm run dev:server
```

### 5. Start Development
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:client  # Frontend only (port 5173)
npm run dev:server  # Backend only (port 3001)
```

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - Your production URL (production)
6. Copy Client ID and Secret to `.env`

### Cloudinary Setup (for image uploads)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add to `.env` file

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - Login user
GET  /api/auth/google       - Google OAuth
POST /api/auth/refresh      - Refresh access token
GET  /api/auth/me           - Get current user
PUT  /api/auth/me           - Update profile
POST /api/auth/logout       - Logout user
```

### Venues Endpoints
```
GET    /api/venues              - Get all venues (with filters)
GET    /api/venues/:id          - Get venue by ID
POST   /api/venues              - Create new venue (venue owners)
PUT    /api/venues/:id          - Update venue (owner only)
DELETE /api/venues/:id          - Delete venue (owner only)
GET    /api/venues/owner/my-venues - Get owner's venues
GET    /api/venues/owner/stats     - Get venue statistics
```

### Bookings Endpoints
```
POST   /api/bookings                - Create booking (clients)
GET    /api/bookings/my-bookings    - Get user's bookings
GET    /api/bookings/:id            - Get booking details
PATCH  /api/bookings/:id/status     - Update booking status
POST   /api/bookings/:id/cancel     - Cancel booking
GET    /api/bookings/stats/overview - Get booking statistics
```

## 🏗️ Database Schema

### Users Table
- Authentication and profile data
- Role-based user types (client, venue_owner)
- Google OAuth integration

### Venues Table
- Complete venue information
- Image storage (Cloudinary URLs)
- Geolocation support
- Amenities and facilities

### Bookings Table
- Booking workflow management
- Payment status tracking
- Event details

### Reviews Table
- User feedback system
- Rating aggregation

## 👥 User Roles

### Client
- Browse and search venues
- Create bookings
- Manage personal bookings
- Leave reviews

### Venue Owner
- Manage venue listings
- Handle booking requests
- View analytics dashboard
- Upload venue images

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password hashing** with bcrypt
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **CORS** configuration
- **Helmet.js** security headers
- **SQL injection** protection with parameterized queries

## 📱 Frontend Features

### Components
- Responsive navigation with user state
- Advanced search and filtering
- Real-time booking interface
- Admin dashboard for venue owners
- Error boundaries and loading states

### State Management
- React Context for authentication
- Local storage for token persistence
- Optimistic UI updates

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build:client
# Deploy dist/ folder
```

### Backend (Railway/Heroku/VPS)
```bash
npm run build:server
npm start
```

### Environment Variables for Production
Update `.env` with production values:
- Database connection strings
- JWT secrets (generate new ones!)
- OAuth callback URLs
- Cloudinary production settings

## 📊 Performance

- **Image optimization** with Cloudinary
- **Database indexing** for fast queries
- **Connection pooling** for PostgreSQL
- **Gzip compression** for API responses
- **Browser caching** strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Check connection settings in .env
# Ensure database exists
```

**Google OAuth Not Working**
- Verify Google Cloud Console setup
- Check redirect URLs match exactly
- Ensure APIs are enabled

**Images Not Uploading**
- Check Cloudinary credentials
- Verify file size limits
- Check network connectivity

**Port Already in Use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### Development Tips

1. **Hot Reload**: Use `npm run dev:server:watch` for backend auto-restart
2. **Database Reset**: Drop tables and restart server to recreate
3. **API Testing**: Use tools like Postman or Thunder Client
4. **Logs**: Check browser console and server terminal for errors

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using modern web technologies**
