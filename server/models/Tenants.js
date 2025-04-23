// server/models/Tenant.js
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  leaseDetails: {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    unit: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    leaseDocument: { type: String }
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    method: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'late', 'partial'], default: 'pending' },
    notes: { type: String }
  }],
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String },
    uploadDate: { type: Date, default: Date.now }
  }],
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  notes: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'eviction', 'moveout'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', TenantSchema);