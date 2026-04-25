const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/error');
const { sendSuccess } = require('./utils/response');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN
}));

// Logger
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parser
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// v1 routes
app.use('/api/v1', require('./routes/v1'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Endpoint not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
