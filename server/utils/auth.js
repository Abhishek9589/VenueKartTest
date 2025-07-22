import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/database.js';

// Generate JWT tokens
export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, tokenType: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Store refresh token in database
export const storeRefreshToken = async (userId, refreshToken) => {
  const client = await pool.connect();
  
  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await client.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  } finally {
    client.release();
  }
};

// Verify refresh token
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const client = await pool.connect();
    
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      const result = await client.query(
        `SELECT rt.*, u.id, u.email, u.name, u.user_type 
         FROM refresh_tokens rt 
         JOIN users u ON rt.user_id = u.id 
         WHERE rt.token_hash = $1 AND rt.expires_at > NOW() AND rt.is_revoked = false AND u.is_active = true`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Revoke refresh token
export const revokeRefreshToken = async (refreshToken) => {
  const client = await pool.connect();
  
  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await client.query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1',
      [tokenHash]
    );
  } finally {
    client.release();
  }
};

// Cleanup expired tokens
export const cleanupExpiredTokens = async () => {
  const client = await pool.connect();
  
  try {
    await client.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = true'
    );
  } finally {
    client.release();
  }
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate secure random token
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Rate limiting helper
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 5) => {
  return {
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  };
};
