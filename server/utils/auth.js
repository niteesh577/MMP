const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
