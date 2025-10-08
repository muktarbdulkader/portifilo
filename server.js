const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
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
          from: `"Portfolio Contact" <${EMAIL_USER}>`,
          to: EMAIL_USER, // Your inbox
          subject: `New Contact Form Submission: ${msg.name}`,
          html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
            <h2 style="color: #4F46E5; text-align:center;">📩 New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${msg.name}</p>
            <p><strong>Email:</strong> ${msg.email}</p>
            <p><strong>Message:</strong><br/>${msg.message}</p>
            <hr/>
            <p style="font-size:12px; text-align:center;">Received at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
          replyTo: msg.email,
        };

        if (sendgrid) {
          // Use SendGrid API
          const sgMsg = {
            to: msg.email ? EMAIL_USER : EMAIL_USER,
            from: EMAIL_USER,
            subject: `New Portfolio Contact from ${msg.name}`,
            html: `<div style="font-family: Arial, sans-serif; padding:20px;"><h2>New Contact</h2><p><strong>Name:</strong> ${msg.name}</p><p><strong>Email:</strong> ${msg.email}</p><p><strong>Message:</strong><br/>${msg.message}</p></div>`,
            replyTo: msg.email,
          };
          const sgRes = await sendgrid.send(sgMsg);
          console.log(
            "✅ SendGrid response:",
            sgRes && sgRes[0] && sgRes[0].statusCode
              ? sgRes[0].statusCode
              : sgRes
          );
        } else {
          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Email sent:", info.response || info);
        }

        // Update message status
        const idx = messages.findIndex((m) => m.id === msg.id);
        if (idx !== -1) {
          messages[idx].status = "sent";
          fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (err) => {
            if (err)
              console.error("Failed to update message status:", err.message);
          });
        }
      } catch (bgErr) {
        console.error(
          "⚠️ Background email sending failed:",
          bgErr.message || bgErr
        );
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

// Admin debug: verify email transporter (does not send mail) - protected
app.get("/api/admin/debug-email", async (req, res) => {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || token !== expected) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const ok = await verifyMail();
    if (ok)
      return res.json({
        success: true,
        message: "Email service OK (SendGrid or SMTP verified)",
      });
    return res
      .status(500)
      .json({ success: false, message: "Email service verification failed" });
  } catch (err) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Email service verification failed",
        error: err && err.message ? err.message : String(err),
      });
  }
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
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
});

// Admin: resend a stored message by id (protected)
app.post("/api/admin/resend/:id", async (req, res) => {
  const token = req.headers["x-admin-token"];
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || token !== expected) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const id = parseInt(req.params.id, 10);
  if (isNaN(id))
    return res.status(400).json({ success: false, message: "Invalid id" });

  const msg = messages.find((m) => m.id === id);
  if (!msg)
    return res
      .status(404)
      .json({ success: false, message: "Message not found" });

  try {
    // prepare payload
    const html = `<div style="font-family: Arial, sans-serif; padding:20px;"><h2>Resent Contact</h2><p><strong>Name:</strong> ${msg.name}</p><p><strong>Email:</strong> ${msg.email}</p><p><strong>Message:</strong><br/>${msg.message}</p></div>`;

    if (sendgrid) {
      const sgMsg = {
        to: EMAIL_USER,
        from: EMAIL_USER,
        subject: `Resent: Contact from ${msg.name}`,
        html,
        replyTo: msg.email,
      };
      const sgRes = await sendgrid.send(sgMsg);
      console.log(
        "Admin resend via SendGrid:",
        sgRes && sgRes[0] && sgRes[0].statusCode
      );
    } else {
      const info = await transporter.sendMail({
        from: EMAIL_USER,
        to: EMAIL_USER,
        subject: `Resent: Contact from ${msg.name}`,
        html,
        replyTo: msg.email,
      });
      console.log("Admin resend via SMTP:", info && info.response);
    }

    // update message status
    msg.status = "sent";
    delete msg.emailError;
    fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (err) => {
      if (err)
        console.error("Failed to persist messages after resend:", err.message);
    });

    return res.json({
      success: true,
      message: "Resend attempted, check logs for result",
      id,
    });
  } catch (err) {
    const em = err && err.message ? err.message : String(err);
    console.error("Admin resend failed:", em);
    msg.status = "failed";
    msg.emailError = em;
    fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (werr) => {
      if (werr)
        console.error(
          "Failed to persist messages after resend failure:",
          werr.message
        );
    });
    return res
      .status(500)
      .json({ success: false, message: "Resend failed", error: em });
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
║     • GET  /api/test-email       - Test email config     ║
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
