#!/usr/bin/env node

/**
 * Portfolio Setup Script
 * This script helps set up the portfolio application with initial configuration
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║               🚀 Portfolio Setup Script                             ║
║                                                                      ║
║     This script will help you set up your portfolio application     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    console.log('   If you need to reconfigure, delete .env and run this script again');
} else {
    console.log('📝 Creating .env file from template...');
    
    if (fs.existsSync(envExamplePath)) {
        // Read .env.example
        let envContent = fs.readFileSync(envExamplePath, 'utf8');
        
        // Generate a secure admin token
        const adminToken = crypto.randomBytes(32).toString('hex');
        
        // Replace the default admin token with a secure one
        envContent = envContent.replace(
            'ADMIN_TOKEN=F7k9!pR2sXq#8vL1zD',
            `ADMIN_TOKEN=${adminToken}`
        );
        
        // Write to .env
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully');
        console.log(`🔐 Generated secure admin token: ${adminToken}`);
    } else {
        console.log('❌ .env.example file not found');
        process.exit(1);
    }
}

console.log(`
📋 Next Steps:

1. 🗄️  Set up MongoDB:
   - Create a MongoDB Atlas account (https://cloud.mongodb.com)
   - Create a new cluster
   - Get your connection string
   - Update MONGODB_URI in .env file

2. 📧 Set up Gmail for contact form:
   - Enable 2-Step Verification in your Google Account
   - Generate an App Password:
     • Go to Google Account Settings > Security
     • Click "App passwords"
     • Select "Mail" and "Other (Custom name)"
     • Copy the 16-character password
   - Update EMAIL_USER and EMAIL_PASS in .env file

3. 🔧 Install dependencies:
   npm install

4. 🚀 Start the development server:
   npm run dev

5. 🌐 Open your browser:
   http://localhost:3000

6. 🔐 Access admin panel:
   http://localhost:3000/admin
   (You'll need to create an admin user first)

📚 Documentation:
- MongoDB Setup: https://docs.mongodb.com/atlas/getting-started/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Node.js: https://nodejs.org/

🆘 Need help? Check the README.md file or create an issue on GitHub.
`);

console.log('✨ Setup complete! Follow the next steps above to finish configuration.');