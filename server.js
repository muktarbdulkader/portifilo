const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for contact submissions
const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory messages storage
const DATA_FILE = path.join(__dirname, "messages.json");
let messages = [];
let messageIdCounter = 1;

// Load messages if file exists
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
  console.warn("Could not load messages:", err.message);
}

// Helper to sanitize text
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
        message: "Please provide name, email, and message",
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

    // Save messages to file
    const tempFile = DATA_FILE + ".tmp";
    fs.writeFile(tempFile, JSON.stringify(messages, null, 2), (err) => {
      if (!err) fs.rename(tempFile, DATA_FILE, () => {});
    });

    res.json({
      success: true,
      message: `Thank you, ${name}! Your message has been received.`,
      data: newMessage,
      emailQueued: true,
    });

    // Send email via Resend
    (async (msg) => {
      try {
        const emailHtml = `
<div style="font-family: Arial, sans-serif; padding:20px; background:#f5f5f5;">
  <h2>📩 New Contact Form Submission</h2>
  <p><strong>Name:</strong> ${msg.name}</p>
  <p><strong>Email:</strong> ${msg.email}</p>
  <p><strong>Message:</strong><br/>${msg.message}</p>
  <p>Received at: ${new Date().toLocaleString()}</p>
</div>`;

        const response = await resend.emails.send({
          from: `Portfolio <${process.env.RESEND_SENDER}>`,
          to: [process.env.RESEND_RECEIVER],
          subject: `New Contact Form: ${msg.name}`,
          html: emailHtml,
        });

        console.log("Email sent via Resend:", response);

        // Update message status
        const idx = messages.findIndex((m) => m.id === msg.id);
        if (idx !== -1) messages[idx].status = "sent";
      } catch (err) {
        console.warn("Failed to send email via Resend:", err.message || err);
      }
    })(newMessage);
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
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

// Projects list
app.get("/api/projects", (req, res) => {
  const projects = [
    {
      id: 1,
      title: "Course Registration System",
      technologies: ["React", "PHP", "MySQL"],
      featured: true,
    },
    {
      id: 2,
      title: "Staff Evaluation App",
      technologies: ["Kotlin", "Firebase"],
      featured: true,
    },
    {
      id: 3,
      title: "AI Recommender System",
      technologies: ["Python", "Flask", "TensorFlow"],
      featured: true,
    },
  ];
  res.json({ success: true, count: projects.length, projects });
});

// Newsletter subscription
app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ success: false, message: "Invalid email" });

  res.json({ success: true, message: "Thank you for subscribing!" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    emailConfigured: !!process.env.RESEND_API_KEY,
  });
});

// Serve static files & index
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/admin", (req, res) =>
  res.sendFile(path.join(__dirname, "admin.html"))
);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Endpoint not found" })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
