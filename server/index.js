import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import { initializeDatabase } from "./config/database.js";
import { cleanupExpiredTokens } from "./utils/auth.js";
import { corsOptions, errorHandler, generalRateLimit } from "./middleware/auth.js";
import { handleUploadError } from "./utils/upload.js";

// Import routes
import authRoutes from "./routes/auth.js";
import venueRoutes from "./routes/venues.js";
import bookingRoutes from "./routes/bookings.js";
import { handleDemo } from "./routes/demo.js";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://cdn.builder.io"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"]
      }
    }
  }));

  // CORS middleware
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session middleware for passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'venuekart-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // General rate limiting
  app.use('/api', generalRateLimit);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Original demo routes (keep for compatibility)
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from VenueKart Express server!" });
  });

  app.get("/api/demo", handleDemo);

  // Main API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/venues", venueRoutes);
  app.use("/api/bookings", bookingRoutes);

  // Upload error handling middleware
  app.use(handleUploadError);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

// Initialize database and cleanup tasks
export async function initializeServer() {
  try {
    console.log('🚀 Initializing VenueKart server...');
    
    // Initialize database
    await initializeDatabase();
    
    // Start cleanup interval for expired tokens (run every hour)
    setInterval(async () => {
      try {
        await cleanupExpiredTokens();
        console.log('🧹 Expired tokens cleaned up');
      } catch (error) {
        console.error('❌ Token cleanup error:', error);
      }
    }, 60 * 60 * 1000);

    console.log('✅ VenueKart server initialized successfully');
    
    // Log environment info
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    console.log(`💾 Database: ${process.env.DB_NAME || 'venuekart'}`);
    
    if (process.env.GOOGLE_CLIENT_ID) {
      console.log('🔐 Google OAuth: Configured');
    } else {
      console.log('⚠️  Google OAuth: Not configured (set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)');
    }
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('📁 Cloudinary: Configured');
    } else {
      console.log('⚠️  Cloudinary: Not configured (set CLOUDINARY_* variables)');
    }
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown handler
export function setupGracefulShutdown() {
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    // Cleanup operations
    setTimeout(() => {
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    }, 1000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
