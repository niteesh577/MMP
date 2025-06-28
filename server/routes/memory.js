const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const Schema = require('../models/Schema');
const { authenticateAgent } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');
const Ajv = require('ajv');
const ajv = new Ajv();

// Get memory entries with filtering
router.get('/', authenticateAgent, auditMiddleware('READ', 'memory'), async (req, res) => {
  try {
    const { agentId, memoryType, key, limit = 50, offset = 0 } = req.query;
    
    const filter = {};
    if (agentId) filter.agentId = agentId;
    if (memoryType) filter.memoryType = memoryType;
    if (key) filter.key = { $regex: key, $options: 'i' };

    const memories = await Memory.find(filter)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Memory.countDocuments(filter);

    res.json({
      memories,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + memories.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memory entries' });
  }
});

// Create new memory entry
router.post('/', authenticateAgent, auditMiddleware('CREATE', 'memory'), async (req, res) => {
  try {
    const { agentId, memoryType, key, data, metadata } = req.body;

    // Validate required fields
    if (!agentId || !memoryType || !key || !data) {
      return res.status(400).json({ error: 'agentId, memoryType, key, and data are required' });
    }

    // Validate against schema if available
    const schema = await Schema.findOne({ agentId });
    if (schema && schema.schemas[memoryType]) {
      const validate = ajv.compile(schema.schemas[memoryType]);
      const valid = validate(data);
      
      if (!valid) {
        return res.status(400).json({ 
          error: 'Data validation failed', 
          details: validate.errors 
        });
      }
    }

    // Check if memory entry already exists
    const existingMemory = await Memory.findOne({ agentId, memoryType, key });
    if (existingMemory) {
      return res.status(409).json({ error: 'Memory entry already exists' });
    }

    // Create new memory entry
    const memory = new Memory({
      agentId,
      memoryType,
      key,
      data,
      metadata: metadata || {}
    });

    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create memory entry' });
  }
});

// Update memory entry
router.put('/:id', authenticateAgent, auditMiddleware('UPDATE', 'memory'), async (req, res) => {
  try {
    const { data, metadata } = req.body;
    const memoryId = req.params.id;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const memory = await Memory.findById(memoryId);
    if (!memory) {
      return res.status(404).json({ error: 'Memory entry not found' });
    }

    // Validate against schema if available
    const schema = await Schema.findOne({ agentId: memory.agentId });
    if (schema && schema.schemas[memory.memoryType]) {
      const validate = ajv.compile(schema.schemas[memory.memoryType]);
      const valid = validate(data);
      
      if (!valid) {
        return res.status(400).json({ 
          error: 'Data validation failed', 
          details: validate.errors 
        });
      }
    }

    // Update memory entry
    memory.data = data;
    if (metadata) {
      memory.metadata = { ...memory.metadata, ...metadata };
    }
    memory.metadata.version = (memory.metadata.version || 0) + 1;

    await memory.save();
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update memory entry' });
  }
});

// Delete memory entry
router.delete('/', authenticateAgent, auditMiddleware('DELETE', 'memory'), async (req, res) => {
  try {
    const { agentId, memoryType, key } = req.query;

    if (!agentId || !memoryType || !key) {
      return res.status(400).json({ error: 'agentId, memoryType, and key are required' });
    }

    const result = await Memory.deleteOne({ agentId, memoryType, key });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Memory entry not found' });
    }

    res.json({ message: 'Memory entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory entry' });
  }
});

// Get memory entry by ID
router.get('/:id', authenticateAgent, auditMiddleware('READ', 'memory'), async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ error: 'Memory entry not found' });
    }
    res.json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memory entry' });
  }
});

module.exports = router; 