// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import routes
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const agentRoutes = require("./routes/agents");
const memoryRoutes = require("./routes/memory");
const schemaRoutes = require("./routes/schemas");
const auditLogRoutes = require("./routes/auditLogs");
const subscriptionRoutes = require("./routes/subscriptions");

// Import database connection
const { connectDB } = require("./config/database");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variable in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE_URL,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Pretty-print JSON responses
app.enable('json spaces');
// Enable strict routing for consistent URL paths
app.enable('strict routing');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Memory Protocol Server API',
      version: '1.0.0',
      description: 'A standardized API server for AI agent memory management',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Database connection
connectDB();

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Basic Routes
app.use(basicRoutes);

// Agent discovery endpoint
app.get('/.well-known/memory-agent.json', (req, res) => {
  res.json({
    name: "Memory Protocol Server",
    version: "1.0.0",
    description: "A standardized API server for AI agent memory management",
    endpoints: {
      agents: "/api/agents",
      memory: "/api/memory",
      schemas: "/api/schemas",
      subscriptions: "/api/subscriptions"
    },
    supportedMemoryTypes: [
      "user_profile",
      "conversation_history", 
      "facts",
      "preferences",
      "itineraries",
      "custom"
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(500).json({ 
    error: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`🚀 Memory Protocol Server running at http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api-docs`);
  console.log(`🔍 Agent Discovery at http://localhost:${port}/.well-known/memory-agent.json`);
  console.log(`💚 Health Check at http://localhost:${port}/health`);
});
