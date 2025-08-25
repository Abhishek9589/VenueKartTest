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

// Send venue inquiry email to venue owner
export async function sendVenueInquiryEmail(ownerEmail, inquiryData) {
  const { venue, customer, event } = inquiryData;

  const mailOptions = {
    from: {
      name: 'VenueKart',
      address: process.env.EMAIL_USER
    },
    to: ownerEmail,
    subject: `New Venue Inquiry for ${venue.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 28px;">VenueKart</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">New Venue Inquiry</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px;">You have a new inquiry!</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            A customer is interested in booking your venue <strong>${venue.name}</strong>. Here are the details:
          </p>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Venue Details</h3>
            <p><strong>Venue:</strong> ${venue.name}</p>
            <p><strong>Location:</strong> ${venue.location}</p>
            <p><strong>Price:</strong> ₹${venue.price}/day</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${customer.name}</p>
            <p><strong>Email:</strong> ${customer.email}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Event Details</h3>
            <p><strong>Event Type:</strong> ${event.type}</p>
            <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Guest Count:</strong> ${event.guestCount}</p>
            <p><strong>Special Requests:</strong> ${event.specialRequests}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #475569; margin-bottom: 20px;">Please contact the customer to discuss their requirements and finalize the booking.</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This inquiry was submitted through VenueKart. Please respond within 24 hours for the best customer experience.
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

// Send inquiry notification to VenueKart team
export async function sendInquiryNotificationToVenueKart(inquiryData) {
  const { venue, customer, event } = inquiryData;
  const venuekartEmail = process.env.VENUEKART_ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: {
      name: 'VenueKart System',
      address: process.env.EMAIL_USER
    },
    to: venuekartEmail,
    subject: `New Venue Inquiry - ${venue.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: white; padding: 40px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3C3B6E; margin: 0; font-size: 28px;">VenueKart</h1>
            <p style="color: #64748b; margin: 10px 0 0 0;">Team Notification</p>
          </div>

          <h2 style="color: #1e293b; margin-bottom: 20px;">New Venue Inquiry Received</h2>

          <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            A new venue inquiry has been submitted through the platform. Details below:
          </p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Inquiry Summary</h3>
            <p><strong>Venue:</strong> ${venue.name} (ID: ${venue.id})</p>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Event Type:</strong> ${event.type}</p>
            <p><strong>Guest Count:</strong> ${event.guestCount}</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${customer.name}</p>
            <p style="color: #64748b; font-size: 14px; font-style: italic;">Contact details have been sent directly to the venue owner for privacy protection.</p>
          </div>

          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Venue Information</h3>
            <p><strong>Venue Name:</strong> ${venue.name}</p>
            <p><strong>Location:</strong> ${venue.location}</p>
            <p><strong>Price:</strong> ₹${venue.price}/day</p>
          </div>

          ${event.specialRequests !== 'None' ? `
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C3B6E; margin-top: 0;">Special Requests</h3>
            <p>${event.specialRequests}</p>
          </div>
          ` : ''}

          <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Inquiry submitted at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`VenueKart team notification email sent successfully`);
    return true;
  } catch (error) {
    console.error('Error sending VenueKart team notification email:', error);
    return false;
  }
}
