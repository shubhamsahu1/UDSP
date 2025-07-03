const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate JWT_SECRET strength in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters long in production');
  process.exit(1);
}

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === 'production';

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
if (isProduction) {
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://yourdomain.com'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
} else {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Serve static files from the React app (only in production)
if (isProduction) {
  const distPath = path.join(__dirname, '../client/build');
  
  // Check if dist folder exists
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // Catch-all handler: send back React's index.html file for any non-API routes
    app.get('/*', function (req, res) {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // If dist folder doesn't exist, show helpful error
    app.get('/*', function (req, res) {
      res.status(500).json({
        success: false,
        message: 'Production build not found. Please run "npm run build" first.',
        error: 'ENOENT: no such file or directory, stat client/dist/index.html'
      });
    });
  }
} else {
  // In development, just serve API routes
  app.get('/', function (req, res) {
    res.json({
      success: true,
      message: 'API Server is running. Please start the React development server with "npm run client"',
      apiUrl: `http://localhost:${PORT}/api`
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (isProduction) {
    console.log(`📦 Serving production build from client/dist`);
  } else {
    console.log(`🔧 Development mode - React dev server should run on port 3000`);
    console.log(`💡 Run "npm run client" to start the React development server`);
  }
}); 