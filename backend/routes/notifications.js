const express = require('express');
const {
  getEmployeeNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// Define API routes
router.get('/employee', getEmployeeNotifications);     // GET /api/notifications/employee
router.post('/mark-read', markAsRead);                // POST /api/notifications/mark-read
router.post('/mark-all-read', markAllAsRead);         // POST /api/notifications/mark-all-read

module.exports = router;

//devlier map - tells backend when they visit api routes