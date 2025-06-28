const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['SSE', 'WEBHOOK']
  },
  endpoint: {
    type: String,
    required: function() { return this.type === 'WEBHOOK'; }
  },
  events: [{
    type: String,
    enum: ['memory_created', 'memory_updated', 'memory_deleted', 'agent_status_changed'],
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'error'],
    default: 'active'
  },
  lastDelivery: Date,
  lastError: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  secret: String, // For webhook signature verification
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 