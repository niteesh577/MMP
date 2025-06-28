const AuditLog = require('../models/AuditLog');
const { v4: uuidv4 } = require('uuid');

const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to capture response
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Determine status
      let status = 'SUCCESS';
      if (res.statusCode >= 400) {
        status = res.statusCode === 401 ? 'UNAUTHORIZED' : 
                res.statusCode === 403 ? 'FORBIDDEN' : 
                res.statusCode === 404 ? 'NOT_FOUND' : 'ERROR';
      }

      // Create audit log entry
      const auditEntry = {
        timestamp: new Date(),
        agentId: req.body?.agentId || req.params?.agentId || req.query?.agentId,
        userId: req.user?._id || req.apiKey?.userId,
        action,
        resource,
        resourceId: req.params?.id || req.body?.id,
        details: {
          method: req.method,
          url: req.originalUrl,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          requestBody: req.body,
          responseStatus: res.statusCode,
          duration
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        status,
        duration,
        requestId
      };

      // Add error message if applicable
      if (status !== 'SUCCESS') {
        try {
          const responseData = JSON.parse(data);
          auditEntry.errorMessage = responseData.error || responseData.message;
        } catch (e) {
          auditEntry.errorMessage = data;
        }
      }

      // Save audit log asynchronously (don't block response)
      AuditLog.create(auditEntry).catch(err => {
        console.error('Failed to create audit log:', err);
      });

      // Call original send method
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditMiddleware; 