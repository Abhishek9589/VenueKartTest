import express from 'express';
import pool from '../config/database.js';
import { 
  authenticateJWT, 
  requireRole,
  validateBooking,
  generalRateLimit
} from '../middleware/auth.js';

const router = express.Router();

// Create new booking (clients only)
router.post('/', 
  authenticateJWT, 
  requireRole(['client']), 
  validateBooking,
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const {
        venue_id,
        event_date,
        start_time,
        end_time,
        guest_count,
        event_type,
        special_requests
      } = req.body;

      const client_id = req.user.id;

      // Check if venue exists and is available
      const venueResult = await client.query(
        'SELECT * FROM venues WHERE id = $1 AND is_active = true AND availability_status = $2',
        [venue_id, 'available']
      );

      if (venueResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Venue not found or not available'
        });
      }

      const venue = venueResult.rows[0];

      // Check venue capacity
      if (guest_count > venue.capacity) {
        return res.status(400).json({
          success: false,
          message: `Guest count (${guest_count}) exceeds venue capacity (${venue.capacity})`
        });
      }

      // Check if venue is already booked for the requested date
      const existingBooking = await client.query(
        `SELECT id FROM bookings 
         WHERE venue_id = $1 AND event_date = $2 
         AND booking_status IN ('confirmed', 'pending')`,
        [venue_id, event_date]
      );

      if (existingBooking.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Venue is already booked for this date'
        });
      }

      // Calculate total amount (for now, just the daily price)
      const total_amount = venue.price_per_day;

      // Create booking
      const bookingResult = await client.query(`
        INSERT INTO bookings (
          venue_id, client_id, event_date, start_time, end_time, 
          guest_count, event_type, special_requests, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        venue_id, client_id, event_date, start_time, end_time,
        guest_count, event_type, special_requests, total_amount
      ]);

      const booking = bookingResult.rows[0];

      // Get complete booking details with venue and client info
      const completeBookingResult = await client.query(`
        SELECT 
          b.*,
          v.name as venue_name, v.location as venue_location, v.images as venue_images,
          u.name as client_name, u.email as client_email, u.phone as client_phone
        FROM bookings b
        JOIN venues v ON b.venue_id = v.id
        JOIN users u ON b.client_id = u.id
        WHERE b.id = $1
      `, [booking.id]);

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking: completeBookingResult.rows[0] }
      });

    } catch (error) {
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking'
      });
    } finally {
      client.release();
    }
  }
);

// Get bookings for current user
router.get('/my-bookings', 
  authenticateJWT, 
  generalRateLimit,
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;
      const { 
        page = 1, 
        limit = 10, 
        status, 
        upcoming_only = false 
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      let query, values;

      if (userType === 'client') {
        // Get bookings made by the client
        query = `
          SELECT 
            b.*,
            v.name as venue_name, v.location as venue_location, 
            v.images as venue_images, v.address as venue_address,
            u.name as owner_name, u.email as owner_email, u.phone as owner_phone
          FROM bookings b
          JOIN venues v ON b.venue_id = v.id
          JOIN users u ON v.owner_id = u.id
          WHERE b.client_id = $1
        `;
        values = [userId];
      } else if (userType === 'venue_owner') {
        // Get bookings for venues owned by the user
        query = `
          SELECT 
            b.*,
            v.name as venue_name, v.location as venue_location, 
            v.images as venue_images, v.address as venue_address,
            c.name as client_name, c.email as client_email, c.phone as client_phone
          FROM bookings b
          JOIN venues v ON b.venue_id = v.id
          JOIN users c ON b.client_id = c.id
          WHERE v.owner_id = $1
        `;
        values = [userId];
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user type for this operation'
        });
      }

      // Add status filter
      if (status) {
        query += ` AND b.booking_status = $${values.length + 1}`;
        values.push(status);
      }

      // Add upcoming filter
      if (upcoming_only === 'true') {
        query += ` AND b.event_date >= CURRENT_DATE`;
      }

      // Add ordering and pagination
      query += ` ORDER BY b.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limitNum, offset);

      // Get bookings
      const bookingsResult = await client.query(query, values);

      // Get total count for pagination
      let countQuery = query.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) as total FROM');
      countQuery = countQuery.replace(/ORDER BY[\s\S]*$/, '');
      const countValues = values.slice(0, -2); // Remove limit and offset

      const countResult = await client.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limitNum);

      res.json({
        success: true,
        data: {
          bookings: bookingsResult.rows,
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
      console.error('Get my bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bookings'
      });
    } finally {
      client.release();
    }
  }
);

// Get single booking by ID
router.get('/:id', 
  authenticateJWT, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userType = req.user.user_type;

      let query, values;

      if (userType === 'client') {
        query = `
          SELECT 
            b.*,
            v.name as venue_name, v.location as venue_location, 
            v.images as venue_images, v.address as venue_address, v.amenities, v.facilities,
            u.name as owner_name, u.email as owner_email, u.phone as owner_phone
          FROM bookings b
          JOIN venues v ON b.venue_id = v.id
          JOIN users u ON v.owner_id = u.id
          WHERE b.id = $1 AND b.client_id = $2
        `;
        values = [id, userId];
      } else if (userType === 'venue_owner') {
        query = `
          SELECT 
            b.*,
            v.name as venue_name, v.location as venue_location, 
            v.images as venue_images, v.address as venue_address, v.amenities, v.facilities,
            c.name as client_name, c.email as client_email, c.phone as client_phone
          FROM bookings b
          JOIN venues v ON b.venue_id = v.id
          JOIN users c ON b.client_id = c.id
          WHERE b.id = $1 AND v.owner_id = $2
        `;
        values = [id, userId];
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user type for this operation'
        });
      }

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      res.json({
        success: true,
        data: { booking: result.rows[0] }
      });

    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking'
      });
    } finally {
      client.release();
    }
  }
);

// Update booking status (venue owners can confirm/cancel, clients can cancel)
router.patch('/:id/status', 
  authenticateJWT, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const { status, cancellation_reason } = req.body;
      const userId = req.user.id;
      const userType = req.user.user_type;

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking status'
        });
      }

      // Get booking details
      let bookingQuery;
      if (userType === 'client') {
        bookingQuery = await client.query(
          'SELECT b.*, v.owner_id FROM bookings b JOIN venues v ON b.venue_id = v.id WHERE b.id = $1 AND b.client_id = $2',
          [id, userId]
        );
      } else if (userType === 'venue_owner') {
        bookingQuery = await client.query(
          'SELECT b.*, v.owner_id FROM bookings b JOIN venues v ON b.venue_id = v.id WHERE b.id = $1 AND v.owner_id = $2',
          [id, userId]
        );
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user type for this operation'
        });
      }

      if (bookingQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      const booking = bookingQuery.rows[0];

      // Check permissions for status changes
      if (userType === 'client') {
        // Clients can only cancel their own bookings
        if (status !== 'cancelled') {
          return res.status(403).json({
            success: false,
            message: 'Clients can only cancel bookings'
          });
        }
        
        // Can't cancel confirmed bookings less than 24 hours before event
        if (booking.booking_status === 'confirmed') {
          const eventDate = new Date(booking.event_date);
          const now = new Date();
          const hoursDiff = (eventDate - now) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            return res.status(400).json({
              success: false,
              message: 'Cannot cancel booking less than 24 hours before the event'
            });
          }
        }
      } else if (userType === 'venue_owner') {
        // Venue owners can confirm, cancel, or mark as completed
        if (status === 'completed' && booking.booking_status !== 'confirmed') {
          return res.status(400).json({
            success: false,
            message: 'Can only mark confirmed bookings as completed'
          });
        }
      }

      // Update booking status
      const updateFields = ['booking_status = $2', 'updated_at = CURRENT_TIMESTAMP'];
      const updateValues = [id, status];
      let paramIndex = 3;

      if (cancellation_reason && status === 'cancelled') {
        updateFields.push(`special_requests = COALESCE(special_requests, '') || '\nCancellation reason: ' || $${paramIndex}`);
        updateValues.push(cancellation_reason);
        paramIndex++;
      }

      const updateQuery = `
        UPDATE bookings 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, updateValues);

      res.json({
        success: true,
        message: `Booking ${status} successfully`,
        data: { booking: result.rows[0] }
      });

    } catch (error) {
      console.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      });
    } finally {
      client.release();
    }
  }
);

// Cancel booking (both clients and venue owners)
router.post('/:id/cancel', 
  authenticateJWT, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;
      const userType = req.user.user_type;

      // Get booking details with authorization check
      let bookingQuery;
      if (userType === 'client') {
        bookingQuery = await client.query(
          'SELECT b.*, v.name as venue_name FROM bookings b JOIN venues v ON b.venue_id = v.id WHERE b.id = $1 AND b.client_id = $2',
          [id, userId]
        );
      } else if (userType === 'venue_owner') {
        bookingQuery = await client.query(
          'SELECT b.*, v.name as venue_name FROM bookings b JOIN venues v ON b.venue_id = v.id WHERE b.id = $1 AND v.owner_id = $2',
          [id, userId]
        );
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user type for this operation'
        });
      }

      if (bookingQuery.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      const booking = bookingQuery.rows[0];

      // Check if booking can be cancelled
      if (booking.booking_status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already cancelled'
        });
      }

      if (booking.booking_status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed booking'
        });
      }

      // For confirmed bookings, check cancellation policy
      if (booking.booking_status === 'confirmed') {
        const eventDate = new Date(booking.event_date);
        const now = new Date();
        const hoursDiff = (eventDate - now) / (1000 * 60 * 60);
        
        if (userType === 'client' && hoursDiff < 24) {
          return res.status(400).json({
            success: false,
            message: 'Cannot cancel booking less than 24 hours before the event',
            policy: 'Cancellations must be made at least 24 hours in advance'
          });
        }
      }

      // Cancel the booking
      const cancelReason = reason || `Cancelled by ${userType}`;
      await client.query(
        `UPDATE bookings 
         SET booking_status = 'cancelled', 
             special_requests = COALESCE(special_requests, '') || '\nCancellation: ' || $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id, cancelReason]
      );

      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
          booking_id: id,
          status: 'cancelled',
          cancellation_reason: cancelReason
        }
      });

    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    } finally {
      client.release();
    }
  }
);

// Get booking statistics for dashboard
router.get('/stats/overview', 
  authenticateJWT, 
  async (req, res) => {
    const client = await pool.connect();
    
    try {
      const userId = req.user.id;
      const userType = req.user.user_type;

      let statsQuery;
      if (userType === 'client') {
        statsQuery = `
          SELECT 
            COUNT(*) as total_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_bookings,
            COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE) as upcoming_bookings,
            COALESCE(SUM(total_amount) FILTER (WHERE booking_status IN ('confirmed', 'completed')), 0) as total_spent
          FROM bookings 
          WHERE client_id = $1
        `;
      } else if (userType === 'venue_owner') {
        statsQuery = `
          SELECT 
            COUNT(*) as total_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_bookings,
            COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_bookings,
            COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE) as upcoming_bookings,
            COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'completed'), 0) as total_revenue,
            COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'confirmed' AND event_date >= CURRENT_DATE), 0) as pending_revenue
          FROM bookings b
          JOIN venues v ON b.venue_id = v.id
          WHERE v.owner_id = $1
        `;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Invalid user type for this operation'
        });
      }

      const result = await client.query(statsQuery, [userId]);
      const stats = result.rows[0];

      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get booking stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch booking statistics'
      });
    } finally {
      client.release();
    }
  }
);

export default router;
