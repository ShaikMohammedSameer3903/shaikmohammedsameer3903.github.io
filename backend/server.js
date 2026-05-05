const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pipelineRoutes = require('./routes/pipelineRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'https://ShaikMohammedSameer3903.github.io',
  'https://ShaikMohammedSameer3903.github.io/PipeLinePro',
  'https://pipeline-pro.tech',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now — tighten in production
  },
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', pipelineRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CI/CD Pipeline Builder API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CI/CD Pipeline Builder API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Generate endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`⚡ Simulate endpoint: http://localhost:${PORT}/api/simulate`);
  console.log(`📋 Templates endpoint: http://localhost:${PORT}/api/templates`);
});

module.exports = app;
