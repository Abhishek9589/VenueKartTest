import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOTPEmail(email, otp, name = 'User', purpose = 'Verification') {
  const isPasswordReset = purpose === 'Password Reset';
  const isEmailUpdate = purpose === 'Email Update';
  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: isPasswordReset ? 'Your VenueKart Password Reset Code' :
             isEmailUpdate ? 'Verify Your New Email Address' :
             'Your VenueKart Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 28px;">VenueKart</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">Venue Booking Made Simple</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${name}!</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            ${isPasswordReset
              ? 'You requested to reset your password. Please use the verification code below to proceed:'
              : isEmailUpdate
              ? 'You requested to update your email address. Please use the verification code below to verify your new email:'
              : 'Thank you for signing up with VenueKart. To complete your registration, please use the verification code below:'
            }
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #6C63FF; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>

          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
            This code will expire in 10 minutes for security reasons.
          </p>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              ${isPasswordReset
                ? 'If you didn\'t request a password reset, please ignore this email.'
                : isEmailUpdate
                ? 'If you didn\'t request an email update, please ignore this email.'
                : 'If you didn\'t request this verification, please ignore this email.'
              }
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Send venue inquiry email to venue owner (customer contact details hidden)
export async function sendVenueInquiryEmail(ownerEmail, inquiryData) {
  const { venue, customer, event, owner } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: ownerEmail,
    subject: `New Booking Inquiry - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6C63FF; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #6C63FF; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">New Booking Inquiry</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">You have a new booking inquiry!</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            A customer is interested in booking your venue <strong style="color: #3C3B6E;">${venue.name}</strong>. Here are the details:
          </p>

          <!-- Venue Details -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">📍 Venue Details</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Price per Day:</strong> ₹${venue.price}</p>
          </div>

          <!-- Customer Information (Limited) -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px; font-weight: 600;">👤 Customer Details</h3>
            <p style="margin: 8px 0;"><strong>Customer Full Name:</strong> ${customer.name}</p>
            <p style="color: #92400e; font-style: italic; margin-top: 15px; font-size: 14px;">ℹ️ Customer contact details are protected for privacy. VenueKart will share them upon inquiry acceptance.</p>
          </div>

          <!-- Event Details -->
          <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px; font-weight: 600;">🎉 Event Details</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <!-- Venue Owner Details -->
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0; font-size: 18px; font-weight: 600;">🏢 Your Contact Information</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${owner.email || ownerEmail}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${owner.phone || 'Not provided'}</p>
          </div>

          <!-- Action Required -->
          <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; border: 2px solid #0ea5e9; margin: 30px 0; text-align: center;">
            <h3 style="color: #0c4a6e; margin-top: 0;">⏱️ Action Required</h3>
            <p style="color: #0c4a6e; margin-bottom: 20px; font-size: 16px;">Please review this inquiry and respond through your VenueKart dashboard within 24 hours.</p>
            <p style="color: #64748b; font-size: 14px;">Log in to your VenueKart account to accept or decline this inquiry.</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              This inquiry was submitted through VenueKart. Customer contact details will be shared upon acceptance.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Venue inquiry email sent successfully to ${ownerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending venue inquiry email:', error);
    return false;
  }
}

// Send inquiry notification to VenueKart admin (with full customer details)
export async function sendInquiryNotificationToVenueKart(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `New Venue Inquiry - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6C63FF; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #dc2626; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">🚨 ADMIN NOTIFICATION</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">New Venue Inquiry Received</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            A new venue inquiry has been submitted through the platform. Full details below:
          </p>

          <!-- Inquiry Summary Alert -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 25px 0;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px; font-weight: 600;">📋 Inquiry Summary</h3>
            <p style="margin: 8px 0;"><strong>Venue:</strong> ${venue.name} (ID: ${venue.id || 'N/A'})</p>
            <p style="margin: 8px 0;"><strong>Customer:</strong> ${customer.name}</p>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
          </div>

          <!-- Venue Details -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">🏢 Venue Details</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Price per Day:</strong> ₹${venue.price}</p>
          </div>

          <!-- FULL Customer Details (Admin Gets Everything) -->
          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 18px; font-weight: 600;">👤 Customer Details (FULL ACCESS)</h3>
            <p style="margin: 8px 0;"><strong>Full Name:</strong> ${customer.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${customer.email}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${customer.phone}</p>
            <p style="color: #dc2626; font-weight: 500; font-style: italic; margin-top: 15px; font-size: 14px;">⚠️ Admin receives full customer contact information</p>
          </div>

          <!-- Event Details -->
          <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px; font-weight: 600;">🎉 Event Details</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <!-- Venue Owner Details -->
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0; font-size: 18px; font-weight: 600;">🏠 Venue Owner Details</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${owner.email || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${owner.phone || 'Not provided'}</p>
          </div>

          <!-- Admin Action Notes -->
          <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; border: 2px solid #0ea5e9; margin: 30px 0; text-align: center;">
            <h3 style="color: #0c4a6e; margin-top: 0;">📊 Admin Monitoring</h3>
            <p style="color: #0c4a6e; margin-bottom: 15px; font-size: 16px;">This inquiry has been logged for tracking and quality assurance.</p>
            <p style="color: #64748b; font-size: 14px;">Customer contact details are protected from venue owner until inquiry is accepted.</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              Inquiry submitted at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`VenueKart admin notification email sent successfully`);
    return true;
  } catch (error) {
    console.error('Error sending VenueKart admin notification email:', error);
    return false;
  }
}

// Send booking confirmation email to customer
export async function sendBookingConfirmationEmail(customerEmail, bookingData) {
  const { customer, venue, event, bookingId } = bookingData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Booking Confirmed - ${venue.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 28px;">VenueKart</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">Booking Confirmation</p>
          </div>

          <div style="background: #dcfce7; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin: 30px 0;">
            <h2 style="color: #15803d; margin: 0 0 10px 0;">🎉 Booking Confirmed!</h2>
            <p style="color: #166534; margin: 0; font-size: 16px;">Your venue booking has been confirmed by the venue owner.</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${customer.name}!</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Great news! Your booking request for <strong>${venue.name}</strong> has been confirmed. Here are your booking details:
          </p>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> #${bookingId}</p>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Location:</strong> ${venue.location}</p>
            <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Event Type:</strong> ${event.type}</p>
            <p><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p><strong>Amount:</strong> ₹${event.amount}</p>
          </div>

          ${event.specialRequests && event.specialRequests !== 'None' ? `
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Special Requests</h3>
            <p>${event.specialRequests}</p>
          </div>
          ` : ''}

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 30px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Next Steps</h3>
            <p style="color: #92400e; margin-bottom: 10px;">1. The venue owner will contact you directly to finalize payment and event details.</p>
            <p style="color: #92400e; margin: 0;">2. Please keep this email as confirmation of your booking.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 20px;">Thank you for choosing VenueKart for your event needs!</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you have any questions, please contact us or the venue owner directly.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
}

// Send booking rejection email to customer
// Send inquiry acceptance email to VenueKart admin
export async function sendInquiryAcceptedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `Venue Inquiry Accepted - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #16a34a; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">🎉 INQUIRY ACCEPTED</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Venue Inquiry Has Been Accepted!</h2>

          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; margin: 25px 0;">
            <h3 style="color: #15803d; margin-top: 0; font-size: 18px; font-weight: 600;">✅ Status Update</h3>
            <p style="color: #15803d; margin: 8px 0; font-size: 16px; font-weight: 500;">The venue owner has ACCEPTED the booking inquiry.</p>
          </div>

          <!-- All Inquiry Details (Same as initial admin email) -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">🏢 Venue Details</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Price per Day:</strong> ₹${venue.price}</p>
          </div>

          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 18px; font-weight: 600;">👤 Customer Details</h3>
            <p style="margin: 8px 0;"><strong>Full Name:</strong> ${customer.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${customer.email}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${customer.phone}</p>
          </div>

          <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px; font-weight: 600;">🎉 Event Details</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0; font-size: 18px; font-weight: 600;">🏠 Venue Owner Details</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${owner.email || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${owner.phone || 'Not provided'}</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              Inquiry accepted at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry acceptance email to admin:', error);
    return false;
  }
}

// Send inquiry acceptance email to customer
export async function sendInquiryAcceptedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event, owner } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Your Venue Inquiry Has Been Accepted - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #16a34a; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">🎉 Great News!</p>
          </div>

          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; margin: 30px 0;">
            <h2 style="color: #15803d; margin: 0 0 15px 0; font-size: 24px;">Your Venue Inquiry Has Been Accepted! 🎉</h2>
            <p style="color: #166534; margin: 0; font-size: 16px;">The venue owner has accepted your booking inquiry for <strong>${venue.name}</strong>.</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 22px;">Hello ${customer.name}!</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Fantastic news! Your venue inquiry has been accepted. Here are the details and next steps:
          </p>

          <!-- Venue Details -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">🏢 Venue Information</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Price per Day:</strong> ₹${venue.price}</p>
          </div>

          <!-- Event Details -->
          <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px; font-weight: 600;">🎉 Your Event Details</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <!-- Venue Owner Contact -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0; font-size: 18px; font-weight: 600;">📞 Venue Owner Contact</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${owner.email || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${owner.phone || 'Not provided'}</p>
            <p style="color: #92400e; font-style: italic; margin-top: 15px; font-size: 14px;">💡 You can now contact the venue owner directly to finalize your booking details.</p>
          </div>

          <!-- Next Steps -->
          <div style="background: #f0f9ff; padding: 25px; border-radius: 12px; border: 2px solid #0ea5e9; margin: 30px 0;">
            <h3 style="color: #0c4a6e; margin-top: 0; font-size: 18px;">📋 Next Steps</h3>
            <ol style="color: #0c4a6e; margin: 15px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Contact the venue owner using the details above</li>
              <li style="margin: 8px 0;">Discuss final arrangements and payment terms</li>
              <li style="margin: 8px 0;">Confirm your booking and finalize the contract</li>
            </ol>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              Thank you for choosing VenueKart for your venue booking needs!
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry acceptance email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry acceptance email to customer:', error);
    return false;
  }
}

// Send inquiry rejection email to VenueKart admin
export async function sendInquiryRejectedToAdmin(inquiryData) {
  const { venue, customer, event, owner } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `Venue Inquiry Declined - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ef4444; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #ef4444; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">❌ INQUIRY DECLINED</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 24px;">Venue Inquiry Has Been Declined</h2>

          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 25px 0;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 18px; font-weight: 600;">❌ Status Update</h3>
            <p style="color: #dc2626; margin: 8px 0; font-size: 16px; font-weight: 500;">The venue owner has DECLINED the booking inquiry.</p>
          </div>

          <!-- All Inquiry Details (Same as initial admin email) -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">🏢 Venue Details</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Price per Day:</strong> ₹${venue.price}</p>
          </div>

          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #dc2626; margin-top: 0; font-size: 18px; font-weight: 600;">👤 Customer Details</h3>
            <p style="margin: 8px 0;"><strong>Full Name:</strong> ${customer.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${customer.email}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${customer.phone}</p>
          </div>

          <div style="background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #5b21b6; margin-top: 0; font-size: 18px; font-weight: 600;">🎉 Event Details</h3>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0; font-size: 18px; font-weight: 600;">🏠 Venue Owner Details</h3>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${owner.email || 'Not provided'}</p>
            <p style="margin: 8px 0;"><strong>Phone Number:</strong> ${owner.phone || 'Not provided'}</p>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              Inquiry declined at ${new Date().toLocaleString('en-IN')}
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection notification sent to admin successfully`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry rejection email to admin:', error);
    return false;
  }
}

// Send inquiry rejection email to customer
export async function sendInquiryRejectedToCustomer(customerEmail, inquiryData) {
  const { venue, customer, event } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Your Venue Inquiry Has Been Declined - ${venue.name}`,
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- VenueKart Header -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6C63FF; padding-bottom: 20px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 32px; font-weight: 700;">VenueKart</h1>
            <p style="color: #6C63FF; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Inquiry Update</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px; font-size: 22px;">Hello ${customer.name},</h2>

          <div style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 30px 0;">
            <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 20px;">Inquiry Status Update</h3>
            <p style="color: #991b1b; margin: 0; font-size: 16px;">Unfortunately, your venue inquiry for <strong>${venue.name}</strong> could not be confirmed at this time.</p>
          </div>

          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We understand this may be disappointing. The venue owner was unable to accommodate your request for the specified date and requirements.
          </p>

          <!-- Inquiry Details -->
          <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6C63FF;">
            <h3 style="color: #3C3B6E; margin-top: 0; font-size: 18px; font-weight: 600;">📋 Your Inquiry Details</h3>
            <p style="margin: 8px 0;"><strong>Venue Name:</strong> ${venue.name}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${venue.location}</p>
            <p style="margin: 8px 0;"><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 8px 0;"><strong>Event Type:</strong> ${event.type}</p>
            <p style="margin: 8px 0;"><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p style="margin: 8px 0;"><strong>Special Requests:</strong> ${event.specialRequests || 'None'}</p>
          </div>

          <!-- Alternative Options -->
          <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #0284c7;">
            <h3 style="color: #0c4a6e; margin-top: 0; font-size: 18px; font-weight: 600;">🔍 What you can do next:</h3>
            <ul style="color: #0c4a6e; margin: 15px 0; padding-left: 20px;">
              <li style="margin: 8px 0;"><strong>Browse alternative venues</strong> - We have many other great venues that might suit your needs</li>
              <li style="margin: 8px 0;"><strong>Try different dates</strong> - The venue might be available on other dates</li>
              <li style="margin: 8px 0;"><strong>Contact our support team</strong> - We can help you find suitable alternatives</li>
            </ul>
          </div>

          <!-- Browse More Venues CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 20px; font-size: 16px;">Don't give up on your perfect event! Let us help you find another amazing venue.</p>
            <a href="${process.env.FRONTEND_URL || 'https://venuekart.com'}/venues" style="background: linear-gradient(135deg, #6C63FF 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              🔍 Browse Other Venues
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 2px solid #e2e8f0; margin-top: 40px; padding-top: 25px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #3C3B6E; margin: 0; font-size: 20px;">VenueKart</h3>
              <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Venue Booking Made Simple</p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 10px 0;">
              We're sorry this didn't work out, but we're here to help you find the perfect venue for your event!
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} VenueKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inquiry rejection email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending inquiry rejection email to customer:', error);
    return false;
  }
}

export async function sendBookingRejectionEmail(customerEmail, bookingData) {
  const { customer, venue, event, bookingId } = bookingData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: customerEmail,
    subject: `Booking Update - ${venue.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 28px;">VenueKart</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">Booking Update</p>
          </div>

          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 30px 0;">
            <h2 style="color: #dc2626; margin: 0 0 10px 0;">Booking Status Update</h2>
            <p style="color: #991b1b; margin: 0; font-size: 16px;">Unfortunately, your booking request could not be confirmed.</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${customer.name},</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            We regret to inform you that your booking request for <strong>${venue.name}</strong> on ${new Date(event.date).toLocaleDateString()} could not be confirmed by the venue owner.
          </p>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> #${bookingId}</p>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Location:</strong> ${venue.location}</p>
            <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Event Type:</strong> ${event.type}</p>
            <p><strong>Guest Count:</strong> ${event.guestCount}</p>
          </div>

          <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid #0284c7; margin: 30px 0;">
            <h3 style="color: #0c4a6e; margin-top: 0;">What you can do next:</h3>
            <p style="color: #0c4a6e; margin-bottom: 10px;">1. <strong>Browse alternative venues</strong> - We have many other great venues that might suit your needs.</p>
            <p style="color: #0c4a6e; margin-bottom: 10px;">2. <strong>Try different dates</strong> - The venue might be available on other dates.</p>
            <p style="color: #0c4a6e; margin: 0;">3. <strong>Contact us</strong> - Our team can help you find suitable alternatives.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 20px;">We're sorry this didn't work out, but we're here to help you find the perfect venue for your event!</p>
            <a href="${process.env.FRONTEND_URL || 'https://venuekart.com'}" style="background: #6C63FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Browse Other Venues
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Thank you for choosing VenueKart. We appreciate your understanding.
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking rejection email sent successfully to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending booking rejection email:', error);
    return false;
  }
}
