# 🚀 Production Deployment Guide

This guide will help you deploy your Memory Protocol API to production so anyone can use it.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **MongoDB Database** - You'll need a MongoDB instance (MongoDB Atlas recommended)
3. **Railway Account** - Free hosting platform (recommended)

## 🎯 Quick Deployment (Railway - Recommended)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Ensure your repository structure:**
   ```
   Memory-management-protocol/
   └── MemHubServer/
       ├── server/
       │   ├── server.js
       │   ├── package.json
       │   └── ...
       ├── railway.json
       ├── deploy.sh
       └── README.md
   ```

### Step 2: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   cd Memory-management-protocol/MemHubServer
   ./deploy.sh
   ```

### Step 3: Configure Environment Variables

In the Railway dashboard, set these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | `your-super-secret-key-here` | Strong secret for JWT tokens |
| `JWT_REFRESH_SECRET` | `your-refresh-secret-key-here` | Strong secret for refresh tokens |
| `NODE_ENV` | `production` | Environment setting |
| `PORT` | `3000` | Port (Railway will override this) |

### Step 4: Get Your API URL

Railway will provide you with a URL like:
```
https://your-app-name.railway.app
```

## 🔧 Alternative Deployment Options

### Option 2: Render

1. **Connect your GitHub repo to Render**
2. **Create a new Web Service**
3. **Configure:**
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Environment:** Node
4. **Add environment variables** (same as Railway)

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create app:**
   ```bash
   heroku create your-memory-protocol-app
   ```
3. **Add MongoDB:**
   ```bash
   heroku addons:create mongolab
   ```
4. **Deploy:**
   ```bash
   git push heroku main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create a free MongoDB Atlas account**
2. **Create a new cluster**
3. **Get your connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/memhub?retryWrites=true&w=majority
   ```
4. **Replace username, password, and cluster details**

### Local MongoDB (Development Only)

For local development, you can use:
```
mongodb://localhost:27017/memhub
```

## 🔐 Security Configuration

### Generate Strong Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32
openssl rand -base64 32
```

### Environment Variables Checklist

- ✅ `DATABASE_URL` - MongoDB connection string
- ✅ `JWT_SECRET` - 32+ character random string
- ✅ `JWT_REFRESH_SECRET` - 32+ character random string
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Usually set by hosting platform

## 📊 Monitoring & Health Checks

### Health Check Endpoint

Your API will have a health check at:
```
https://your-app.railway.app/health
```

### API Documentation

Interactive API docs at:
```
https://your-app.railway.app/api-docs
```

## 🧪 Testing Your Deployment

### 1. Health Check

```bash
curl https://your-app.railway.app/health
```

### 2. Register a User

```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 3. Test with Python Client

```python
from memory_protocol_client import MemoryProtocolClient

# Initialize client with your production URL
client = MemoryProtocolClient("https://your-app.railway.app")

# Register and test
try:
    result = client.register("Test Agent", "agent@example.com", "password123")
    print("✅ Registration successful!")
except Exception as e:
    print(f"❌ Error: {e}")
```

## 📈 Scaling Considerations

### Free Tier Limits

- **Railway:** $5/month after free tier
- **Render:** Free tier available
- **Heroku:** No free tier anymore

### Performance Optimization

1. **Database Indexing:** MongoDB Atlas handles this automatically
2. **Caching:** Consider Redis for high-traffic scenarios
3. **CDN:** For static assets (if you add them later)

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🆘 Troubleshooting

### Common Issues

1. **"DATABASE_URL not set"**
   - Check environment variables in your hosting platform

2. **"JWT_SECRET not set"**
   - Generate and set JWT secrets

3. **"Connection refused"**
   - Check MongoDB connection string
   - Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0

4. **"Port already in use"**
   - Hosting platforms usually handle this automatically

### Getting Help

1. **Check logs** in your hosting platform dashboard
2. **Test locally** first with the same environment variables
3. **Use the health check endpoint** to verify deployment

## 🎉 Success!

Once deployed, your Memory Protocol API will be available at:
```
https://your-app.railway.app
```

Anyone can now:
- Register accounts
- Create agents
- Store and retrieve memory
- Use the Python client library
- Access API documentation

Share your API URL with the community! 🚀 