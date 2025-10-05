# Muktar Abdulkader - Portfolio Website

A modern, responsive portfolio website with Node.js backend, featuring contact form, admin panel, and email integration.

## 🚀 Features

- **Modern Design**: Clean, responsive design with smooth animations
- **Contact Form**: Working contact form with email notifications
- **Admin Panel**: Secure admin interface to view messages and send emails
- **Email Integration**: Gmail SMTP integration for contact form notifications
- **API Endpoints**: RESTful API for portfolio data and contact management
- **Real-time Stats**: Dynamic portfolio statistics
- **Mobile Responsive**: Optimized for all device sizes

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Gmail account (for email functionality)

## 🛠️ Installation & Setup

### 1. Clone/Download the Project
```bash
# If you have git
git clone <repository-url>
cd portifo

# Or download and extract the ZIP file
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

1. **Copy the environment template:**
   ```bash
   copy env-template.txt .env
   ```
   (On Windows) or
   ```bash
   cp env-template.txt .env
   ```
   (On Mac/Linux)

2. **Edit the `.env` file** with your actual values:
   ```env
   PORT=3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ADMIN_TOKEN=your-secure-admin-token
   ```

### 4. Gmail App Password Setup

To enable email functionality, you need to set up a Gmail App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **Security** → **App passwords**
4. Generate a new app password for "Mail"
5. Use this password (not your regular Gmail password) in the `EMAIL_PASS` field

### 5. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## 🌐 Usage

### Main Website
- Visit `http://localhost:3000` to view the portfolio
- Navigate through different sections: About, Skills, Projects, Contact
- Use the contact form to send messages

### Admin Panel
- Visit `http://localhost:3000/admin` to access the admin panel
- Enter your admin token (from `.env` file)
- View all contact form submissions
- Send emails directly from the admin panel

## 📁 Project Structure

```
portifo/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── index.html            # Main portfolio page
├── admin.html            # Admin panel
├── script.js             # Frontend JavaScript
├── styles.css            # CSS styles
├── messages.json         # Contact messages storage
├── image/               # Image assets
├── node_modules/        # Dependencies
└── env-template.txt     # Environment variables template
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Portfolio homepage |
| GET | `/admin` | Admin panel |
| GET | `/api/health` | Server health check |
| GET | `/api/stats` | Portfolio statistics |
| GET | `/api/projects` | Projects list |
| GET | `/api/messages` | All contact messages |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/subscribe` | Newsletter subscription |
| GET | `/api/admin/messages` | Admin: Get messages (requires token) |
| POST | `/api/admin/send-email` | Admin: Send email (requires token) |

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot connect to server" error**
   - Make sure the server is running: `npm start`
   - Check if port 3000 is available
   - Verify you're accessing `http://localhost:3000`

2. **Email not working**
   - Verify Gmail App Password is correct
   - Check EMAIL_USER and EMAIL_PASS in `.env`
   - Ensure 2-Step Verification is enabled on Gmail

3. **Admin panel not accessible**
   - Verify ADMIN_TOKEN is set in `.env`
   - Use the exact token when logging in

4. **Contact form not submitting**
   - Check browser console for errors
   - Verify server is running
   - Check network tab for API calls

### Development Commands

```bash
# Start server in development mode (with auto-restart)
npm run dev

# Start production server
npm start

# Check for linting errors
npm test
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use strong, unique admin tokens
- Keep your Gmail App Password secure
- The admin panel is protected by token authentication

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🎨 Customization

### Adding New Projects
Edit the projects array in `server.js` around line 300:

```javascript
const projects = [
  {
    id: 1,
    title: "Your Project",
    description: "Project description...",
    technologies: ["React", "Node.js"],
    githubUrl: "https://github.com/your-repo",
    featured: true,
  },
  // Add more projects...
];
```

### Modifying Styles
Edit `styles.css` to customize colors, fonts, and layout.

### Updating Content
Edit `index.html` to update personal information, skills, and about section.

## 🚀 Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deployment Steps:

1. **Full-Stack Deployment** (Recommended):
   - Deploy entire project to Render, Heroku, or Railway
   - Set environment variables in platform settings
   - No additional configuration needed

2. **Separate Frontend & Backend**:
   - Deploy backend to Render/Heroku
   - Deploy frontend to Netlify/Vercel
   - Update API URL in `index.html`:
     ```javascript
     window.API_URL = "https://your-backend-url.onrender.com";
     ```

### Common Deployment Issues:

- **"Cannot connect to server"**: Check API URL configuration
- **Contact form not working**: Verify email environment variables
- **Admin panel inaccessible**: Check ADMIN_TOKEN setting

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the server console for error messages
4. Ensure all dependencies are installed
5. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific help

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🚀**