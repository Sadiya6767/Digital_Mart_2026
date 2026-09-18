const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// Ensure DB initialization
require('./config/db');

const candidateRoutes = require('./routes/candidateRoutes');
const testRoutes = require('./routes/testRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if needed (restricted, admin route handles resume streaming)
app.use('/uploads', express.static(config.UPLOAD_DIR));

// API Routes
app.use('/api/candidates', candidateRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    company: 'Digital Mart Solutions',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.'
  });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Digital Mart Solutions Assessment Server Running!  `);
  console.log(` Port: ${PORT}                                       `);
  console.log(` Health: http://localhost:${PORT}/api/health        `);
  console.log(`====================================================`);
});
