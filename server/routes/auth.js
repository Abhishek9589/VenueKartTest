import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { sendOTPEmail } from '../services/emailService.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Configure Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [profile.id, profile.emails[0].value]
    );

    let user = rows[0];

    if (user) {
      // Update google_id if user exists with email but no google_id
      if (!user.google_id) {
        await pool.execute(
          'UPDATE users SET google_id = ?, profile_picture = ?, is_verified = TRUE WHERE id = ?',
          [profile.id, profile.photos[0].value, user.id]
        );
        user.google_id = profile.id;
        user.profile_picture = profile.photos[0].value;
        user.is_verified = true;
      }
    } else {
      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (google_id, email, name, profile_picture, is_verified) VALUES (?, ?, ?, ?, TRUE)',
        [profile.id, profile.emails[0].value, profile.displayName, profile.photos[0].value]
      );
      
      user = {
        id: result.insertId,
        google_id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        profile_picture: profile.photos[0].value,
        user_type: 'customer',
        is_verified: true
      };
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshToken, expiresAt]
      );

      // Redirect to frontend with tokens
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}?access_token=${accessToken}&refresh_token=${refreshToken}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}?error=auth_failed`);
    }
  }
);

// Email-based registration with OTP
router.post('/register', async (req, res) => {
  try {
    const { email, name, userType = 'customer', password, mobileNumber } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const [existing] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0 && existing[0].is_verified) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    // Create or update user (unverified)
    if (existing.length > 0) {
      if (mobileNumber) {
        await pool.execute(
          'UPDATE users SET name = ?, user_type = ?, password_hash = ?, mobile_number = ? WHERE email = ?',
          [name, userType, passwordHash, mobileNumber, email]
        );
      } else {
        await pool.execute(
          'UPDATE users SET name = ?, user_type = ?, password_hash = ? WHERE email = ?',
          [name, userType, passwordHash, email]
        );
      }
    } else {
      if (mobileNumber) {
        await pool.execute(
          'INSERT INTO users (email, name, user_type, password_hash, mobile_number, is_verified) VALUES (?, ?, ?, ?, ?, FALSE)',
          [email, name, userType, passwordHash, mobileNumber]
        );
      } else {
        await pool.execute(
          'INSERT INTO users (email, name, user_type, password_hash, is_verified) VALUES (?, ?, ?, ?, FALSE)',
          [email, name, userType, passwordHash]
        );
      }
    }

    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await pool.execute(
      'UPDATE users SET is_verified = TRUE WHERE email = ?',
      [email]
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    // Get user data
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = userRows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old OTPs and store new one
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ message: 'New verification code sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Check if refresh token exists in database
    const [tokenRows] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [refreshToken]
    );

    if (tokenRows.length === 0) {
      return res.status(403).json({ error: 'Refresh token not found or expired' });
    }

    // Get user data
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await pool.execute(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [refreshToken]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Password-based login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRows[0];

    // Check if user has a password (not OAuth-only user)
    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses social login. Please sign in with Google.' });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.execute(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        profilePicture: user.profile_picture
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      'SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      profilePicture: user.profile_picture,
      mobileNumber: user.mobile_number,
      isVerified: user.is_verified
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Forgot password - send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [userRows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Email doesn\'t exist in our records' });
    }

    const user = userRows[0];

    // Generate OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs and store new one
    await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
    await pool.execute(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name, 'Password Reset');

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Verify OTP
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify email update
router.post('/verify-email-update', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check OTP and get pending data
    const [otpRows] = await pool.execute(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const pendingData = JSON.parse(otpRows[0].pending_data);
    const { userId, name, mobileNumber, password } = pendingData;

    // Prepare update fields
    let updateFields = ['name = ?', 'email = ?'];
    let updateValues = [name, email];

    if (mobileNumber) {
      updateFields.push('mobile_number = ?');
      updateValues.push(mobileNumber);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(passwordHash);
    }

    updateValues.push(userId);

    // Update user with new email
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Delete used OTP
    await pool.execute(
      'DELETE FROM otp_verifications WHERE email = ?',
      [email]
    );

    // Get updated user data
    const [updatedUserRows] = await pool.execute(
      'SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUserRows[0];
    res.json({
      message: 'Email verified and profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.user_type,
        profilePicture: updatedUser.profile_picture,
        mobileNumber: updatedUser.mobile_number,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email update' });
  }
});

// Update user profile
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, mobileNumber, password } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate mobile number if provided
    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.replace(/\s+/g, ''))) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // Get current user data
    const [currentUserRows] = await pool.execute(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    const currentEmail = currentUserRows[0].email;
    const emailChanged = email !== currentEmail;

    // Check if email is already taken by another user
    if (emailChanged) {
      const [existingUser] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email is already taken by another user' });
      }
    }

    // If email is being changed, require verification
    if (emailChanged) {
      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP and pending changes
      await pool.execute('DELETE FROM otp_verifications WHERE email = ?', [email]);
      await pool.execute(
        'INSERT INTO otp_verifications (email, otp, expires_at, pending_data) VALUES (?, ?, ?, ?)',
        [email, otp, expiresAt, JSON.stringify({ userId, name, email, mobileNumber, password })]
      );

      // Send verification email
      const emailSent = await sendOTPEmail(email, otp, name, 'Email Update');

      if (!emailSent) {
        return res.status(500).json({ error: 'Failed to send verification email' });
      }

      return res.json({
        message: 'Verification code sent to your new email address. Please verify to complete the update.',
        requiresVerification: true,
        newEmail: email
      });
    }

    // If email is not changing, update normally
    let updateFields = ['name = ?'];
    let updateValues = [name];

    // Add mobile number if provided
    if (mobileNumber) {
      updateFields.push('mobile_number = ?');
      updateValues.push(mobileNumber);
    }

    // Add password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      updateFields.push('password_hash = ?');
      updateValues.push(passwordHash);
    }

    // Add user ID for WHERE clause
    updateValues.push(userId);

    // Update user in database
    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user data
    const [updatedUserRows] = await pool.execute(
      'SELECT id, email, name, user_type, profile_picture, mobile_number, is_verified FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = updatedUserRows[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        userType: updatedUser.user_type,
        profilePicture: updatedUser.profile_picture,
        mobileNumber: updatedUser.mobile_number,
        isVerified: updatedUser.is_verified
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
