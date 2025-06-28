const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const { authenticateAgent } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');

// Get all agents
router.get('/', auditMiddleware('READ', 'agent'), async (req, res) => {
  try {
    const agents = await Agent.find({}).sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Register new agent
router.post('/', auditMiddleware('CREATE', 'agent'), async (req, res) => {
  try {
    const { agentId, name, memoryTypes, schemaUrl, authenticationMethod } = req.body;

    // Validate required fields
    if (!agentId || !name || !memoryTypes) {
      return res.status(400).json({ error: 'agentId, name, and memoryTypes are required' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ agentId });
    if (existingAgent) {
      return res.status(409).json({ error: 'Agent with this ID already exists' });
    }

    // Create new agent
    const agent = new Agent({
      agentId,
      name,
      memoryTypes,
      schemaUrl,
      authenticationMethod: authenticationMethod || 'Bearer JWT',
      status: 'online'
    });

    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Delete agent
router.delete('/:id', auditMiddleware('DELETE', 'agent'), async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Update agent status
router.patch('/:id/status', auditMiddleware('UPDATE', 'agent'), async (req, res) => {
  try {
    const { status } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        lastSeen: new Date()
      },
      { new: true }
    );
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update agent status' });
  }
});

// Get agent discovery endpoint
router.get('/.well-known/memory-agent.json', (req, res) => {
  res.json({
    name: "Memory Protocol Server",
    version: "1.0.0",
    description: "A standardized API server for AI agent memory management",
    endpoints: {
      agents: "/api/agents",
      memory: "/api/memory",
      schemas: "/api/schemas",
      subscriptions: "/api/subscriptions"
    },
    supportedMemoryTypes: [
      "user_profile",
      "conversation_history", 
      "facts",
      "preferences",
      "itineraries",
      "custom"
    ]
  });
});

module.exports = router; 