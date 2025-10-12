const nodemailer = require("nodemailer");

// Create transporter with SMTP configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // SSL on 465, STARTTLS on 587
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  // Gmail-specific options for Render deployment
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Connection timeout settings
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000,   // 30 seconds
  socketTimeout: 60000      // 60 seconds
});

// Debug SMTP configuration
console.log("🔍 SMTP Configuration Debug:");
console.log("Host:", smtpHost);
console.log("Port:", smtpPort);
console.log("User:", smtpUser);
console.log("Pass length:", smtpPass ? smtpPass.length : "undefined");
console.log("Pass starts with:", smtpPass ? smtpPass.substring(0, 5) + "..." : "undefined");

// Verify configuration once on startup (helps diagnose EAUTH/EHOST issues)
transporter.verify().then(() => {
  console.log("📧 SMTP transporter verified (", smtpHost, ":", smtpPort, ")");
}).catch((err) => {
  console.error("❌ SMTP verify failed:", err.message);
  console.error("❌ Full error:", err);
});

// Helper function to send password reset OTP with timeout
async function sendPasswordResetOtp({ to, otp }) {
  const EMAIL_TIMEOUT = 30000; // 30 seconds timeout
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || smtpUser,
      to: to,
      subject: "Password Reset OTP - Smart Finance",
      text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nThis is an automated email, please do not reply.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007dff;">Password Reset Request</h2>
          <p>Your password reset OTP is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007dff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
      replyTo: process.env.EMAIL_NOREPLY || process.env.EMAIL_FROM || smtpUser,
    };

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Email sending timeout - SMTP server is not responding"));
      }, EMAIL_TIMEOUT);
    });

    // Race between email sending and timeout
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      timeoutPromise
    ]);

    console.log("Password reset OTP sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send password reset OTP:", error);
    
    // Handle specific error types
    if (error.message.includes("timeout")) {
      console.error("SMTP timeout - server is not responding within 30 seconds");
      throw new Error("Email service is temporarily unavailable. Please try again in a few moments.");
    } else if (error && error.responseCode === 535) {
      console.error("Hint: Gmail requires an App Password. Set SMTP_USER to your Gmail and SMTP_PASS to a 16-char App Password. See: https://support.google.com/mail/answer/185833");
      throw new Error("Email configuration error. Please contact support.");
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error("SMTP connection failed:", error.code);
      throw new Error("Email service is currently unavailable. Please try again later.");
    }
    
    throw new Error("Failed to send OTP email. Please try again.");
  }
}

// Helper to send welcome email after registration with timeout
async function sendWelcomeEmail({ to, username, firstName }) {
  const EMAIL_TIMEOUT = 30000; // 30 seconds timeout
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || smtpUser,
      to,
      subject: "Welcome to Smart Finance 🎉",
      text: `Hi ${firstName || username || "there"},\n\nWelcome to Smart Finance! Start tracking your income and expenses today.\n\nNeed help? Visit your dashboard or our help section.\n\nThis is an automated email, please do not reply.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007dff;">Welcome to Smart Finance 🎉</h2>
          <p>Hi <strong>${firstName || username || "there"}</strong>,</p>
          <p>Thanks for signing up! You're all set to track your income and expenses.</p>
          <p>Need help? Visit your dashboard or our help section.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `,
      replyTo: process.env.EMAIL_NOREPLY || process.env.EMAIL_FROM || smtpUser,
    };

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Email sending timeout - SMTP server is not responding"));
      }, EMAIL_TIMEOUT);
    });

    // Race between email sending and timeout
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      timeoutPromise
    ]);

    console.log("Welcome email sent:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    
    // Handle specific error types
    if (error.message.includes("timeout")) {
      console.error("SMTP timeout - server is not responding within 30 seconds");
      // Don't throw error for welcome email - it's not critical
      return { success: false, error: "Welcome email failed to send" };
    }
    
    // For welcome email, we don't want to block registration
    console.error("Welcome email failed, but registration continues:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendPasswordResetOtp,
  sendWelcomeEmail,
};
