import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendVenueInquiryEmail, sendInquiryNotificationToVenueKart } from '../services/emailService.js';

const router = Router();

// Get bookings for venue owner (protected)
router.get('/owner', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT b.*, v.name as venue_name, v.location as venue_location
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
    `;
    
    const params = [ownerId];
    
    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [bookings] = await pool.execute(query, params);
    
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount)
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get customer bookings (protected)
router.get('/customer', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name, v.location as venue_location,
             u.name as owner_name, u.mobile_number as owner_phone
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      JOIN users u ON v.owner_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [customerId, parseInt(limit), parseInt(offset)]);
    
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount)
    }));
    
    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create new booking (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { 
      venueId, 
      eventDate, 
      eventType, 
      guestCount, 
      amount,
      customerName,
      customerEmail,
      customerPhone,
      specialRequirements
    } = req.body;
    
    // Validation
    if (!venueId || !eventDate || !guestCount || !amount || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Check if venue exists and is active
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ? AND status = "active"',
      [venueId]
    );
    
    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found or inactive' });
    }
    
    const venue = venues[0];
    
    // Check venue capacity
    if (guestCount > venue.capacity) {
      return res.status(400).json({ 
        error: `Guest count exceeds venue capacity (${venue.capacity})` 
      });
    }
    
    // Check if date is available (no confirmed bookings on same date)
    const [existingBookings] = await pool.execute(`
      SELECT * FROM bookings 
      WHERE venue_id = ? AND event_date = ? AND status = 'confirmed'
    `, [venueId, eventDate]);
    
    if (existingBookings.length > 0) {
      return res.status(400).json({ error: 'Venue is not available on this date' });
    }
    
    // Create booking
    const [result] = await pool.execute(`
      INSERT INTO bookings (
        venue_id, customer_id, customer_name, customer_email, customer_phone,
        event_date, event_type, guest_count, amount, special_requirements
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      venueId, customerId, customerName, customerEmail, customerPhone,
      eventDate, eventType, guestCount, amount, specialRequirements
    ]);
    
    res.status(201).json({ 
      message: 'Booking created successfully',
      bookingId: result.insertId
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status (protected - venue owner only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ownerId = req.user.id;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Check if booking belongs to owner's venue
    const [bookings] = await pool.execute(`
      SELECT b.*, v.owner_id
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.id = ? AND v.owner_id = ?
    `, [id, ownerId]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }
    
    // Update booking status
    await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // If confirmed, increment venue booking count
    if (status === 'confirmed') {
      await pool.execute(
        'UPDATE venues SET total_bookings = total_bookings + 1 WHERE id = ?',
        [bookings[0].venue_id]
      );
    }
    
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get recent bookings for dashboard (protected)
router.get('/owner/recent', authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { limit = 5 } = req.query;

    const [bookings] = await pool.execute(`
      SELECT b.*, v.name as venue_name
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE v.owner_id = ?
      ORDER BY b.created_at DESC
      LIMIT ?
    `, [ownerId, parseInt(limit)]);

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      amount: parseFloat(booking.amount)
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Send venue inquiry (protected)
router.post('/inquiry', authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      venue_id,
      venue_name,
      user_details,
      event_date,
      venue_owner
    } = req.body;

    // Validation
    if (!venue_id || !venue_name || !user_details || !event_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate user_details structure
    const { fullName, email, phone, eventType, guestCount } = user_details;
    if (!fullName || !email || !phone || !eventType || !guestCount) {
      return res.status(400).json({ error: 'User details incomplete' });
    }

    // Check if venue exists
    const [venues] = await pool.execute(
      'SELECT * FROM venues WHERE id = ?',
      [venue_id]
    );

    if (venues.length === 0) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const venue = venues[0];

    // Create inquiry record
    try {
      await pool.execute(`
        INSERT INTO venue_inquiries (
          venue_id, customer_id, customer_name, customer_email, customer_phone,
          event_date, event_type, guest_count, special_requirements, inquiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        venue_id, customerId, fullName, email, phone,
        event_date, eventType, guestCount, user_details.specialRequests || null
      ]);
    } catch (dbError) {
      // If table doesn't exist, continue without database logging
      console.log('Inquiry table not available, proceeding with email notifications');
    }

    // Prepare inquiry data for emails
    const inquiryData = {
      venue: {
        id: venue_id,
        name: venue_name,
        location: venue.location || 'Location not specified',
        price: venue.price_per_day || venue.price || 'Price not specified'
      },
      customer: {
        name: fullName,
        email: email,
        phone: phone
      },
      event: {
        type: eventType,
        date: event_date,
        guestCount: guestCount,
        specialRequests: user_details.specialRequests || 'None'
      },
      owner: venue_owner || {
        name: 'Venue Owner',
        email: 'owner@venue.com'
      }
    };

    // Send emails
    try {
      // Send notification to venue owner
      if (venue_owner && venue_owner.email) {
        await sendVenueInquiryEmail(venue_owner.email, inquiryData);
      }

      // Send notification to VenueKart team
      await sendInquiryNotificationToVenueKart(inquiryData);

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the request if emails fail
    }

    res.status(201).json({
      message: 'Inquiry sent successfully! The venue owner and our team have been notified.',
      inquiryId: Date.now() // Use timestamp as fallback ID
    });
  } catch (error) {
    console.error('Error processing venue inquiry:', error);
    res.status(500).json({ error: 'Failed to process inquiry' });
  }
});

export default router;
