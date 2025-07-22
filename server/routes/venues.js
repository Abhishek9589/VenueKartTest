import express from 'express';
import pool from '../config/database.js';
import { 
  authenticateJWT, 
  optionalAuthenticateJWT,
  requireRole, 
  requireOwnership,
  validateVenue,
  generalRateLimit,
  uploadRateLimit
} from '../middleware/auth.js';
import { uploadMiddleware, deleteImage } from '../utils/upload.js';

const router = express.Router();

// Get all venues (with optional filtering and pagination)
router.get('/', optionalAuthenticateJWT, generalRateLimit, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      page = 1,
      limit = 12,
      city,
      state,
      venue_type,
      min_capacity,
      max_capacity,
      min_price,
      max_price,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    // Validation
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions = ['v.is_active = true'];
    const values = [];
    let paramIndex = 1;

    if (city) {
      conditions.push(`v.city ILIKE $${paramIndex++}`);
      values.push(`%${city}%`);
    }

    if (state) {
      conditions.push(`v.state ILIKE $${paramIndex++}`);
      values.push(`%${state}%`);
    }

    if (venue_type) {
      conditions.push(`v.venue_type = $${paramIndex++}`);
      values.push(venue_type);
    }

    if (min_capacity) {
      conditions.push(`v.capacity >= $${paramIndex++}`);
      values.push(parseInt(min_capacity));
    }

    if (max_capacity) {
      conditions.push(`v.capacity <= $${paramIndex++}`);
      values.push(parseInt(max_capacity));
    }

    if (min_price) {
      conditions.push(`v.price_per_day >= $${paramIndex++}`);
      values.push(parseFloat(min_price));
    }

    if (max_price) {
      conditions.push(`v.price_per_day <= $${paramIndex++}`);
      values.push(parseFloat(max_price));
    }

    if (search) {
      conditions.push(`(v.name ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex} OR v.location ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Build ORDER BY clause
    const allowedSortFields = ['created_at', 'name', 'price_per_day', 'capacity', 'rating'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query
    const venuesQuery = `
      SELECT 
        v.id, v.name, v.description, v.venue_type, v.location, v.address,
        v.city, v.state, v.capacity, v.price_per_day, v.amenities, v.facilities,
        v.images, v.availability_status, v.is_verified, v.rating, v.review_count,
        v.created_at, v.updated_at,
        u.name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM venues v
      JOIN users u ON v.owner_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY v.${sortField} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    values.push(limitNum, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(*) as total
      FROM venues v
      WHERE ${conditions.join(' AND ')}
    `;

    const [venuesResult, countResult] = await Promise.all([
      client.query(venuesQuery, values),
      client.query(countQuery, values.slice(0, -2)) // Remove limit and offset for count
    ]);

    const venues = venuesResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        venues,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: total,
          items_per_page: limitNum,
          has_next: pageNum < totalPages,
          has_previous: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues'
    });
  } finally {
    client.release();
  }
});

// Get single venue by ID
router.get('/:id', optionalAuthenticateJWT, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    const venueResult = await client.query(`
      SELECT 
        v.*,
        u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
        u.profile_image as owner_profile_image
      FROM venues v
      JOIN users u ON v.owner_id = u.id
      WHERE v.id = $1 AND v.is_active = true
    `, [id]);

    if (venueResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    const venue = venueResult.rows[0];

    // Get recent reviews
    const reviewsResult = await client.query(`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.name as reviewer_name, u.profile_image as reviewer_image
      FROM reviews r
      JOIN users u ON r.client_id = u.id
      WHERE r.venue_id = $1 AND r.is_active = true
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    venue.reviews = reviewsResult.rows;

    res.json({
      success: true,
      data: { venue }
    });

  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venue'
    });
  } finally {
    client.release();
  }
});

// Create new venue (venue owners only)
router.post('/', 
  authenticateJWT, 
  requireRole(['venue_owner']), 
  uploadRateLimit,
  uploadMiddleware.array('images', 10),
  validateVenue, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const {
        name, description, venue_type, location, address, city, state, country = 'India',
        postal_code, latitude, longitude, capacity, price_per_day, amenities, facilities
      } = req.body;

      const owner_id = req.user.id;

      // Process uploaded images
      const images = req.files ? req.files.map(file => file.secure_url || file.path) : [];

      // Process amenities and facilities (convert strings to arrays if needed)
      const amenitiesArray = Array.isArray(amenities) ? amenities : 
                           (amenities ? amenities.split(',').map(a => a.trim()) : []);
      const facilitiesArray = Array.isArray(facilities) ? facilities : 
                            (facilities ? facilities.split(',').map(f => f.trim()) : []);

      const result = await client.query(`
        INSERT INTO venues (
          owner_id, name, description, venue_type, location, address, city, state, country,
          postal_code, latitude, longitude, capacity, price_per_day, amenities, facilities, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        owner_id, name, description, venue_type, location, address, city, state, country,
        postal_code, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null,
        parseInt(capacity), parseFloat(price_per_day), amenitiesArray, facilitiesArray, images
      ]);

      const venue = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: { venue }
      });

    } catch (error) {
      console.error('Create venue error:', error);
      
      // Delete uploaded images if venue creation failed
      if (req.files) {
        req.files.forEach(file => {
          if (file.public_id) {
            deleteImage(file.public_id);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create venue'
      });
    } finally {
      client.release();
    }
  }
);

// Update venue (venue owner only, own venues)
router.put('/:id', 
  authenticateJWT, 
  requireRole(['venue_owner']), 
  requireOwnership('id'),
  uploadMiddleware.array('new_images', 10),
  validateVenue, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const owner_id = req.user.id;

      // Check if venue exists and belongs to user
      const existingVenue = await client.query(
        'SELECT * FROM venues WHERE id = $1 AND owner_id = $2',
        [id, owner_id]
      );

      if (existingVenue.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found or access denied'
        });
      }

      const {
        name, description, venue_type, location, address, city, state, country,
        postal_code, latitude, longitude, capacity, price_per_day, amenities, facilities,
        remove_images = []
      } = req.body;

      // Process new uploaded images
      const newImages = req.files ? req.files.map(file => file.secure_url || file.path) : [];
      
      // Get current images and remove specified ones
      let currentImages = existingVenue.rows[0].images || [];
      const removeImagesList = Array.isArray(remove_images) ? remove_images : 
                              (remove_images ? remove_images.split(',') : []);
      
      // Remove specified images
      currentImages = currentImages.filter(img => !removeImagesList.includes(img));
      
      // Add new images
      const finalImages = [...currentImages, ...newImages];

      // Process amenities and facilities
      const amenitiesArray = Array.isArray(amenities) ? amenities : 
                           (amenities ? amenities.split(',').map(a => a.trim()) : existingVenue.rows[0].amenities);
      const facilitiesArray = Array.isArray(facilities) ? facilities : 
                            (facilities ? facilities.split(',').map(f => f.trim()) : existingVenue.rows[0].facilities);

      const result = await client.query(`
        UPDATE venues SET
          name = COALESCE($2, name),
          description = COALESCE($3, description),
          venue_type = COALESCE($4, venue_type),
          location = COALESCE($5, location),
          address = COALESCE($6, address),
          city = COALESCE($7, city),
          state = COALESCE($8, state),
          country = COALESCE($9, country),
          postal_code = COALESCE($10, postal_code),
          latitude = COALESCE($11, latitude),
          longitude = COALESCE($12, longitude),
          capacity = COALESCE($13, capacity),
          price_per_day = COALESCE($14, price_per_day),
          amenities = COALESCE($15, amenities),
          facilities = COALESCE($16, facilities),
          images = $17,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND owner_id = $18
        RETURNING *
      `, [
        id, name, description, venue_type, location, address, city, state, country,
        postal_code, latitude ? parseFloat(latitude) : null, longitude ? parseFloat(longitude) : null,
        capacity ? parseInt(capacity) : null, price_per_day ? parseFloat(price_per_day) : null,
        amenitiesArray, facilitiesArray, finalImages, owner_id
      ]);

      const venue = result.rows[0];

      res.json({
        success: true,
        message: 'Venue updated successfully',
        data: { venue }
      });

    } catch (error) {
      console.error('Update venue error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update venue'
      });
    } finally {
      client.release();
    }
  }
);

// Delete venue (venue owner only, own venues)
router.delete('/:id', 
  authenticateJWT, 
  requireRole(['venue_owner']), 
  requireOwnership('id'),
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const owner_id = req.user.id;

      // Check if venue exists and belongs to user
      const existingVenue = await client.query(
        'SELECT * FROM venues WHERE id = $1 AND owner_id = $2',
        [id, owner_id]
      );

      if (existingVenue.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found or access denied'
        });
      }

      // Check for active bookings
      const activeBookings = await client.query(
        'SELECT COUNT(*) as count FROM bookings WHERE venue_id = $1 AND booking_status IN ($2, $3) AND event_date >= CURRENT_DATE',
        [id, 'pending', 'confirmed']
      );

      if (parseInt(activeBookings.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete venue with active bookings'
        });
      }

      // Soft delete (mark as inactive)
      await client.query(
        'UPDATE venues SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        message: 'Venue deleted successfully'
      });

    } catch (error) {
      console.error('Delete venue error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete venue'
      });
    } finally {
      client.release();
    }
  }
);

// Get venues by owner (venue owner's own venues)
router.get('/owner/my-venues', 
  authenticateJWT, 
  requireRole(['venue_owner']), 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const owner_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Get venues with booking statistics
      const venuesResult = await client.query(`
        SELECT 
          v.*,
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT CASE WHEN b.booking_status = 'confirmed' THEN b.id END) as confirmed_bookings,
          COUNT(DISTINCT CASE WHEN b.booking_status = 'pending' THEN b.id END) as pending_bookings,
          COALESCE(SUM(CASE WHEN b.booking_status = 'completed' THEN b.total_amount END), 0) as total_revenue
        FROM venues v
        LEFT JOIN bookings b ON v.id = b.venue_id
        WHERE v.owner_id = $1 AND v.is_active = true
        GROUP BY v.id
        ORDER BY v.created_at DESC
        LIMIT $2 OFFSET $3
      `, [owner_id, limitNum, offset]);

      // Get total count
      const countResult = await client.query(
        'SELECT COUNT(*) as total FROM venues WHERE owner_id = $1 AND is_active = true',
        [owner_id]
      );

      const venues = venuesResult.rows;
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limitNum);

      res.json({
        success: true,
        data: {
          venues,
          pagination: {
            current_page: pageNum,
            total_pages: totalPages,
            total_items: total,
            items_per_page: limitNum,
            has_next: pageNum < totalPages,
            has_previous: pageNum > 1
          }
        }
      });

    } catch (error) {
      console.error('Get owner venues error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your venues'
      });
    } finally {
      client.release();
    }
  }
);

// Get venue statistics for owner dashboard
router.get('/owner/stats', 
  authenticateJWT, 
  requireRole(['venue_owner']), 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const owner_id = req.user.id;

      const statsResult = await client.query(`
        SELECT 
          COUNT(DISTINCT v.id) as total_venues,
          COUNT(DISTINCT v.id) FILTER (WHERE v.is_verified = true) as verified_venues,
          COUNT(DISTINCT b.id) as total_bookings,
          COUNT(DISTINCT b.id) FILTER (WHERE b.booking_status = 'confirmed') as confirmed_bookings,
          COUNT(DISTINCT b.id) FILTER (WHERE b.booking_status = 'pending') as pending_bookings,
          COUNT(DISTINCT b.id) FILTER (WHERE b.event_date >= CURRENT_DATE) as upcoming_bookings,
          COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed'), 0) as total_revenue,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(DISTINCT r.id) as total_reviews
        FROM venues v
        LEFT JOIN bookings b ON v.id = b.venue_id
        LEFT JOIN reviews r ON v.id = r.venue_id AND r.is_active = true
        WHERE v.owner_id = $1 AND v.is_active = true
      `, [owner_id]);

      const stats = statsResult.rows[0];

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get venue stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch venue statistics'
      });
    } finally {
      client.release();
    }
  }
);

export default router;
