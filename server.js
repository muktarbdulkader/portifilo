const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const mongoose = require('mongoose');
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================== ENHANCED MONGODB CONNECTION ==================
let isConnected = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

const connectDB = async () => {
  // Return existing connection if healthy
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return mongoose.connection;
  }

  // If connection exists but isn't ready, close it
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log('🔄 Closed stale MongoDB connection');
    } catch (err) {
      console.warn('Warning closing connection:', err.message);
    }
  }

  try {
    console.log('🔄 Attempting MongoDB connection...');

    // Enhanced connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4, // Use IPv4
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, options);

    isConnected = true;
    connectionAttempts = 0;

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
      isConnected = true;
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

    // Handle process termination
    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    isConnected = false;
    connectionAttempts++;

    // Retry with exponential backoff
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
      console.log(`🔄 Retrying in ${delay}ms (${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})...`);

      return new Promise(resolve => {
        setTimeout(async () => {
          try {
            const conn = await connectDB();
            resolve(conn);
          } catch (retryErr) {
            resolve(null);
          }
        }, delay);
      });
    }

    console.error('❌ Max connection attempts reached');
    throw err;
  }
};

// Database connection middleware
const ensureDBConnection = async (req, res, next) => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Import Message model
const Message = require('./models/Message');

// ================== GMAIL APP PASSWORD CONFIGURATION ==================
// Sanitize env values
const EMAIL_USER = (process.env.EMAIL_USER || "").replace(/^"|"$/g, "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "")
  .replace(/^"|"$/g, "")
  .replace(/\s+/g, "")
  .trim();

// Verify Gmail App Password setup
console.log('\n📧 Gmail Configuration Check:');
console.log('Email User:', EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('Email Pass:', EMAIL_PASS ? '✅ Set' : '❌ Missing');

if (!EMAIL_USER || !EMAIL_PASS) {
  console.log('\n⚠️  IMPORTANT GMAIL SETUP INSTRUCTIONS:');
  console.log('1. Go to https://myaccount.google.com');
  console.log('2. Enable 2-Step Verification');
  console.log('3. Generate App Password:');
  console.log('   - Go to Security > App passwords');
  console.log('   - Select "Mail" as app');
  console.log('   - Select "Other" as device');
  console.log('   - Name it "Portfolio Server"');
  console.log('   - Copy the 16-character password');
  console.log('4. Set in .env file:');
  console.log('   EMAIL_USER="your-email@gmail.com"');
  console.log('   EMAIL_PASS="your-16-character-app-password"');
}

// Gmail transporter with proper configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development only
  }
});

// Verify email configuration on startup
async function verifyMail() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP verification failed:', error.message);

    if (error.code === 'EAUTH') {
      console.log('\n🔧 Gmail App Password Issues:');
      console.log('1. Ensure 2-Step Verification is enabled');
      console.log('2. Use App Password, NOT your regular password');
      console.log('3. App Password should be 16 characters');
      console.log('4. Try generating a new App Password');
    }

    return false;
  }
}

verifyMail();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact attempts. Please try again later."
  }
});

// ================== API ROUTES ==================

// Health check
app.get("/api/health", async (req, res) => {
  const dbStatus = isConnected && mongoose.connection.readyState === 1;
  const emailStatus = !!(EMAIL_USER && EMAIL_PASS);

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      email: emailStatus ? 'configured' : 'not configured',
      mongodbState: mongoose.STATES[mongoose.connection.readyState] || 'unknown'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all messages (admin only)
app.get("/api/messages", ensureDBConnection, async (req, res) => {
  try {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const allMessages = await Message.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: allMessages.length,
      messages: allMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages"
    });
  }
});

// Submit contact form
app.post("/api/contact", contactLimiter, ensureDBConnection, async (req, res) => {
  try {
    let { name, email, subject = '', message } = req.body;

    // Validation
    name = (name || "").trim();
    email = (email || "").trim();
    subject = (subject || "").trim();
    message = (message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, and message",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Sanitize inputs
    const escapeHtml = (str) => {
      if (!str || typeof str !== "string") return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const safeMessage = escapeHtml(message);
    const safeName = escapeHtml(name);

    // Save to database
    const newMessage = new Message({
      name: safeName,
      email: email,
      subject: subject,
      message: safeMessage,
      status: 'new'
    });

    const savedMessage = await newMessage.save();

    // Send immediate response
    res.json({
      success: true,
      message: `Thank you, ${safeName}! Your message has been received. I'll get back to you at ${email} soon.`,
      data: {
        id: savedMessage._id,
        name: savedMessage.name,
        email: savedMessage.email
      }
    });

    // Background email sending
    setTimeout(async () => {
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
              <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #4F46E5; margin-top: 0;">📩 New Contact Form Submission</h2>
                
                <div style="margin: 20px 0; padding: 20px; background: #f7f7f7; border-radius: 5px;">
                  <p><strong>👤 Name:</strong> ${savedMessage.name}</p>
                  <p><strong>📧 Email:</strong> ${savedMessage.email}</p>
                  <p><strong>📝 Subject:</strong> ${savedMessage.subject || 'No subject'}</p>
                  <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
                  <p><strong>💬 Message:</strong></p>
                  <p style="white-space: pre-wrap; background: white; padding: 15px; border-left: 4px solid #4F46E5; border-radius: 4px;">
                    ${savedMessage.message}
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px;">
                    Received: ${new Date().toLocaleString()} • ID: ${savedMessage._id}
                  </p>
                  <a href="mailto:${savedMessage.email}" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    ✉️ Reply to ${savedMessage.name}
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;

        const mailOptions = {
          from: `"Portfolio Contact" <${EMAIL_USER}>`,
          to: EMAIL_USER,
          subject: `📬 New Message from ${savedMessage.name} - Portfolio Contact`,
          html: emailContent,
          replyTo: savedMessage.email,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high'
          }
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email notification sent for message from ${savedMessage.name}`);

        // Update status
        savedMessage.status = 'sent';
        await savedMessage.save();

      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError.message);

        // Update status to failed
        savedMessage.status = 'failed';
        savedMessage.emailError = emailError.message;
        await savedMessage.save();
      }
    }, 100); // Small delay to ensure response is sent first
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your message. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Portfolio stats
app.get("/api/stats", ensureDBConnection, async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const newMessages = await Message.countDocuments({ status: 'new' });
    const sentMessages = await Message.countDocuments({ status: 'sent' });

    res.json({
      success: true,
      stats: {
        projectsCompleted: 15,
        yearsExperience: 3,
        happyClients: 10,
        cupsOfCoffee: "∞",
        messages: {
          total: totalMessages,
          new: newMessages,
          sent: sentMessages
        },
        technologies: [
          "HTML", "CSS", "JavaScript", "React",
          "Node.js", "PHP", "Python", "Kotlin",
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(200).json({
      success: true,
      stats: {
        projectsCompleted: 15,
        yearsExperience: 3,
        happyClients: 10,
        cupsOfCoffee: "∞",
        messages: {
          total: 0,
          new: 0,
          sent: 0
        },
        technologies: [
          "HTML", "CSS", "JavaScript", "React",
          "Node.js", "PHP", "Python", "Kotlin",
        ],
      },
    });
  }
});

// Projects
app.get("/api/projects", (req, res) => {
  const projects = [
    {
      id: 1,
      title: "Course Registration System",
      description: "A comprehensive web-based system for managing course registrations",
      technologies: ["React", "PHP", "MySQL"],
      githubUrl: "#",
      liveUrl: "#",
      featured: true,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"
    },
    {
      id: 2,
      title: "Staff Evaluation App",
      description: "Mobile application for evaluating staff performance",
      technologies: ["Kotlin", "Firebase", "Android"],
      githubUrl: "#",
      liveUrl: "#",
      featured: true,
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w-400"
    },
    {
      id: 3,
      title: "AI Recommender System",
      description: "Intelligent recommendation engine using machine learning",
      technologies: ["Python", "Flask", "TensorFlow"],
      githubUrl: "#",
      liveUrl: "#",
      featured: true,
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400"
    }
  ];
  res.json({ success: true, count: projects.length, projects });
});

// Test email endpoint
app.get("/api/test-email", async (req, res) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return res.status(500).json({
      success: false,
      message: "Email not configured. Check EMAIL_USER and EMAIL_PASS environment variables."
    });
  }

  try {
    const testMailOptions = {
      from: `"Portfolio Test" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "✅ Portfolio Email Test - Successful",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            <h1 style="color: #10B981; text-align: center;">✅ Email Test Successful!</h1>
            <p>Your portfolio email configuration is working correctly.</p>
            <div style="background: #f7f7f7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Server:</strong> ${req.get("host")}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>From:</strong> ${EMAIL_USER}</p>
              <p><strong>To:</strong> ${EMAIL_USER}</p>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">
              This is an automated test from your portfolio server.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(testMailOptions);
    res.json({
      success: true,
      message: "Test email sent successfully! Check your inbox.",
      info: {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
      help: "Make sure you're using an App Password, not your regular Gmail password."
    });
  }
});

// Import admin routes
const adminRoutes = require('./router/adminRoutes');
app.use('/api/admin', ensureDBConnection, adminRoutes);

// ================== STATIC FILES & FRONTEND ==================

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// Serve static files from image directory
app.use('/image', express.static(path.join(__dirname, 'image')));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve admin.html
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Newsletter endpoint
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address"
    });
  }

  res.json({
    success: true,
    message: "Thank you for subscribing! You'll receive updates soon."
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ================== START SERVER ==================

// Initialize database connection on startup
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║     🚀 Portfolio Server Running Successfully!                       ║
║                                                                      ║
║     📍 Local:  http://localhost:${PORT}                             ║
║     📍 Admin:  http://localhost:${PORT}/admin                       ║
║     📧 Email:  ${EMAIL_USER || "⚠️ Not configured"}                 ║
║     💾 MongoDB: ${isConnected ? "✅ Connected" : "❌ Disconnected"}  ║
║                                                                      ║
║     🔍 Available Endpoints:                                         ║
║     • GET  /api/health      - Health check                          ║
║     • GET  /api/stats       - Portfolio statistics                  ║
║     • GET  /api/projects    - Projects list                         ║
║     • POST /api/contact     - Contact form                          ║
║     • POST /api/subscribe   - Newsletter subscription               ║
║     • GET  /api/test-email  - Test email configuration              ║
║                                                                      ║
║     🔐 Admin Endpoints (Require x-admin-token header):             ║
║     • GET  /api/messages    - Get all messages                      ║
║     • POST /api/admin/login - Admin authentication                  ║
║                                                                      ║
║     ⚙️  Environment Variables Check:                               ║
║     • MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'} ║
║     • EMAIL_USER:  ${EMAIL_USER ? '✅ Set' : '❌ Missing'}            ║
║     • EMAIL_PASS:  ${EMAIL_PASS ? '✅ Set' : '❌ Masked'}             ║
║     • ADMIN_TOKEN: ${process.env.ADMIN_TOKEN ? '✅ Set' : '❌ Missing'} ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

module.exports = app;