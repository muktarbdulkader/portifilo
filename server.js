const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

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
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER || "your-email@gmail.com",
    pass: EMAIL_PASS || "your-app-password",
  },
});

// Verify SMTP configuration at startup
transporter
  .verify()
  .then(() => {
    console.log("Email transporter verified (SMTP ready)");
  })
  .catch((err) => {
    console.warn(
      "Warning: Email transporter verification failed.\n" +
        "Check EMAIL_USER and EMAIL_PASS (App Password required for Gmail).\n" +
        `Sanitized EMAIL_USER='${EMAIL_USER ? EMAIL_USER : "(not set)"}'`,
      err && err.message ? err.message : err
    );
  });

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

// Get all messages (for admin purposes)
app.get("/api/messages", (req, res) => {
  res.json({
    success: true,
    count: messages.length,
    messages: messages,
  });
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
    let { name, email, message } = req.body;

    name = (name || "").trim();
    email = (email || "").trim();
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

    const newMessage = {
      id: messageIdCounter++,
      name: safeName,
      email,
      message: safeMessage,
      timestamp: new Date().toISOString(),
      status: "unread",
    };
    messages.push(newMessage);

    const tempFile = DATA_FILE + ".tmp";
    fs.writeFile(tempFile, JSON.stringify(messages, null, 2), (err) => {
      if (err) {
        console.error("Failed to write temp messages file:", err.message);
      } else {
        fs.rename(tempFile, DATA_FILE, (renameErr) => {
          if (renameErr)
            console.error(
              "Failed to finalize messages file:",
              renameErr.message
            );
        });
      }
    });

    res.json({
      success: true,
      message: `Thank you, ${name}! Your message has been received. I'll get back to you at ${email} soon.`,
      data: newMessage,
      emailQueued: true,
    });

    (async (msg) => {
      try {
        const mailOptions = {
          from: EMAIL_USER,
          to: EMAIL_USER,
          subject: `New Portfolio Contact from ${msg.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                <div style="background: white; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #4F46E5; margin-bottom: 20px;">New Contact Form Submission</h2>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Name:</strong>
                        <p style="margin: 5px 0; color: #333;">${msg.name}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Email:</strong>
                        <p style="margin: 5px 0; color: #333;">${msg.email}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #666;">Message:</strong>
                        <p style="margin: 5px 0; color: #333; white-space: pre-wrap;">${
                          msg.message
                        }</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">Received at: ${new Date().toLocaleString()}</p>
                </div>
            </div>
          `,
          replyTo: msg.email,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(
          "Background email sent:",
          info && info.response ? info.response : info
        );

        const idx = messages.findIndex((m) => m.id === msg.id);
        if (idx !== -1) {
          messages[idx].status = "sent";
          const tempFile2 = DATA_FILE + ".tmp";
          fs.writeFile(tempFile2, JSON.stringify(messages, null, 2), (err) => {
            if (err)
              console.error("Failed to write temp messages file:", err.message);
            else
              fs.rename(tempFile2, DATA_FILE, (renameErr) => {
                if (renameErr)
                  console.error(
                    "Failed to finalize messages file:",
                    renameErr.message
                  );
              });
          });
        }
      } catch (bgErr) {
        const errMsg = (bgErr && bgErr.message) || String(bgErr);
        console.warn("Background email sending failed:", errMsg);
      }
    })(newMessage);
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while processing your message. Please try again.",
    });
  }
});

// Portfolio stats
app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    stats: {
      projectsCompleted: 15,
      yearsExperience: 3,
      happyClients: 10,
      cupsOfCoffee: "∞",
      totalMessages: messages.length,
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
});

// Admin API
app.get("/api/admin/messages", (req, res) => {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || token !== expected) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  res.json({ success: true, count: messages.length, messages });
});

app.post("/api/admin/send-email", async (req, res) => {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || token !== expected) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { to, subject, text, html } = req.body || {};
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      success: false,
      message: "Missing fields: to, subject and text/html required",
    });
  }

  try {
    const mailOptions = { from: EMAIL_USER, to, subject, text, html };
    const info = await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Email sent", info });
  } catch (err) {
    console.error("Admin send-email error:", err.message || err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to send email",
        error: err.message,
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
    return res
      .status(400)
      .json({
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
  });
});

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
║     📍 Local:    http://localhost:${PORT}                    ║
║     📍 Admin:    http://localhost:${PORT}/admin             ║
║     📧 Email:    ${EMAIL_USER || "Not configured"}          ║
║     📊 Status:   Active                                   ║
║                                                            ║
║     Available Endpoints:                                  ║
║     • GET  /                     - Portfolio website      ║
║     • GET  /admin                - Admin panel           ║
║     • GET  /api/health           - Health check          ║
║     • GET  /api/stats            - Portfolio stats       ║
║     • GET  /api/projects         - Projects list         ║
║     • GET  /api/messages         - All messages          ║
║     • POST /api/contact          - Submit contact form   ║
║     • POST /api/subscribe        - Newsletter signup     ║
║                                                            ║
║     📝 Setup Instructions:                                ║
║     1. Copy env-template.txt to .env                      ║
║     2. Update EMAIL_USER and EMAIL_PASS in .env           ║
║     3. Set ADMIN_TOKEN in .env                            ║
║     4. Restart server: npm start                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
