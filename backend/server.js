const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON requests

// Routes
app.use('/api/notifications', require('./routes/notifications'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: ' Notification API is running!',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Backend Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});
