const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  hashedKey: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the API key before saving
apiKeySchema.pre('save', async function(next) {
  if (this.isModified('key')) {
    this.hashedKey = await bcrypt.hash(this.key, 10);
  }
  next();
});

// Method to verify API key
apiKeySchema.methods.verifyKey = async function(key) {
  return bcrypt.compare(key, this.hashedKey);
};

module.exports = mongoose.model('ApiKey', apiKeySchema); 