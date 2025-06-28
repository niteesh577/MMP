const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  agentId: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'REGISTER', 'AUTH_FAILED']
  },
  resource: {
    type: String,
    required: true,
    enum: ['agent', 'memory', 'schema', 'user', 'subscription', 'api_key']
  },
  resourceId: String,
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND']
  },
  errorMessage: String,
  duration: Number, // Request duration in milliseconds
  requestId: String // For correlation
});

// Indexes for efficient querying
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ agentId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema); 