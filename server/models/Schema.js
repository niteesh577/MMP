const mongoose = require('mongoose');

const schemaSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true
  },
  schemas: {
    user_profile: {
      type: Object,
      default: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          preferences: { type: "object" }
        }
      }
    },
    conversation_history: {
      type: Object,
      default: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string", enum: ["user", "assistant"] },
                content: { type: "string" },
                timestamp: { type: "string", format: "date-time" }
              }
            }
          }
        }
      }
    },
    facts: {
      type: Object,
      default: {
        type: "object",
        properties: {
          fact: { type: "string" },
          category: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        }
      }
    },
    preferences: {
      type: Object,
      default: {
        type: "object",
        properties: {
          category: { type: "string" },
          value: { type: "string" },
          priority: { type: "number", minimum: 1, maximum: 10 }
        }
      }
    },
    itineraries: {
      type: Object,
      default: {
        type: "object",
        properties: {
          title: { type: "string" },
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                date: { type: "string", format: "date-time" },
                location: { type: "string" }
              }
            }
          }
        }
      }
    },
    custom: {
      type: Object,
      default: {
        type: "object",
        properties: {}
      }
    }
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

schemaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Schema', schemaSchema); 