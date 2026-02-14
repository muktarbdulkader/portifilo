// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Define Admin schema
        const adminSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true }
        });

        const Admin = mongoose.model('Admin', adminSchema);

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('mukti123', salt);

        // Create admin user
        const admin = new Admin({
            username: 'muktar',
            password: hashedPassword
        });

        await admin.save();
        console.log('✅ Admin user created successfully!');
        console.log('📋 Default Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
        console.log('   1. Change the password immediately after first login');
        console.log('   2. Use a strong password');
        console.log('   3. Keep your JWT_SECRET safe');
        console.log('   4. Never commit .env file to version control');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin();