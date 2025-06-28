#!/bin/bash

# Set environment variables
export DATABASE_URL="mongodb://localhost:27017/memhub"
export PORT=3000
export NODE_ENV=development
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
export JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"
export CLIENT_URL="http://localhost:5173"
export SESSION_SECRET="your-session-secret"

# Start the server
echo "Starting server with environment variables..."
node server.js 