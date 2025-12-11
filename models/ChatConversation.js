const mongoose = require('mongoose');

const chatConversationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    userAgent: String,
    language: String,
    referrer: String,
    deviceInfo: Object
  },
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    botMessages: {
      type: Number,
      default: 0
    },
    duration: Number,
    topics: [String],
    satisfaction: Number
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatConversationSchema.index({ createdAt: -1 });
chatConversationSchema.index({ sessionId: 1, userId: 1 });
chatConversationSchema.index({ status: 1 });

// Virtual for conversation duration
chatConversationSchema.virtual('conversationDuration').get(function() {
  if (this.messages.length < 2) return 0;
  const firstMessage = this.messages[0].timestamp;
  const lastMessage = this.messages[this.messages.length - 1].timestamp;
  return lastMessage - firstMessage;
});

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
