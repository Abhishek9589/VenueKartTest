import pool from './database.js';

// Update existing bookings table to add payment columns
export async function addPaymentColumns() {
  try {
    console.log('Adding payment columns to bookings table...');

    // Add payment_status column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_status ENUM('not_required', 'pending', 'completed', 'failed') DEFAULT 'not_required'
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add razorpay_order_id column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255)
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add razorpay_payment_id column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add payment_completed_at column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP NULL
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add payment_error_description column
    await pool.execute(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS payment_error_description TEXT
    `).catch(err => {
      if (!err.message.includes('Duplicate column name')) {
        throw err;
      }
    });

    // Add indexes if they don't exist
    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_payment_status (payment_status)
    `).catch(err => {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
    });

    await pool.execute(`
      ALTER TABLE bookings 
      ADD INDEX IF NOT EXISTS idx_razorpay_order (razorpay_order_id)
    `).catch(err => {
      if (!err.message.includes('Duplicate key name')) {
        throw err;
      }
    });

    console.log('Payment columns added successfully to bookings table');
  } catch (error) {
    console.error('Error adding payment columns:', error);
  }
}
