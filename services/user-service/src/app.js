const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[User Service] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/users', userRoutes);

// Service Liveness Health Check (checks if server is running)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Service Readiness Check (checks external dependencies like database)
app.get('/ready', async (req, res) => {
  try {
    // Check DB connection
    await db.query('SELECT 1');
    return res.status(200).json({
      status: 'READY',
      service: 'user-service',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Readiness Database Error in User Service:', error.message);
    return res.status(500).json({
      status: 'NOT_READY',
      service: 'user-service',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[User Service Error]:', err.stack);
  res.status(500).json({ error: 'Somethings went wrong inside User Service!s' });
});

// Start server
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
