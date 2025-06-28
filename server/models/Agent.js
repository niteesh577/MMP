const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  memoryTypes: [{
    type: String,
    enum: ['user_profile', 'conversation_history', 'facts', 'preferences', 'itineraries', 'custom'],
    required: true
  }],
  schemaUrl: {
    type: String,
    trim: true
  },
  authenticationMethod: {
    type: String,
    enum: ['Bearer JWT', 'API Key'],
    default: 'Bearer JWT'
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
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

agentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Agent', agentSchema); 