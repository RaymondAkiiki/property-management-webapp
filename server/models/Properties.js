// server/models/Property.js
const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' }
  },
  type: { 
    type: String, 
    enum: ['apartment', 'house', 'condo', 'commercial'], 
    required: true 
  },
  units: [{
    unitNumber: { type: String, required: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    squareFeet: { type: Number },
    rent: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }
  }],
  owner: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  amenities: [String],
  images: [String],
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String },
    uploadDate: { type: Date, default: Date.now }
  }],
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);