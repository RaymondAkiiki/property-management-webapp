const Payment = require('../models/Payment');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailSender');
const { generatePdf } = require('../utils/pdfGenerator');
const mongoose = require('mongoose');

// Helper function to populate payment details
const populatePayment = async (paymentId) => {
  return await Payment.findById(paymentId)
    .populate('property', 'name address')
    .populate('tenant', 'firstName lastName email')
    .populate('createdBy', 'name email')
    .exec();
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { property, tenant, startDate, endDate, status } = req.query;
    const filter = { userId: req.user.id };
    
    if (property) filter.property = property;
    if (tenant) filter.tenant = tenant;
    if (status) filter.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('property', 'name address')
      .populate('tenant', 'firstName lastName email')
      .sort({ dueDate: -1 })
      .exec();

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await populatePayment(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if the payment belongs to the current user
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this payment' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

// Create new payment
exports.createPayment = async (req, res) => {
  try {
    const {
      property,
      tenant,
      amount,
      dueDate,
      description,
      category,
      status,
      paymentMethod
    } = req.body;

    // Validate property and tenant exist
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(400).json({ message: 'Property not found' });
    }

    const tenantExists = await Tenant.findById(tenant);
    if (!tenantExists) {
      return res.status(400).json({ message: 'Tenant not found' });
    }

    const newPayment = new Payment({
      property,
      tenant,
      amount,
      dueDate: new Date(dueDate),
      description,
      category,
      status: status || 'pending',
      paymentMethod,
      userId: req.user.id,
      createdBy: req.user.id
    });

    await newPayment.save();
    
    const populatedPayment = await populatePayment(newPayment._id);
    
    // If payment is created and status is pending, send a notification to tenant
    if (status === 'pending' && tenantExists.email) {
      await sendEmail({
        to: tenantExists.email,
        subject: 'New Payment Due',
        text: `You have a new payment of $${amount} due on ${new Date(dueDate).toLocaleDateString()}. Description: ${description}`
      });
    }

    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const {
      property,
      tenant,
      amount,
      dueDate,
      description,
      category,
      status,
      paymentMethod,
      paidDate,
      notes
    } = req.body;

    // Check if payment exists
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this payment' });
    }

    // Track previous status for notification
    const previousStatus = payment.status;

    // Update payment fields
    payment.property = property || payment.property;
    payment.tenant = tenant || payment.tenant;
    payment.amount = amount || payment.amount;
    payment.dueDate = dueDate ? new Date(dueDate) : payment.dueDate;
    payment.description = description || payment.description;
    payment.category = category || payment.category;
    payment.status = status || payment.status;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.notes = notes || payment.notes;
    
    // If status changed to paid, record paid date
    if (status === 'paid' && previousStatus !== 'paid') {
      payment.paidDate = paidDate ? new Date(paidDate) : new Date();
    }

    await payment.save();
    
    const populatedPayment = await populatePayment(payment._id);
    
    // If status changed to paid, send a receipt to tenant
    if (status === 'paid' && previousStatus !== 'paid') {
      const tenant = await Tenant.findById(payment.tenant);
      if (tenant && tenant.email) {
        // Generate receipt PDF
        const receiptPath = await generatePdf({
          title: 'Payment Receipt',
          data: {
            paymentId: payment._id.toString(),
            property: populatedPayment.property.name,
            tenant: `${tenant.firstName} ${tenant.lastName}`,
            amount: payment.amount,
            date: new Date().toLocaleDateString(),
            description: payment.description,
            paymentMethod: payment.paymentMethod
          }
        });
        
        await sendEmail({
          to: tenant.email,
          subject: 'Payment Receipt',
          text: `Thank you for your payment of $${payment.amount} for ${payment.description}.`,
          attachments: [{ path: receiptPath, filename: 'receipt.pdf' }]
        });
      }
    }

    res.status(200).json(populatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns this payment
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this payment' });
    }
    
    await Payment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Payment successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    // Calculate stats
    const stats = {
      total: await Payment.countDocuments({ userId }),
      pending: await Payment.countDocuments({ userId, status: 'pending' }),
      paid: await Payment.countDocuments({ userId, status: 'paid' }),
      overdue: await Payment.countDocuments({ 
        userId, 
        status: 'pending', 
        dueDate: { $lt: today } 
      }),
      thisMonth: {
        expected: await Payment.aggregate([
          { 
            $match: { 
              userId: mongoose.Types.ObjectId(userId),
              dueDate: { $gte: startOfMonth, $lte: endOfMonth } 
            } 
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(result => result[0]?.total || 0),
        received: await Payment.aggregate([
          { 
            $match: { 
              userId: mongoose.Types.ObjectId(userId),
              status: 'paid',
              paidDate: { $gte: startOfMonth, $lte: endOfMonth } 
            } 
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]).then(result => result[0]?.total || 0)
      }
    };
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error getting payment statistics', error: error.message });
  }
};

// Send payment reminder
exports.sendReminder = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('property', 'name address')
      .populate('tenant', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns this payment
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to send reminder for this payment' });
    }
    
    // Check if tenant has email
    if (!payment.tenant.email) {
      return res.status(400).json({ message: 'Tenant does not have an email address' });
    }
    
    // Send reminder email
    await sendEmail({
      to: payment.tenant.email,
      subject: 'Payment Reminder',
      text: `This is a friendly reminder that your payment of $${payment.amount} for ${payment.description} is due on ${new Date(payment.dueDate).toLocaleDateString()}. Please ensure timely payment to avoid late fees.`
    });
    
    // Update the payment record to indicate a reminder was sent
    payment.reminderSent = new Date();
    await payment.save();
    
    res.status(200).json({ message: 'Payment reminder sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending payment reminder', error: error.message });
  }
};

// Generate payment receipt
exports.generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('property', 'name address')
      .populate('tenant', 'firstName lastName email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'paid') {
      return res.status(400).json({ message: 'Cannot generate receipt for unpaid payment' });
    }
    
    // Generate receipt PDF
    const receiptPath = await generatePdf({
      title: 'Payment Receipt',
      data: {
        paymentId: payment._id.toString(),
        property: payment.property.name,
        tenant: `${payment.tenant.firstName} ${payment.tenant.lastName}`,
        amount: payment.amount,
        date: payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : new Date().toLocaleDateString(),
        description: payment.description,
        paymentMethod: payment.paymentMethod
      }
    });
    
    // Send the PDF as a response
    res.download(receiptPath, 'receipt.pdf');
  } catch (error) {
    res.status(500).json({ message: 'Error generating receipt', error: error.message });
  }
};