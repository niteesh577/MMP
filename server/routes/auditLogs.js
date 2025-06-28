const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticateToken } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

// Get audit logs with filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      agentId,
      action,
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      search
    } = req.query;

    const filter = {};

    if (agentId) filter.agentId = agentId;
    if (action) filter.action = action;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { agentId: { $regex: search, $options: 'i' } },
        { resourceId: { $regex: search, $options: 'i' } },
        { errorMessage: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await AuditLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + logs.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Export audit logs
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const {
      agentId,
      action,
      status,
      startDate,
      endDate,
      format = 'json'
    } = req.query;

    const filter = {};

    if (agentId) filter.agentId = agentId;
    if (action) filter.action = action;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });

    if (format === 'csv') {
      const csvWriter = createCsvWriter({
        path: path.join(__dirname, '../temp/audit_logs.csv'),
        header: [
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'agentId', title: 'Agent ID' },
          { id: 'userId', title: 'User ID' },
          { id: 'action', title: 'Action' },
          { id: 'resource', title: 'Resource' },
          { id: 'resourceId', title: 'Resource ID' },
          { id: 'status', title: 'Status' },
          { id: 'duration', title: 'Duration (ms)' },
          { id: 'ipAddress', title: 'IP Address' },
          { id: 'errorMessage', title: 'Error Message' }
        ]
      });

      const csvData = logs.map(log => ({
        timestamp: log.timestamp.toISOString(),
        agentId: log.agentId || '',
        userId: log.userId || '',
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId || '',
        status: log.status,
        duration: log.duration || 0,
        ipAddress: log.ipAddress || '',
        errorMessage: log.errorMessage || ''
      }));

      await csvWriter.writeRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      
      const fileStream = fs.createReadStream(path.join(__dirname, '../temp/audit_logs.csv'));
      fileStream.pipe(res);

      // Clean up file after sending
      fileStream.on('end', () => {
        fs.unlinkSync(path.join(__dirname, '../temp/audit_logs.csv'));
      });
    } else {
      res.json(logs);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

// Get audit log statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const stats = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
          },
          errorCount: {
            $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] }
          },
          unauthorizedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'UNAUTHORIZED'] }, 1, 0] }
          }
        }
      }
    ]);

    const actionStats = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const resourceStats = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$resource',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalRequests: 0,
        avgDuration: 0,
        successCount: 0,
        errorCount: 0,
        unauthorizedCount: 0
      },
      actions: actionStats,
      resources: resourceStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

module.exports = router; 