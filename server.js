const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')
// optional SendGrid support (HTTP API) to avoid SMTP port blocking
let sendgrid = null;
if (process.env.SENDGRID_API_KEY) {
  try {
    sendgrid = require("@sendgrid/mail");
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (e) {
    console.warn(
      "@sendgrid/mail not installed or failed to load:",
      e.message || e
    );
    sendgrid = null;
  }
}
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import Message model
const Message = require('./models/Message');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiter for contact submissions to prevent abuse
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 6, // limit each IP to 6 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Email configuration
// Sanitize env values (remove quotes and spaces for Gmail App Password)
const EMAIL_USER = (process.env.EMAIL_USER || "").replace(/^"|"$/g, "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "")
  .replace(/^"|"$/g, "")
  .replace(/\s+/g, "")
  .trim();

// Prefer explicit SMTP configuration for Gmail (works well with App Passwords)
// Email configuration (Gmail SMTP for Render)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Use 587 for TLS
  secure: false, // false because we are using STARTTLS
  requireTLS: true, // enforce TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify email capability on startup. Prefer SendGrid if configured.
async function verifyMail() {
  if (sendgrid) {
    try {
      // There is no verify method for SendGrid; do a lightweight sanity check using API key by listing templates (not ideal)
      console.log(
        "Using SendGrid for email delivery (SENDGRID_API_KEY present)"
      );
      return true;
    } catch (e) {
      console.warn("SendGrid sanity check failed:", e.message || e);
      return false;
    }
  }

  return new Promise((resolve) => {
    transporter.verify((err) => {
      if (err) {
        console.error(
          "⚠️ SMTP verification failed. Check EMAIL_USER and EMAIL_PASS. App password required.\n",
          err && err.message ? err.message : err
        );
        resolve(false);
      } else {
        console.log("✅ SMTP verified successfully (emails can be sent).");
        resolve(true);
      }
    });
  });
}

verifyMail();

// In-memory storage for messages (in production, use a database)
const DATA_FILE = path.join(__dirname, "messages.json");

let messages = [];
let messageIdCounter = 1;

// Load persisted messages if present
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) {
      messages = parsed;
      const maxId = messages.reduce((max, m) => (m.id > max ? m.id : max), 0);
      messageIdCounter = maxId + 1;
      console.log(`Loaded ${messages.length} messages from messages.json`);
    }
  }
} catch (err) {
  console.warn("Could not load persisted messages:", err.message);
}

// API Routes

// Get all messages (for admin purposes - legacy endpoint)
app.get("/api/messages", async (req, res) => {
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

// helper: sanitize simple text
function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Submit contact form
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    let { name, email, subject = '', message } = req.body;

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

    const safeMessage = escapeHtml(message);
    const safeName = escapeHtml(name);

    try {
      // Create and save the message to MongoDB
      const newMessage = new Message({
        name: safeName,
        email: email,
        subject: subject,
        message: safeMessage,
        status: 'new'
      });

      // Save the message to the database
      const savedMessage = await newMessage.save();

      // Send success response to the client immediately
      res.json({
        success: true,
        message: `Thank you, ${safeName}! Your message has been received. I'll get back to you at ${email} soon.`,
        data: savedMessage,
        emailQueued: true,
      });

      // Background email sending (non-blocking)
      try {
        const emailContent = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
            <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
              <h2 style="color: #4F46E5; text-align:center;">📩 New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${savedMessage.name}</p>
              <p><strong>Email:</strong> ${savedMessage.email}</p>
              <p><strong>Message:</strong><br/>${savedMessage.message}</p>
              <p><strong>Subject:</strong> ${savedMessage.subject}</p>
              <hr/>
              <p style="font-size:12px; text-align:center;">Received at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        if (sendgrid) {
          // Use SendGrid API
          const sgMsg = {
            to: EMAIL_USER,
            from: EMAIL_USER,
            subject: `New Portfolio Contact from ${savedMessage.name}`,
            html: emailContent,
            replyTo: savedMessage.email,
          };

          const sgRes = await sendgrid.send(sgMsg);
          console.log("✅ SendGrid response:", sgRes[0]?.statusCode || sgRes);
        } else {
          // Fallback to nodemailer
          const mailOptions = {
            from: `"Portfolio Contact" <${EMAIL_USER}>`,
            to: EMAIL_USER,
            subject: `New Contact Form Submission: ${savedMessage.name}`,
            html: emailContent,
            replyTo: savedMessage.email,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Email sent:", info.response || info);
        }

        // Update message status in the database
        savedMessage.status = 'sent';
        await savedMessage.save();

      } catch (emailError) {
        console.error("⚠️ Email sending failed:", emailError.message || emailError);
        // Update message status to failed
        savedMessage.status = 'failed';
        savedMessage.error = emailError.message || 'Unknown error';
        await savedMessage.save();
      }
    } catch (error) {
      console.error("Contact form error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "An error occurred while processing your message. Please try again.",
        });
      }
    }
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your message. Please try again.",
    });
  }
});

// Portfolio stats
app.get("/api/stats", async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const newMessages = await Message.countDocuments({ status: 'new' });
    const repliedMessages = await Message.countDocuments({ status: { $in: ['sent', 'replied'] } });

    res.json({
      success: true,
      stats: {
        projectsCompleted: 15,
        yearsExperience: 3,
        happyClients: 10,
        cupsOfCoffee: "∞",
        totalMessages: totalMessages,
        newMessages: newMessages,
        repliedMessages: repliedMessages,
        technologies: [
          "HTML",
          "CSS",
          "JavaScript",
          "React",
          "Node.js",
          "PHP",
          "Python",
          "Kotlin",
        ],
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.json({
      success: true,
      stats: {
        projectsCompleted: 15,
        yearsExperience: 3,
        happyClients: 10,
        cupsOfCoffee: "∞",
        totalMessages: 0,
        technologies: [
          "HTML",
          "CSS",
          "JavaScript",
          "React",
          "Node.js",
          "PHP",
          "Python",
          "Kotlin",
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
      description: "A comprehensive web-based system...",
      technologies: ["React", "PHP", "MySQL"],
      githubUrl: "https://github.com",
      featured: true,
    },
    {
      id: 2,
      title: "Staff Evaluation App",
      description: "A mobile application for evaluating staff...",
      technologies: ["Kotlin", "Firebase", "Android"],
      githubUrl: "https://github.com",
      featured: true,
    },
    {
      id: 3,
      title: "AI Recommender System",
      description: "An intelligent recommendation engine...",
      technologies: ["Python", "Flask", "TensorFlow"],
      githubUrl: "https://github.com",
      featured: true,
    },
  ];
  res.json({ success: true, count: projects.length, projects });
});

// Newsletter
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  res.json({
    success: true,
    message: "Thank you for subscribing! You will receive updates soon.",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    emailConfigured: !!EMAIL_USER && !!EMAIL_PASS,
    adminConfigured: !!process.env.ADMIN_TOKEN,
  });
});

// Email test endpoint (for debugging)
app.get("/api/test-email", async (req, res) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return res.status(500).json({
      success: false,
      message:
        "Email not configured. Check EMAIL_USER and EMAIL_PASS environment variables.",
    });
  }

  try {
    const testMailOptions = {
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: "Portfolio Email Test",
      html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Test Successful!</h2>
          <p>Your portfolio email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Server:</strong> ${req.get("host")}</p>
        </div>
            `,
    };

    const info = await transporter.sendMail(testMailOptions);
    res.json({
      success: true,
      message: "Test email sent successfully!",
      info: info.response || info,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

// Import and use admin routes
const adminRoutes = require('./router/adminRoutes');
app.use('/api/admin', adminRoutes);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Serve admin.html for admin route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });

});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: "Something went wrong on the server" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 Portfolio Server Running Successfully!             ║
║                                                            ║
║     📍 Local: http://localhost:${PORT}                    ║
║     📍 Admin: http://localhost:${PORT}/admin             ║
║     📧 Email:    ${EMAIL_USER || "Not configured"}        ║
║     📊 Status: Active                                     ║
║                                                            ║
║     Available Endpoints:                                  ║
║     • GET / - Portfolio website                           ║
║     • GET /admin - Admin panel                            ║
║     • GET /api/health - Health check                      ║
║     • GET /api/test-email - Test email config             ║
║     • GET /api/stats - Portfolio stats                    ║
║     • GET /api/projects - Projects list                   ║
║     • GET /api/messages - All messages                    ║
║     • POST /api/contact - Submit contact form             ║
║     • POST /api/subscribe - Newsletter signup             ║
║                                                            ║
║     Admin API:                                            ║
║     • POST /api/admin/login - Admin login                 ║
║     • GET  /api/admin/messages - Get messages             ║
║     • GET  /api/admin/messages/:id - Get single message   ║
║     • PUT  /api/admin/messages/:id/status - Update status ║
║     • DELETE /api/admin/messages/:id - Delete message     ║
║     • POST /api/admin/send-email - Send email reply       ║
║                                                            ║
║     📝 Setup Instructions:                                ║
║     1. Copy env-template.txt to .env                      ║
║     2. Update EMAIL_USER and EMAIL_PASS in .env           ║
║     3. Set ADMIN_TOKEN and JWT_SECRET in .env             ║
║     4. Restart server: npm start                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
          `);
});

module.exports = app;