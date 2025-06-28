# Memory Protocol Server

A standardized API server for AI agents to manage memory data. This server implements the Memory Protocol specification, providing RESTful endpoints for agent memory management.

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Create .env file with:
   DATABASE_URL=mongodb://localhost:27017/memhub
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
   CLIENT_URL=http://localhost:5173
   SESSION_SECRET=your-session-secret
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Access API documentation:**
   - Swagger UI: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

## 🌐 Production Deployment

### Option 1: Railway (Recommended)

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
   railway init
   railway up
   ```

4. **Set environment variables in Railway dashboard:**
   - `DATABASE_URL`: Your MongoDB connection string
   - `JWT_SECRET`: Strong secret key
   - `JWT_REFRESH_SECRET`: Strong refresh secret key
   - `NODE_ENV`: production

### Option 2: Render

1. **Connect your GitHub repo to Render**
2. **Create a new Web Service**
3. **Set build command:** `cd server && npm install`
4. **Set start command:** `cd server && npm start`
5. **Add environment variables**

### Option 3: Heroku

1. **Install Heroku CLI**
2. **Create app:**
   ```bash
   heroku create your-memory-protocol-app
   ```
3. **Add MongoDB addon:**
   ```bash
   heroku addons:create mongolab
   ```
4. **Deploy:**
   ```bash
   git push heroku main
   ```

## 📚 API Usage

### Authentication

```bash
# Register a new user
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Agent Name","email":"agent@example.com","password":"password123"}'

# Login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"password123"}'
```

### Memory Operations

```bash
# Store memory
curl -X POST https://your-app.railway.app/api/memory \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-123",
    "type": "conversation_history",
    "content": "User: Hello, Agent: Hi there!",
    "metadata": {"session": "abc123"}
  }'

# Retrieve memory
curl -X GET "https://your-app.railway.app/api/memory?agentId=agent-123&type=conversation_history" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Python Integration

```python
import requests

# Base URL for your deployed API
BASE_URL = "https://your-app.railway.app"

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "email": "agent@example.com",
    "password": "password123"
})
tokens = response.json()
access_token = tokens["accessToken"]

# Headers for authenticated requests
headers = {"Authorization": f"Bearer {access_token}"}

# Store memory
memory_data = {
    "agentId": "my-agent",
    "type": "conversation_history",
    "content": "User asked about weather, agent provided forecast",
    "metadata": {"session": "weather-chat"}
}
response = requests.post(f"{BASE_URL}/api/memory", json=memory_data, headers=headers)

# Retrieve memory
response = requests.get(f"{BASE_URL}/api/memory", params={
    "agentId": "my-agent",
    "type": "conversation_history"
}, headers=headers)
memories = response.json()
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `CLIENT_URL` | Frontend URL for CORS | No |
| `SESSION_SECRET` | Session secret | No |

## 📖 API Endpoints

- **Authentication:** `/api/auth/*`
- **Agents:** `/api/agents`
- **Memory:** `/api/memory`
- **Schemas:** `/api/schemas`
- **Audit Logs:** `/api/audit-logs`
- **Subscriptions:** `/api/subscriptions`
- **API Documentation:** `/api-docs`
- **Health Check:** `/health`

## 🔒 Security

- JWT-based authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Audit logging

## 📝 License

MIT License - feel free to use this for your projects! 