const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    index: true
  },
  memoryType: {
    type: String,
    required: true,
    enum: ['user_profile', 'conversation_history', 'facts', 'preferences', 'itineraries', 'custom']
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    version: {
      type: Number,
      default: 1
    },
    tags: [String],
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
memorySchema.index({ agentId: 1, memoryType: 1, key: 1 }, { unique: true });
memorySchema.index({ agentId: 1, memoryType: 1 });
memorySchema.index({ 'metadata.expiresAt': 1 }, { expireAfterSeconds: 0 });

memorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Memory', memorySchema); 