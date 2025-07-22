import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: "VenueKart Dev Server Running"
  });
});

// Mock API endpoints for development
app.get("/api/ping", (req, res) => {
  res.json({ message: "Hello from VenueKart Dev Server!" });
});

// Mock auth endpoints
app.post("/api/auth/register", (req, res) => {
  res.json({
    success: true,
    message: "Registration successful (mock)",
    data: {
      user: {
        id: "mock-user-id",
        email: req.body.email,
        name: req.body.name,
        userType: req.body.userType
      },
      tokens: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      }
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  res.json({
    success: true,
    message: "Login successful (mock)",
    data: {
      user: {
        id: "mock-user-id",
        email: req.body.email,
        name: "Mock User",
        userType: req.body.userType
      },
      tokens: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      }
    }
  });
});

app.get("/api/auth/verify", (req, res) => {
  res.json({
    success: true,
    message: "Token is valid (mock)",
    data: {
      user: {
        id: "mock-user-id",
        email: "user@example.com",
        name: "Mock User",
        userType: "client"
      }
    }
  });
});

// Mock venues endpoints
app.get("/api/venues", (req, res) => {
  const mockVenues = [
    {
      id: "1",
      name: "Grand Palace Hotel",
      location: "Mumbai, Maharashtra",
      price_per_day: 50000,
      capacity: 500,
      rating: 4.8,
      images: ["/placeholder.svg"],
      venue_type: "Wedding Hall",
      amenities: ["WiFi", "Parking", "AC"],
      description: "A beautiful venue for your special day"
    },
    {
      id: "2", 
      name: "Sunset Garden Resort",
      location: "Goa",
      price_per_day: 35000,
      capacity: 300,
      rating: 4.9,
      images: ["/placeholder.svg"],
      venue_type: "Resort",
      amenities: ["Pool", "Garden", "WiFi"],
      description: "Perfect for destination weddings"
    }
  ];

  res.json({
    success: true,
    data: {
      venues: mockVenues,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 2,
        items_per_page: 12
      }
    }
  });
});

// Mock single venue
app.get("/api/venues/:id", (req, res) => {
  const mockVenue = {
    id: req.params.id,
    name: "Grand Palace Hotel",
    location: "Mumbai, Maharashtra", 
    address: "123 Hotel Street, Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    price_per_day: 50000,
    capacity: 500,
    rating: 4.8,
    review_count: 156,
    images: ["/placeholder.svg"],
    venue_type: "Wedding Hall",
    amenities: ["WiFi", "Parking", "AC", "Catering"],
    facilities: ["Stage", "Sound System", "Lighting"],
    description: "A beautiful and spacious venue perfect for weddings and large events.",
    owner_name: "Hotel Manager",
    owner_email: "manager@grandpalace.com",
    reviews: [
      {
        id: "1",
        rating: 5,
        comment: "Amazing venue! Perfect for our wedding.",
        reviewer_name: "John Doe",
        created_at: new Date().toISOString()
      }
    ]
  };

  res.json({
    success: true,
    data: { venue: mockVenue }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found (dev server)',
    path: req.path,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VenueKart Dev Server running on port ${PORT}`);
  console.log(`📱 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Development Mode - Mock API endpoints active`);
  console.log(`   - Frontend: http://localhost:5173`);
  console.log(`   - Backend: http://localhost:${PORT}`);
});

// Handle server errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
