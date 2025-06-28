const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const User = require('../models/User.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiKey = require('../models/ApiKey');
const { authenticateToken } = require('../middleware/auth');
const auditMiddleware = require('../middleware/audit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.post('/login', auditMiddleware('LOGIN', 'user'), async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', auditMiddleware('REGISTER', 'user'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');
    
    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticateToken, auditMiddleware('LOGOUT', 'user'), (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

router.get('/api-keys', authenticateToken, auditMiddleware('READ', 'api_key'), async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    // Mask the keys for security
    const maskedKeys = apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      key: key.key.substring(0, 8) + '...',
      permissions: key.permissions,
      isActive: key.isActive,
      lastUsed: key.lastUsed,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt
    }));

    res.json(maskedKeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

router.post('/api-keys', authenticateToken, auditMiddleware('CREATE', 'api_key'), async (req, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate API key
    const apiKey = uuidv4().replace(/-/g, '');

    const keyDoc = new ApiKey({
      name,
      key: apiKey,
      userId: req.user._id,
      permissions: permissions || ['read'],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await keyDoc.save();

    // Return the full key only once
    res.status(201).json({
      id: keyDoc._id,
      name: keyDoc.name,
      key: apiKey, // Full key only on creation
      permissions: keyDoc.permissions,
      expiresAt: keyDoc.expiresAt,
      createdAt: keyDoc.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

router.delete('/api-keys/:id', authenticateToken, auditMiddleware('DELETE', 'api_key'), async (req, res) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

router.get('/jwt-config', authenticateToken, (req, res) => {
  res.json({
    secret: process.env.JWT_SECRET ? '***configured***' : '***not configured***',
    expiresIn: '24h',
    algorithm: 'HS256'
  });
});

router.put('/jwt-config', authenticateToken, auditMiddleware('UPDATE', 'user'), (req, res) => {
  // In a real implementation, you would update the JWT secret
  // For now, we'll just return a message
  res.json({ 
    message: 'JWT configuration updated. Please restart the server for changes to take effect.',
    note: 'In production, update the JWT_SECRET environment variable'
  });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name
  });
});

module.exports = router;
