// server/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['rent-due', 'lease-expiration', 'maintenance', 'appointment', 'reminder', 'other'],
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: String,
  // References to related entities
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
  },
  maintenanceTicketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceTicket',
  },
  // Notification settings
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'in-app', 'sms'],
      required: true
    },
    time: {
      type: Number, // Minutes before event to send notification
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  // User who created the event
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Users who are invited/assigned to the event
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number, // Every X days/weeks/months/years
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ propertyId: 1 });
eventSchema.index({ tenantId: 1 });
eventSchema.index({ 'attendees.userId': 1 });
eventSchema.index({ eventType: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;