import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './database.js';

dotenv.config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const client = await pool.connect();
    
    try {
      // Check if user already exists with Google ID
      let result = await client.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (result.rows.length > 0) {
        // User exists, return user
        return done(null, result.rows[0]);
      }

      // Check if user exists with same email
      result = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [profile.emails[0].value]
      );

      if (result.rows.length > 0) {
        // Link Google account to existing user
        await client.query(
          'UPDATE users SET google_id = $1, profile_image = $2, is_verified = true WHERE email = $3',
          [profile.id, profile.photos[0]?.value, profile.emails[0].value]
        );
        
        const updatedUser = await client.query(
          'SELECT * FROM users WHERE email = $1',
          [profile.emails[0].value]
        );
        
        return done(null, updatedUser.rows[0]);
      }

      // Create new user with Google account
      const newUserResult = await client.query(
        `INSERT INTO users (email, name, google_id, profile_image, user_type, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          profile.emails[0].value,
          profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
          profile.id,
          profile.photos[0]?.value,
          'client', // Default to client, can be changed later
          true
        ]
      );

      return done(null, newUserResult.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, name, user_type, profile_image, is_verified, is_active FROM users WHERE id = $1 AND is_active = true',
        [payload.userId]
      );

      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      } else {
        return done(null, false);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, name, user_type, profile_image, is_verified, is_active FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length > 0) {
        done(null, result.rows[0]);
      } else {
        done(null, false);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Deserialize user error:', error);
    done(error, false);
  }
});

export default passport;
