// server/routes/tenants.js
const express = require('express');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tenants
router.get('/', auth, async (req, res) => {
  try {
    const tenants = await Tenant.find({ createdBy: req.user.id })
      .populate('leaseDetails.property', 'name address');
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single tenant
router.get('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('leaseDetails.property', 'name address');
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create tenant
router.post('/', auth, async (req, res) => {
  try {
    const { leaseDetails } = req.body;
    
    // Verify property exists
    const property = await Property.findById(leaseDetails.property);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Find the unit
    const unit = property.units.find(u => u.unitNumber === leaseDetails.unit);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    // Check if unit is already occupied
    if (unit.isOccupied) {
      return res.status(400).json({ message: 'Unit is already occupied' });
    }
    
    const tenant = new Tenant({
      ...req.body,
      createdBy: req.user.id
    });
    
    const savedTenant = await tenant.save();
    
    // Update property unit status
    unit.isOccupied = true;
    unit.currentTenant = savedTenant._id;
    await property.save();
    
    res.status(201).json(savedTenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update tenant
router.put('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // Check if user created this tenant
    if (tenant.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    res.json(updatedTenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add payment to tenant
router.post('/:id/payments', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    tenant.paymentHistory.push(req.body);
    await tenant.save();
    
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete tenant
router.delete('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    
    // Check if user created this tenant
    if (tenant.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update property unit status
    const property = await Property.findById(tenant.leaseDetails.property);
    if (property) {
      const unit = property.units.find(u => u.unitNumber === tenant.leaseDetails.unit);
      if (unit) {
        unit.isOccupied = false;
        unit.currentTenant = null;
        await property.save();
      }
    }
    
    await Tenant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tenant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;