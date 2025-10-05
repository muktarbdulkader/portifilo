# 🚀 Deployment Guide

This guide explains how to deploy your portfolio website to different platforms and fix common deployment issues.

## 📋 Pre-Deployment Checklist

1. ✅ **Environment Variables**: Set up your `.env` file with production values
2. ✅ **Email Configuration**: Configure Gmail App Password
3. ✅ **Admin Token**: Set a secure admin token
4. ✅ **API URL**: Configure the correct backend URL for your deployment

## 🌐 Deployment Scenarios

### Scenario 1: Full-Stack Deployment (Same Domain)

**Platforms**: Render, Heroku, Railway, DigitalOcean App Platform

**Configuration**:
- Deploy both frontend and backend together
- Use the same domain for both
- No additional configuration needed

**Steps**:
1. Deploy your entire project to the platform
2. Set environment variables in platform settings
3. The app will work automatically

### Scenario 2: Separate Frontend & Backend

**Frontend**: Netlify, Vercel, GitHub Pages
**Backend**: Render, Heroku, Railway

**Configuration Required**:

1. **Update `index.html`**:
```javascript
// Uncomment and update this line in index.html:
window.API_URL = "https://your-backend-url.onrender.com";
```

2. **Update `script.js`** (if needed):
```javascript
// In the getApiUrl() function, update the detection logic:
if (hostname.includes('netlify.app')) {
  return 'https://your-backend-url.onrender.com';
}
```

### Scenario 3: Custom Domain

**Configuration**:
```javascript
// In index.html, set your custom backend URL:
window.API_URL = "https://api.yourdomain.com";
```

## 🔧 Common Deployment Issues & Solutions

### Issue 1: "Cannot connect to server" Error

**Symptoms**:
- Contact form shows "Cannot connect to server"
- Browser console shows network errors

**Solutions**:
1. **Check API URL Configuration**:
   ```javascript
   // Open browser console and check:
   console.log("API URL:", API_URL);
   ```

2. **Verify Backend is Running**:
   - Check if your backend is deployed and running
   - Test the health endpoint: `https://your-backend-url.com/api/health`

3. **CORS Issues**:
   - Ensure your backend has CORS enabled
   - Check if your frontend domain is allowed

### Issue 2: Contact Form Not Working

**Symptoms**:
- Form submits but no email is sent
- No success/error messages

**Solutions**:
1. **Check Environment Variables**:
   - Verify `EMAIL_USER` and `EMAIL_PASS` are set
   - Ensure Gmail App Password is correct

2. **Check Backend Logs**:
   - Look for email configuration errors
   - Verify SMTP settings

### Issue 3: Admin Panel Not Accessible

**Symptoms**:
- Admin panel shows "Unauthorized"
- Cannot load messages

**Solutions**:
1. **Check Admin Token**:
   - Verify `ADMIN_TOKEN` is set in environment variables
   - Use the exact token when logging in

2. **Check Admin Route**:
   - Ensure `/admin` route is accessible
   - Verify admin.html is being served

## 🛠️ Platform-Specific Instructions

### Render.com Deployment

1. **Connect Repository**:
   - Connect your GitHub repository to Render
   - Choose "Web Service"

2. **Environment Variables**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_TOKEN=your-secure-token
   ```

3. **Build Command**: `npm install`
4. **Start Command**: `npm start`

### Netlify Deployment (Frontend Only)

1. **Deploy Frontend**:
   - Connect repository to Netlify
   - Set build command: `npm run build` (if you have one)
   - Set publish directory: `/` (root)

2. **Configure Backend URL**:
   ```javascript
   // In index.html, uncomment and update:
   window.API_URL = "https://your-backend-url.onrender.com";
   ```

### Heroku Deployment

1. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**:
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-app-password
   heroku config:set ADMIN_TOKEN=your-secure-token
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔍 Debugging Deployment Issues

### Step 1: Check Browser Console

Open your deployed website and check the browser console for:
- API URL configuration
- Backend connection test results
- Any error messages

### Step 2: Test Backend Endpoints

Test these endpoints directly:
- `https://your-backend-url.com/api/health`
- `https://your-backend-url.com/api/stats`

### Step 3: Check Environment Variables

Ensure all required environment variables are set:
- `EMAIL_USER`
- `EMAIL_PASS`
- `ADMIN_TOKEN`
- `PORT` (usually set automatically)

### Step 4: Verify CORS Configuration

Check if your backend allows requests from your frontend domain.

## 📞 Getting Help

If you're still having issues:

1. **Check the browser console** for error messages
2. **Test the backend endpoints** directly
3. **Verify environment variables** are set correctly
4. **Check platform-specific logs** for deployment errors

## 🎯 Quick Fixes

### For Netlify + Render Setup:

1. **In `index.html`**, uncomment and update:
   ```javascript
   window.API_URL = "https://your-app-name.onrender.com";
   ```

2. **In Render**, set environment variables:
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `ADMIN_TOKEN`

3. **Deploy both**:
   - Frontend to Netlify
   - Backend to Render

### For Same-Platform Deployment:

1. **Deploy entire project** to your chosen platform
2. **Set environment variables** in platform settings
3. **No additional configuration** needed

---

**Remember**: Always test your deployment locally first, then deploy to staging, and finally to production! 🚀
