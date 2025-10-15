const nodemailer = require("nodemailer");

// Create transporter with SMTP configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Validate required environment variables
if (!smtpHost || !smtpUser || !smtpPass) {
  console.error("❌ Missing required SMTP environment variables:");
  console.error("SMTP_HOST:", smtpHost ? "✅ Set" : "❌ Missing");
  console.error("SMTP_USER:", smtpUser ? "✅ Set" : "❌ Missing");
  console.error("SMTP_PASS:", smtpPass ? "✅ Set" : "❌ Missing");
  console.error("Please set all required SMTP environment variables");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // SSL on 465, STARTTLS on 587
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  // Generic SMTP configuration for any provider
  tls: {
    rejectUnauthorized: false
  },
  // Standard timeout settings
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 15000,   // 15 seconds
  socketTimeout: 30000      // 30 seconds
});

// Debug SMTP configuration
console.log("🔍 SMTP Configuration Debug:");
console.log("Host:", smtpHost);
console.log("Port:", smtpPort);
console.log("User:", smtpUser);
console.log("Pass length:", smtpPass ? smtpPass.length : "undefined");
console.log("Pass starts with:", smtpPass ? smtpPass.substring(0, 5) + "..." : "undefined");

// Verify configuration once on startup (helps diagnose EAUTH/EHOST issues)
if (smtpHost && smtpUser && smtpPass) {
  transporter.verify().then(() => {
    console.log("📧 SMTP transporter verified (", smtpHost, ":", smtpPort, ")");
  }).catch((err) => {
    console.error("❌ SMTP verify failed:", err.message);
    console.error("❌ Full error:", err);
  });
} else {
  console.error("❌ Skipping SMTP verification - missing credentials");
}

// Helper function to send password reset OTP with timeout
async function sendPasswordResetOtp({ to, otp }) {
  const EMAIL_TIMEOUT = 30000; // 30 seconds timeout
  
  // Check if SMTP is properly configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("❌ Cannot send email - SMTP not configured");
    throw new Error("Email service is not configured. Please contact support.");
  }
  
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
      console.error("Hint: Authentication failed. Check your SMTP credentials:");
      console.error("- For Gmail: Use App Password (16 characters)");
      console.error("- For other providers: Check username/password");
      throw new Error("Email configuration error. Please contact support.");
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error("SMTP connection failed:", error.code);
      throw new Error("Email service is currently unavailable. Please try again later.");
    }
    
    throw new Error("Failed to send OTP email. Please try again.");
  }
}


module.exports = {
  sendPasswordResetOtp,
};
