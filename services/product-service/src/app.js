const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const db = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Product Service] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// API Routes
app.use('/api/products', productRoutes);

// Service Liveness Health Check (checks if server is running)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'UP',
    service: 'product-service',
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
      service: 'product-service',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Readiness Database Error in Products Service:', error.message);
    return res.status(500).json({
      status: 'NOT_READY',
      service: 'product-service',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Product Service Error]:', err.stack);
  res.status(500).json({ error: 'Something went wrong inside Product Service!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Product Services running on port ${PORT}`);
});
