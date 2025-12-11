# 🚀 Deployment Guide

This guide covers different deployment options for your portfolio website.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured in `.env`
- [ ] Gmail App Password set up and working
- [ ] MongoDB connection string ready
- [ ] Admin token generated and secure
- [ ] Contact form tested locally
- [ ] All dependencies installed (`npm install`)

## 🌐 Deployment Options

### Option 1: Full-Stack Deployment (Recommended)

Deploy both frontend and backend together on platforms that support Node.js.

#### 🔥 Render (Recommended - Free Tier Available)

1. **Create Account**: Sign up at [render.com](https://render.com)

2. **Connect Repository**: 
   - Connect your GitHub/GitLab repository
   - Or upload your project files

3. **Create Web Service**:
   - Choose "Web Service"
   - Select your repository
   - Configure settings:
     ```
     Name: muktar-portfolio
     Environment: Node
     Build Command: npm install
     Start Command: npm start
     ```

4. **Set Environment Variables**:
   ```
   MONGODB_URI=your-mongodb-connection-string
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ADMIN_TOKEN=your-secure-admin-token
   PORT=3000
   NODE_ENV=production
   ```

5. **Deploy**: Click "Create Web Service"

#### 🚀 Railway

1. **Create Account**: Sign up at [railway.app](https://railway.app)
2. **Deploy from GitHub**: Connect your repository
3. **Set Environment Variables** (same as above)
4. **Deploy**: Railway will automatically deploy

#### 🔷 Heroku

1. **Install Heroku CLI**: Download from [heroku.com](https://heroku.com)
2. **Login**: `heroku login`
3. **Create App**: `heroku create your-app-name`
4. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI="your-connection-string"
   heroku config:set EMAIL_USER="your-email@gmail.com"
   heroku config:set EMAIL_PASS="your-app-password"
   heroku config:set ADMIN_TOKEN="your-admin-token"
   ```
5. **Deploy**: 
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 2: Separate Frontend & Backend

Deploy frontend and backend separately for better scalability.

#### Backend Deployment (Choose One)

**Render/Railway/Heroku** (same steps as above, but only deploy server files)

#### Frontend Deployment (Choose One)

**🌟 Netlify**:
1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your `public` folder
3. Update API URL in `public/script.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.onrender.com';
   ```

**⚡ Vercel**:
1. Sign up at [vercel.com](https://vercel.com)
2. Connect your repository
3. Deploy with default settings
4. Update API URL as above

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

2. **Create Cluster**:
   - Choose "Shared" (free tier)
   - Select region closest to your users
   - Create cluster

3. **Create Database User**:
   - Go to "Database Access"
   - Add new user with read/write permissions
   - Remember username and password

4. **Configure Network Access**:
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

5. **Get Connection String**:
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 📧 Email Configuration

### Gmail App Password Setup

1. **Enable 2-Step Verification**:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**:
   - Security → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Portfolio Website"
   - Copy the 16-character password

3. **Use in Environment Variables**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop  # 16-character app password
   ```

## 🔧 Environment Variables by Platform

### Render/Railway/Heroku
Set in the platform's dashboard under "Environment Variables" or "Config Vars"

### Netlify (Frontend Only)
Create `_redirects` file in public folder:
```
/api/* https://your-backend-url.onrender.com/api/:splat 200
/* /index.html 200
```

### Vercel
Use `vercel.json` (already configured in your project)

## 🚨 Common Deployment Issues

### 1. "Cannot connect to server"
**Solution**: Check API URL configuration
```javascript
// In public/script.js, update:
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-backend-url.onrender.com';
```

### 2. Contact form not working
**Solutions**:
- Verify EMAIL_USER and EMAIL_PASS are set correctly
- Check Gmail App Password (not regular password)
- Ensure 2-Step Verification is enabled

### 3. Database connection failed
**Solutions**:
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

### 4. Admin panel not accessible
**Solutions**:
- Verify ADMIN_TOKEN is set in environment variables
- Check if token matches what you're entering
- Clear browser cache and try again

### 5. 404 errors on refresh
**Solutions**:
- For Netlify: Add `_redirects` file (see above)
- For Vercel: Use `vercel.json` (already configured)
- For others: Configure server to serve `index.html` for all routes

## 📊 Performance Optimization

### 1. Enable Compression
Most platforms enable this automatically, but you can add to `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Static File Caching
Already configured in `vercel.json` and server headers.

### 3. Database Optimization
- Use MongoDB indexes (already configured in models)
- Implement pagination for large datasets
- Consider connection pooling for high traffic

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique tokens
- Rotate secrets regularly

### 2. CORS Configuration
Already configured in `server.js` with allowed origins.

### 3. Rate Limiting
Already implemented for contact form submissions.

### 4. Input Validation
Already implemented in models and routes.

## 📈 Monitoring & Maintenance

### 1. Health Checks
Use the `/api/health` endpoint to monitor server status.

### 2. Error Logging
Check platform logs for errors:
- Render: Dashboard → Logs
- Heroku: `heroku logs --tail`
- Railway: Dashboard → Deployments → Logs

### 3. Database Monitoring
Monitor MongoDB Atlas dashboard for:
- Connection count
- Query performance
- Storage usage

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: Always check deployment platform logs first
2. **Test Locally**: Ensure everything works locally before deploying
3. **Environment Variables**: Double-check all environment variables
4. **Documentation**: Refer to platform-specific documentation
5. **Community**: Check platform community forums

## 📞 Support Resources

- **Render**: [render.com/docs](https://render.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

---

**Happy Deploying! 🚀**