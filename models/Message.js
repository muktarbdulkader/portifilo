// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    subject: {
        type: String,
        trim: true,
        default: ''
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'archived', 'spam', 'sent', 'failed'],
        default: 'new',
        index: true
    },
    ip: String,
    userAgent: String,
    referrer: String,
    isSubscribed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better query performance
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Static method to get message stats
messageSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return stats.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, { total: await this.countDocuments() });
};

// Pre-save hook to sanitize inputs
messageSchema.pre('save', function () {
    try {
        // Remove any HTML tags from text fields
        const sanitize = (str) => String(str || '').replace(/<[^>]*>?/gm, '');

        this.name = sanitize(this.name);
        this.email = sanitize(this.email).toLowerCase();
        this.subject = this.subject ? sanitize(this.subject) : '';
        this.message = sanitize(this.message);


    } catch (error) {
        console.log('err')



    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;