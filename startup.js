#!/usr/bin/env node

/**
 * Full-Stack Portfolio System Startup Script
 * Initializes and verifies all components
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║     🚀 Full-Stack Portfolio System Startup                          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

// Check Node version
const nodeVersion = process.version;
const requiredVersion = 'v14.0.0';
console.log(`📦 Node.js Version: ${nodeVersion}`);

if (nodeVersion < requiredVersion) {
    console.error(`❌ Node.js ${requiredVersion} or higher is required`);
    process.exit(1);
}

// Check environment file
console.log('\n🔍 Checking Environment Configuration...');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env file not found!');
    console.log('📝 Creating .env from .env.example...');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        console.log('✅ .env file created. Please configure it with your values.');
    } else {
        console.error('❌ .env.example not found. Please create .env manually.');
    }
}

// Load environment variables
require('dotenv').config();

// Check required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'EMAIL_USER',
    'EMAIL_PASS',
    'ADMIN_TOKEN'
];

console.log('\n🔐 Verifying Environment Variables...');
let missingVars = [];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.log(`❌ ${varName}: Missing`);
        missingVars.push(varName);
    } else {
        const value = varName.includes('PASS') || varName.includes('TOKEN') 
            ? '***' + process.env[varName].slice(-4)
            : process.env[varName].substring(0, 20) + '...';
        console.log(`✅ ${varName}: ${value}`);
    }
});

if (missingVars.length > 0) {
    console.log('\n⚠️  Missing required environment variables:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log('\n📖 Please configure these in your .env file');
    console.log('   See FULL-STACK-INTEGRATION.md for details\n');
}

// Check required files
console.log('\n📁 Checking Required Files...');
const requiredFiles = [
    'server.js',
    'package.json',
    'public/index.html',
    'public/admin.html',
    'public/ai-chatbot.js',
    'public/ai-chatbot.css',
    'models/Message.js',
    'models/ChatConversation.js'
];

let missingFiles = [];
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - Missing`);
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.error('\n❌ Missing required files. System cannot start.');
    process.exit(1);
}

// Check node_modules
console.log('\n📦 Checking Dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules not found');
    console.log('📥 Please run: npm install');
    process.exit(1);
} else {
    console.log('✅ Dependencies installed');
}

// System summary
console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                     System Status Summary                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ✅ Node.js Version: ${nodeVersion.padEnd(48)}║
║  ${missingVars.length === 0 ? '✅' : '⚠️ '} Environment Variables: ${(missingVars.length === 0 ? 'Configured' : missingVars.length + ' missing').padEnd(40)}║
║  ✅ Required Files: All present                                     ║
║  ✅ Dependencies: Installed                                         ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                     Available Features                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  🌐 Portfolio Website                                               ║
║  🤖 AI Chatbot System                                               ║
║  📊 Analytics Tracking                                              ║
║  👨‍💼 Admin Dashboard                                                 ║
║  📧 Email Notifications                                             ║
║  💾 MongoDB Integration                                             ║
║  🔐 Secure Authentication                                           ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                     Quick Start Commands                             ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Start Server:     npm start                                        ║
║  View Website:     http://localhost:3000                            ║
║  Admin Panel:      http://localhost:3000/admin                      ║
║  Test Chatbot:     http://localhost:3000/test-chatbot.html         ║
║  API Health:       http://localhost:3000/api/health                 ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                     Documentation                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  📖 Full Integration:  FULL-STACK-INTEGRATION.md                    ║
║  🤖 Chatbot Setup:     CHATBOT-SETUP.md                             ║
║  🐛 Troubleshooting:   CHATBOT-TROUBLESHOOTING.md                   ║
║  📚 API Reference:     FULL-STACK-INTEGRATION.md                    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`);

if (missingVars.length === 0) {
    console.log('✅ System is ready to start!');
    console.log('\n🚀 Run: npm start\n');
} else {
    console.log('⚠️  Please configure missing environment variables before starting');
    console.log('📖 See .env.example for reference\n');
}
