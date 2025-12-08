// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// Middleware to check token
function auth(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.admin = decoded;
        next();
    } catch (e) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign({
            id: admin._id,
            username: admin.username
        }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '1d'
        });

        res.json({
            success: true,
            token,
            user: {
                id: admin._id,
                username: admin.username
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Get all messages with pagination
router.get('/messages', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({}, 'name email subject message status createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Message.countDocuments()
        ]);

        res.json({
            success: true,
            data: messages,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

// Get single message
router.get('/messages/:id', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching message'
        });
    }
});

// Update message status
router.put('/messages/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['new', 'read', 'replied', 'archived', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error updating message status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating message status'
        });
    }
});

// Delete message
router.delete('/messages/:id', auth, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
});

// Send email reply
router.post('/send-email', auth, async (req, res) => {
    try {
        const { to, subject, message } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'To, subject, and message are required'
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send email
        const mailOptions = {
            from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">${message.replace(/\n/g, '<br>')}</div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin email sent:', info.messageId);

        res.json({
            success: true,
            message: 'Email sent successfully',
            info: {
                messageId: info.messageId,
                response: info.response
            }
        });

    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: err.message
        });
    }
});

// Get admin stats
router.get('/stats', auth, async (req, res) => {
    try {
        const totalMessages = await Message.countDocuments();
        const newMessages = await Message.countDocuments({ status: 'new' });
        const readMessages = await Message.countDocuments({ status: 'read' });
        const repliedMessages = await Message.countDocuments({ status: 'replied' });
        const archivedMessages = await Message.countDocuments({ status: 'archived' });

        res.json({
            success: true,
            stats: {
                totalMessages,
                newMessages,
                readMessages,
                repliedMessages,
                archivedMessages
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

// Verify admin token (for checking if token is valid)
router.get('/verify', auth, async (req, res) => {
    res.json({
        success: true,
        user: req.admin
    });
});

module.exports = router;