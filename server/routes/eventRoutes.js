// server/routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Event routes
router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.patch('/:id/attendee', eventController.updateAttendeeStatus);

module.exports = router;