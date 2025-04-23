// server/routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all tickets (filtered by role)
router.get('/', maintenanceController.getAllTickets);

// Get tickets for a specific property
router.get('/property/:propertyId', maintenanceController.getPropertyTickets);

// Get tenant's tickets (tenant only)
router.get('/tenant', authorizeRoles(['tenant']), maintenanceController.getTenantTickets);

// Get a specific ticket
router.get('/:ticketId', maintenanceController.getTicketById);

// Create a new ticket
router.post('/', upload.array('images', 5), maintenanceController.createTicket);

// Update a ticket
router.put('/:ticketId', upload.array('images', 5), maintenanceController.updateTicket);

// Update ticket status (admin and manager only)
router.patch('/:ticketId/status', 
  authorizeRoles(['admin', 'manager']), 
  maintenanceController.updateStatus
);

// Delete a ticket (admin and manager only)
router.delete('/:ticketId', 
  authorizeRoles(['admin', 'manager']), 
  maintenanceController.deleteTicket
);

// Add a comment to a ticket
router.post('/:ticketId/comments', maintenanceController.addComment);

module.exports = router;