#!/bin/bash

# Memory Protocol Server Deployment Script
# This script helps you deploy your Memory Protocol API to production

echo "🚀 Memory Protocol Server Deployment"
echo "====================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables in Railway dashboard:"
echo "   - DATABASE_URL:"
echo "   - JWT_SECRET:"
echo "   - JWT_REFRESH_SECRET: "
echo "   - NODE_ENV: production"
echo ""
echo "2. Get your API URL from Railway dashboard"
echo "3. Update the base_url in your client code"
echo ""
echo "📚 API Documentation will be available at:"
echo "   https://your-app.railway.app/api-docs"
echo ""
echo "🔍 Health check:"
echo "   https://your-app.railway.app/health" 
