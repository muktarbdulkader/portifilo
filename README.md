# Muktar Abdulkader - Full-Stack Portfolio System 🚀

A complete, production-ready full-stack portfolio application featuring an AI-powered chatbot, advanced analytics, admin dashboard, and modern responsive design.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

### 🎨 Frontend
- ✅ Modern responsive portfolio website
- ✅ AI-powered chatbot (Gemini-like interface)
- ✅ Real-time analytics tracking
- ✅ Dark/Light theme toggle
- ✅ Smooth animations & transitions
- ✅ SEO optimized
- ✅ Mobile-first design
- ✅ Multi-language support (i18n)

### ⚙️ Backend
- ✅ RESTful API with Express.js
- ✅ MongoDB database integration
- ✅ Email notifications (Gmail SMTP)
- ✅ JWT authentication
- ✅ Rate limiting & security
- ✅ CORS protection
- ✅ Error handling & logging
- ✅ Health check endpoints

### 🤖 AI Features
- ✅ Intelligent chatbot with knowledge base
- ✅ Natural language understanding
- ✅ Conversation tracking & history
- ✅ User behavior analytics
- ✅ Engagement scoring
- ✅ Topic analysis
- ✅ Satisfaction tracking

### 👨‍💼 Admin Dashboard
- ✅ Secure authentication
- ✅ Message management
- ✅ Chatbot analytics
- ✅ User statistics
- ✅ Export functionality
- ✅ Real-time updates
- ✅ Conversation insights

---

## 📋 Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (Atlas or local instance)
- **Gmail account** (for email functionality)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# See Configuration section below
```

### 4. Verify System
```bash
npm run check
```

### 5. Start the Server
```bash
npm start
```

### 6. Access the Application
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health**: http://localhost:3000/api/health
- **Chatbot Test**: http://localhost:3000/test-chatbot.html

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# Email Configuration (Gmail App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Admin Configuration
ADMIN_TOKEN=your-secure-random-token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable 2-Step Verification
3. Go to Security > App passwords
4. Select "Mail" and "Other"
5. Name it "Portfolio Server"
6. Copy the 16-character password
7. Use it as `EMAIL_PASS` in `.env`

---

## 📁 Project Structure

```
portfolio/
├── public/                      # Frontend files
│   ├── index.html              # Main website
│   ├── admin.html              # Admin dashboard
│   ├── script.js               # Main JavaScript
│   ├── styles.css              # Main styles
│   ├── ai-chatbot.js           # Chatbot logic
│   ├── ai-chatbot.css          # Chatbot styles
│   ├── chatbot-notification.js # Notifications
│   ├── admin.js                # Admin logic
│   ├── ai-features.js          # AI features
│   └── i18n/                   # Translations
│       ├── en.json
│       └── fr.json
├── models/                      # Database models
│   ├── Message.js              # Message schema
│   ├── ChatConversation.js     # Chat schema
│   └── admin.js                # Admin schema
├── router/                      # API routes
│   └── adminRoutes.js          # Admin routes
├── server.js                    # Express server
├── ai-analytics.js             # Analytics system
├── startup.js                  # System verification
├── package.json                # Dependencies
├── .env                        # Environment variables
├── .env.example                # Environment template
└── vercel.json                 # Deployment config
```

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Portfolio statistics |
| GET | `/api/projects` | Projects list |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/subscribe` | Newsletter subscription |

### Chatbot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/conversation` | Start conversation |
| POST | `/api/chatbot/message` | Save message |
| GET | `/api/chatbot/conversation/:id` | Get conversation |
| POST | `/api/chatbot/end` | End conversation |

### Admin Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/messages` | Get all messages |
| GET | `/api/chatbot/analytics` | Chatbot analytics |
| GET | `/api/analytics/dashboard` | Analytics dashboard |

---

## 🧪 Testing

### Run System Check
```bash
npm run check
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello"}'

# Admin login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### Test Chatbot
Visit: http://localhost:3000/test-chatbot.html

---

## 📚 Documentation

- **[Full-Stack Integration Guide](FULL-STACK-INTEGRATION.md)** - Complete system overview
- **[Chatbot Setup Guide](CHATBOT-SETUP.md)** - Chatbot configuration
- **[Troubleshooting Guide](CHATBOT-TROUBLESHOOTING.md)** - Common issues & solutions
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment

---

## 🚀 Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Render Deployment

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run check` | Verify system configuration |
| `npm run setup` | Run setup wizard |
| `npm run verify` | Complete system verification |
| `npm run docs` | Show documentation links |

---

## 🔐 Security Features

- ✅ CORS protection with whitelist
- ✅ Rate limiting on sensitive endpoints
- ✅ Input sanitization & validation
- ✅ JWT authentication for admin
- ✅ Secure password hashing
- ✅ Environment variable protection
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Features in Detail

### AI Chatbot
- Natural language understanding
- Context-aware responses
- Conversation history
- Quick question buttons
- Mobile responsive
- Backend integration
- Analytics tracking

### Analytics System
- Page view tracking
- User behavior analysis
- Scroll depth monitoring
- Click heatmaps
- Engagement scoring
- Conversion tracking
- Session recording

### Admin Dashboard
- Secure login
- Message management
- Chatbot analytics
- User statistics
- Export to CSV
- Real-time updates
- Responsive design

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Muktar Abdulkader**
- Email: muktarabdulkader957@gmail.com
- GitHub: [@muktarbdulkader](https://github.com/muktarbdulkader)
- LinkedIn: [Muktar Abdulkader](https://linkedin.com/in/muktar-abdulkader)
- Telegram: [@MuktiAbdu](https://t.me/MuktiAbdu)

---

## 🙏 Acknowledgments

- Express.js for the backend framework
- MongoDB for the database
- Nodemailer for email functionality
- All open-source contributors

---

## 📞 Support

For support, email muktarabdulkader957@gmail.com or open an issue on GitHub.

---

## 🎯 Roadmap

- [ ] OpenAI API integration
- [ ] Voice chat support
- [ ] Multi-language chatbot
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Blog CMS integration
- [ ] Project showcase enhancements
- [ ] Performance optimizations

---

**Made with ❤️ by Muktar Abdulkader**

⭐ Star this repo if you find it helpful!
