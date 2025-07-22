import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Database initialization
export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await createTables();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Create all necessary tables
const createTables = async () => {
  const client = await pool.connect();
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('client', 'venue_owner')),
        google_id VARCHAR(255) UNIQUE,
        profile_image VARCHAR(500),
        phone VARCHAR(20),
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Venues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        venue_type VARCHAR(100) NOT NULL,
        location VARCHAR(500) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) DEFAULT 'India',
        postal_code VARCHAR(20),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        capacity INTEGER NOT NULL,
        price_per_day DECIMAL(10, 2) NOT NULL,
        amenities TEXT[],
        facilities TEXT[],
        images TEXT[],
        availability_status VARCHAR(50) DEFAULT 'available',
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        guest_count INTEGER NOT NULL,
        event_type VARCHAR(100),
        special_requests TEXT,
        total_amount DECIMAL(10, 2) NOT NULL,
        booking_status VARCHAR(50) DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'refunded')),
        payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(venue_id, client_id, booking_id)
      )
    `);

    // Refresh tokens table for JWT
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_revoked BOOLEAN DEFAULT false
      )
    `);

    // Admin logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        admin_id UUID NOT NULL REFERENCES users(id),
        action VARCHAR(255) NOT NULL,
        target_type VARCHAR(100),
        target_id UUID,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(city, state)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_venue_id ON reviews(venue_id)');
    
    // Create trigger for updating updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply trigger to all tables with updated_at column
    const tables = ['users', 'venues', 'bookings', 'reviews'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at 
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

  } finally {
    client.release();
  }
};

export default pool;
