import passport from 'passport';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { createRateLimiter } from '../utils/auth.js';

// JWT Authentication Middleware
export const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized access. Please log in.',
        code: 'AUTH_REQUIRED'
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Optional JWT Authentication (doesn't fail if no token)
export const optionalAuthenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRoles = Array.isArray(req.user.user_type) ? req.user.user_type : [req.user.user_type];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions to access this resource',
        required_roles: allowedRoles,
        user_roles: userRoles
      });
    }

    next();
  };
};

// Check if user owns the resource
export const requireOwnership = (resourceIdParam = 'id', resourceTable = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Resource ID is required' 
        });
      }

      // If user is admin or venue_owner with admin privileges, allow access
      if (req.user.user_type === 'admin') {
        return next();
      }

      // Store resource ID and user ID for route handlers to use
      req.resourceId = resourceId;
      req.ownerId = req.user.id;

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking resource ownership' 
      });
    }
  };
};

// Validation middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation rules
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  body('userType')
    .isIn(['client', 'venue_owner'])
    .withMessage('User type must be either client or venue_owner'),
  validateRequest
];

// Login validation rules
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('userType')
    .isIn(['client', 'venue_owner'])
    .withMessage('User type must be either client or venue_owner'),
  validateRequest
];

// Venue validation rules
export const validateVenue = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Venue name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('venue_type')
    .notEmpty()
    .withMessage('Venue type is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10,000'),
  body('price_per_day')
    .isFloat({ min: 0 })
    .withMessage('Price per day must be a positive number'),
  validateRequest
];

// Booking validation rules
export const validateBooking = [
  body('venue_id')
    .isUUID()
    .withMessage('Valid venue ID is required'),
  body('event_date')
    .isDate()
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),
  body('guest_count')
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1'),
  body('event_type')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Event type must not exceed 100 characters'),
  validateRequest
];

// Rate limiting middleware
export const authRateLimit = rateLimit(createRateLimiter(15 * 60 * 1000, 5)); // 5 attempts per 15 minutes
export const generalRateLimit = rateLimit(createRateLimiter(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
export const uploadRateLimit = rateLimit(createRateLimiter(60 * 60 * 1000, 10)); // 10 uploads per hour

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      code: 'DUPLICATE_RESOURCE'
    });
  }

  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
      code: 'INVALID_REFERENCE'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
