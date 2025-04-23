/**
 * server/routes/dashboardRoutes.js
 * Routes for the dashboard API endpoints
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(protect);

// Dashboard routes
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/revenue', dashboardController.getRevenueStats);
router.get('/maintenance-stats', dashboardController.getMaintenanceStats);
router.get('/occupancy', dashboardController.getOccupancyStats);
router.get('/events', dashboardController.getUpcomingEvents);

module.exports = router;