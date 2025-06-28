const express = require('express');
const router = express.Router();
const Schema = require('../models/Schema');
const { authenticateAgent } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');
const Ajv = require('ajv');

// Get all schemas
router.get('/', auditMiddleware('READ', 'schema'), async (req, res) => {
  try {
    const schemas = await Schema.find({}).sort({ updatedAt: -1 });
    res.json(schemas);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemas' });
  }
});

// Update schema for an agent
router.put('/:id', authenticateAgent, auditMiddleware('UPDATE', 'schema'), async (req, res) => {
  try {
    const { schemas } = req.body;
    const agentId = req.params.id;

    if (!schemas) {
      return res.status(400).json({ error: 'Schemas are required' });
    }

    // Validate schemas using Ajv
    const ajv = new Ajv();
    for (const [memoryType, schema] of Object.entries(schemas)) {
      try {
        ajv.compile(schema);
      } catch (error) {
        return res.status(400).json({ 
          error: `Invalid schema for ${memoryType}`, 
          details: error.message 
        });
      }
    }

    // Update or create schema
    const schemaDoc = await Schema.findOneAndUpdate(
      { agentId },
      { schemas },
      { new: true, upsert: true }
    );

    res.json(schemaDoc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schema' });
  }
});

// Get schema templates
router.get('/templates', (req, res) => {
  const templates = {
    user_profile: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        age: { type: "number", minimum: 0 },
        preferences: { 
          type: "object",
          properties: {
            theme: { type: "string", enum: ["light", "dark"] },
            language: { type: "string" }
          }
        }
      },
      required: ["name", "email"]
    },
    conversation_history: {
      type: "object",
      properties: {
        messages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              role: { type: "string", enum: ["user", "assistant", "system"] },
              content: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
              metadata: { type: "object" }
            },
            required: ["role", "content"]
          }
        },
        summary: { type: "string" }
      },
      required: ["messages"]
    },
    facts: {
      type: "object",
      properties: {
        fact: { type: "string", minLength: 1 },
        category: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        source: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["fact"]
    },
    preferences: {
      type: "object",
      properties: {
        category: { type: "string", minLength: 1 },
        value: { type: "string" },
        priority: { type: "number", minimum: 1, maximum: 10 },
        description: { type: "string" }
      },
      required: ["category", "value"]
    },
    itineraries: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1 },
        description: { type: "string" },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              date: { type: "string", format: "date-time" },
              location: { type: "string" },
              duration: { type: "number" }
            },
            required: ["title", "date"]
          }
        }
      },
      required: ["title"]
    },
    custom: {
      type: "object",
      properties: {},
      additionalProperties: true
    }
  };

  res.json(templates);
});

// Get schema for specific agent
router.get('/:agentId', auditMiddleware('READ', 'schema'), async (req, res) => {
  try {
    const schema = await Schema.findOne({ agentId: req.params.agentId });
    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schema' });
  }
});

module.exports = router; 