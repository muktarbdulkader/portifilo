// const express = require("express");
// const cors = require("cors");
// const nodemailer = require("nodemailer");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname)));

// // Email configuration
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER || "your-email@gmail.com",
//     pass: process.env.EMAIL_PASS || "your-app-password",
//   },
// });

// // In-memory storage for messages (in production, use a database)
// let messages = [];
// let messageIdCounter = 1;

// // API Routes

// // Get all messages (for admin purposes)
// app.get("/api/messages", (req, res) => {
//   res.json({
//     success: true,
//     count: messages.length,
//     messages: messages,
//   });
// });

// // Submit contact form
// app.post("/api/contact", async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     // Validation
//     if (!name || !email || !message) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields: name, email, and message",
//       });
//     }

//     // Email validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide a valid email address",
//       });
//     }

//     // Store message
//     const newMessage = {
//       id: messageIdCounter++,
//       name,
//       email,
//       message,
//       timestamp: new Date().toISOString(),
//       status: "unread",
//     };
//     messages.push(newMessage);

//     // Send email notification (optional - configure with real credentials)
//     try {
//       const mailOptions = {
//         from: process.env.EMAIL_USER || "portfolio@example.com",
//         to: process.env.EMAIL_USER || "muktar@example.com",
//         subject: `New Portfolio Contact from ${name}`,
//         html: `
//                     <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
//                         <div style="background: white; padding: 30px; border-radius: 8px;">
//                             <h2 style="color: #4F46E5; margin-bottom: 20px;">New Contact Form Submission</h2>
//                             <div style="margin-bottom: 15px;">
//                                 <strong style="color: #666;">Name:</strong>
//                                 <p style="margin: 5px 0; color: #333;">${name}</p>
//                             </div>
//                             <div style="margin-bottom: 15px;">
//                                 <strong style="color: #666;">Email:</strong>
//                                 <p style="margin: 5px 0; color: #333;">${email}</p>
//                             </div>
//                             <div style="margin-bottom: 15px;">
//                                 <strong style="color: #666;">Message:</strong>
//                                 <p style="margin: 5px 0; color: #333; white-space: pre-wrap;">${message}</p>
//                             </div>
//                             <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//                             <p style="color: #999; font-size: 12px;">Received at: ${new Date().toLocaleString()}</p>
//                         </div>
//                     </div>
//                 `,
//         replyTo: email,
//       };

//       await transporter.sendMail(mailOptions);
//     } catch (emailError) {
//       console.log(
//         "Email sending failed (this is OK in development):",
//         emailError.message
//       );
//     }

//     res.json({
//       success: true,
//       message: `Thank you, ${name}! Your message has been received. I'll get back to you at ${email} soon.`,
//       data: newMessage,
//     });
//   } catch (error) {
//     console.error("Contact form error:", error);
//     res.status(500).json({
//       success: false,
//       message:
//         "An error occurred while processing your message. Please try again.",
//     });
//   }
// });

// // Get portfolio stats
// app.get("/api/stats", (req, res) => {
//   res.json({
//     success: true,
//     stats: {
//       projectsCompleted: 15,
//       yearsExperience: 3,
//       happyClients: 10,
//       cupsOfCoffee: "∞",
//       totalMessages: messages.length,
//       technologies: [
//         "HTML",
//         "CSS",
//         "JavaScript",
//         "React",
//         "Node.js",
//         "PHP",
//         "Python",
//         "Kotlin",
//       ],
//     },
//   });
// });

// // Get projects data
// app.get("/api/projects", (req, res) => {
//   const projects = [
//     {
//       id: 1,
//       title: "Course Registration System",
//       description:
//         "A comprehensive web-based system for students to register for courses, view schedules, and track their academic progress with real-time updates.",
//       technologies: ["React", "PHP", "MySQL"],
//       image:
//         "https://images.unsplash.com/photo-1555209183-8facf96a4349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
//       githubUrl: "https://github.com",
//       featured: true,
//     },
//     {
//       id: 2,
//       title: "Staff Evaluation App",
//       description:
//         "A mobile application for evaluating staff performance with real-time feedback, analytics dashboard, and comprehensive reporting features.",
//       technologies: ["Kotlin", "Firebase", "Android"],
//       image:
//         "https://images.unsplash.com/photo-1658953229625-aad99d7603b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
//       githubUrl: "https://github.com",
//       featured: true,
//     },
//     {
//       id: 3,
//       title: "AI Recommender System",
//       description:
//         "An intelligent recommendation engine using machine learning algorithms to provide personalized suggestions based on user behavior patterns.",
//       technologies: ["Python", "Flask", "TensorFlow"],
//       image:
//         "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
//       githubUrl: "https://github.com",
//       featured: true,
//     },
//   ];

//   res.json({
//     success: true,
//     count: projects.length,
//     projects: projects,
//   });
// });

// // Subscribe to newsletter (example endpoint)
// app.post("/api/subscribe", (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       message: "Email is required",
//     });
//   }

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({
//       success: false,
//       message: "Please provide a valid email address",
//     });
//   }

//   res.json({
//     success: true,
//     message: "Thank you for subscribing! You will receive updates soon.",
//   });
// });

// // Health check endpoint
// app.get("/api/health", (req, res) => {
//   res.json({
//     success: true,
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//   });
// });

// // Serve index.html for the root route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Endpoint not found",
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: "Something went wrong on the server",
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`
// ╔════════════════════════════════════════════════════════════╗
// ║                                                            ║
// ║     🚀 Portfolio Server Running Successfully!             ║
// ║                                                            ║
// ║     📍 Local:    http://localhost:${PORT}                    ║
// ║     📧 Email:    ${process.env.EMAIL_USER || "Not configured"}     ║
// ║     📊 Status:   Active                                   ║
// ║                                                            ║
// ║     Available Endpoints:                                  ║
// ║     • GET  /                     - Portfolio website      ║
// ║     • GET  /api/health           - Health check          ║
// ║     • GET  /api/stats            - Portfolio stats       ║
// ║     • GET  /api/projects         - Projects list         ║
// ║     • GET  /api/messages         - All messages          ║
// ║     • POST /api/contact          - Submit contact form   ║
// ║     • POST /api/subscribe        - Newsletter signup     ║
// ║                                                            ║
// ╚════════════════════════════════════════════════════════════╝
//     `);
// });

// module.exports = app;
