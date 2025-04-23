const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  tenant: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'late', 'overdue', 'partially_paid', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'paypal', 'venmo', 'zelle', 'online', 'other'],
    default: 'other'
  },
  transactionId: {
    type: String
  },
  lateFee: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Document'
  }],
  reminders: [{
    sentDate: Date,
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'postal']
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to calculate days overdue
PaymentSchema.virtual('daysLate').get(function() {
  if (this.status === 'paid') return 0;

  const today = new Date();
  const dueDate = new Date(this.dueDate);

  if (today <= dueDate) return 0;

  const diffTime = Math.abs(today - dueDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
});

// Pre-save middleware to update status if past due date
PaymentSchema.pre('save', function(next) {
  const today = new Date();
  const dueDate = new Date(this.dueDate);

  if (this.status === 'pending' && today > dueDate) {
    this.status = 'overdue';
  }

  next();
});

// Indexes for faster queries
PaymentSchema.index({ tenant: 1, dueDate: -1 });
PaymentSchema.index({ property: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ dueDate: 1 });
PaymentSchema.index({ property: 1, tenant: 1, dueDate: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
