import express from 'express';
import passport from '../config/passport.js';
import pool from '../config/database.js';
import { 
  generateTokens, 
  hashPassword, 
  verifyPassword, 
  storeRefreshToken, 
  verifyRefreshToken,
  revokeRefreshToken,
  validatePassword 
} from '../utils/auth.js';
import { 
  validateRegistration, 
  validateLogin, 
  authenticateJWT, 
  authRateLimit 
} from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', authRateLimit, validateRegistration, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, name, userType } = req.body;

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name, user_type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, name, user_type, created_at`,
      [email, hashedPassword, name, userType]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.user_type,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Login user
router.post('/login', authRateLimit, validateLogin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, userType } = req.body;

    // Find user
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND user_type = $2 AND is_active = true',
      [email, userType]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or user type',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = result.rows[0];

    // Check if user has a password (not OAuth only)
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in with Google',
        code: 'OAUTH_ONLY'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email, password, or user type',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token
    await storeRefreshToken(user.id, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.user_type,
          profileImage: user.profile_image,
          isVerified: user.is_verified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Google OAuth login
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);
      
      // Store refresh token
      await storeRefreshToken(user.id, refreshToken);

      // Redirect to client with tokens
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const redirectUrl = `${clientUrl}/auth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profileImage: user.profile_image,
        isVerified: user.is_verified
      }))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth/error?message=Authentication failed`);
    }
  }
);

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const tokenData = await verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenData.user_id);
    
    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);
    
    // Store new refresh token
    await storeRefreshToken(tokenData.user_id, newRefreshToken);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
});

// Logout user
router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout'
    });
  }
});

// Get current user profile
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, email, name, user_type, profile_image, phone, is_verified, is_active, created_at, updated_at 
         FROM users WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.user_type,
            profileImage: user.profile_image,
            phone: user.phone,
            isVerified: user.is_verified,
            isActive: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/me', authenticateJWT, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (!name.trim() || name.length < 2 || name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 100 characters'
        });
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (phone !== undefined) {
      if (phone && (phone.length < 10 || phone.length > 20)) {
        return res.status(400).json({
          success: false,
          message: 'Phone number must be between 10 and 20 characters'
        });
      }
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(userId);

    const result = await client.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} 
       RETURNING id, email, name, user_type, profile_image, phone, is_verified, updated_at`,
      values
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.user_type,
          profileImage: user.profile_image,
          phone: user.phone,
          isVerified: user.is_verified,
          updatedAt: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  } finally {
    client.release();
  }
});

// Verify token (for frontend to check if token is still valid)
router.get('/verify', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        userType: req.user.user_type,
        profileImage: req.user.profile_image,
        isVerified: req.user.is_verified
      }
    }
  });
});

export default router;
