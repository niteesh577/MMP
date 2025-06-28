const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!keyDoc) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check if key is expired
    if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    // Update last used timestamp
    keyDoc.lastUsed = new Date();
    await keyDoc.save();

    req.apiKey = keyDoc;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
};

const authenticateAgent = async (req, res, next) => {
  // Try JWT first, then API key
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const apiKey = req.headers['x-api-key'];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        return next();
      }
    } catch (error) {
      // Continue to API key authentication
    }
  }

  if (apiKey) {
    try {
      const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
      
      if (keyDoc) {
        if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
          return res.status(401).json({ error: 'API key expired' });
        }

        keyDoc.lastUsed = new Date();
        await keyDoc.save();

        req.apiKey = keyDoc;
        return next();
      }
    } catch (error) {
      // Continue to unauthorized response
    }
  }

  return res.status(401).json({ error: 'Authentication required' });
};

module.exports = {
  authenticateToken,
  authenticateApiKey,
  authenticateAgent
}; 