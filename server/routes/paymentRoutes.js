const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all payment routes
router.use(protect);

// Payment CRUD operations
router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createPayment);
router.get('/stats', paymentController.getPaymentStats);
router.get('/:id', paymentController.getPaymentById);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

// Additional payment operations
router.post('/:id/reminder', paymentController.sendReminder);
router.get('/:id/receipt', paymentController.generateReceipt);

module.exports = router;