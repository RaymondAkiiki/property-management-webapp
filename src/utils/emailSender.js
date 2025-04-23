const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

/**
 * Send email function
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - HTML body (optional)
 * @param {Array} [options.attachments] - Array of attachment objects (optional)
 * @returns {Promise<Object>} - Nodemailer info object
 */
exports.sendEmail = async (options) => {
  try {
    // Default from address
    const from = `${config.appName} <${config.email.from}>`;
    
    // Message object
    const message = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
    };
    
    // Add HTML content if provided
    if (options.html) {
      message.html = options.html;
    }
    
    // Add attachments if provided
    if (options.attachments && Array.isArray(options.attachments)) {
      message.attachments = options.attachments;
    }
    
    // Send mail with defined transport object
    const info = await transporter.sendMail(message);
    
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// Add a test function for development purposes
exports.testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email server connection verified');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};