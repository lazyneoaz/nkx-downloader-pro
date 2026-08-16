const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const downloadRoutes = require('./routes/downloader.routes');
const searchRoutes = require('./routes/search.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Basic rate limiting to protect against abuse (adjust as needed)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again shortly.',
  },
});
app.use(limiter);

// Health check / root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Media Downloader API is running.',
    endpoints: {
      health: 'GET /api/health',
      download: 'GET /api/download/*',
      search: 'GET /api/search/*',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// Feature routes
app.use('/api/download', downloadRoutes);
app.use('/api/search', searchRoutes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
