const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { authenticateAgent } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

// Get all subscriptions
router.get('/', authenticateAgent, auditMiddleware('READ', 'subscription'), async (req, res) => {
  try {
    const { agentId, status } = req.query;
    
    const filter = {};
    if (agentId) filter.agentId = agentId;
    if (status) filter.status = status;

    const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Create new subscription
router.post('/', authenticateAgent, auditMiddleware('CREATE', 'subscription'), async (req, res) => {
  try {
    const { agentId, type, endpoint, events } = req.body;

    // Validate required fields
    if (!agentId || !type || !events) {
      return res.status(400).json({ error: 'agentId, type, and events are required' });
    }

    // Validate subscription type
    if (type === 'WEBHOOK' && !endpoint) {
      return res.status(400).json({ error: 'Endpoint is required for webhook subscriptions' });
    }

    // Validate events
    const validEvents = ['memory_created', 'memory_updated', 'memory_deleted', 'agent_status_changed'];
    const invalidEvents = events.filter(event => !validEvents.includes(event));
    if (invalidEvents.length > 0) {
      return res.status(400).json({ error: `Invalid events: ${invalidEvents.join(', ')}` });
    }

    // Create subscription
    const subscription = new Subscription({
      agentId,
      type,
      endpoint,
      events,
      secret: type === 'WEBHOOK' ? uuidv4() : undefined
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Delete subscription
router.delete('/:id', authenticateAgent, auditMiddleware('DELETE', 'subscription'), async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

// Update subscription status
router.patch('/:id/status', authenticateAgent, auditMiddleware('UPDATE', 'subscription'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'paused', 'error'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription status' });
  }
});

// SSE endpoint for real-time events
router.get('/events', (req, res) => {
  const { agentId } = req.query;

  if (!agentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connection', message: 'Connected to SSE stream' })}\n\n`);

  // Store client connection for later use
  const clientId = uuidv4();
  req.app.locals.sseClients = req.app.locals.sseClients || new Map();
  req.app.locals.sseClients.set(clientId, { res, agentId });

  // Handle client disconnect
  req.on('close', () => {
    req.app.locals.sseClients.delete(clientId);
  });
});

// Webhook delivery endpoint (for testing)
router.post('/webhook-test', async (req, res) => {
  try {
    const { subscriptionId, event, data } = req.body;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.type !== 'WEBHOOK') {
      return res.status(400).json({ error: 'Subscription is not a webhook' });
    }

    // Simulate webhook delivery
    const webhookData = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      event,
      data,
      subscription: {
        id: subscription._id,
        agentId: subscription.agentId
      }
    };

    // In a real implementation, you would send this to the endpoint
    console.log('Webhook would be sent to:', subscription.endpoint);
    console.log('Webhook data:', webhookData);

    res.json({ message: 'Webhook test completed', data: webhookData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to test webhook' });
  }
});

module.exports = router; 