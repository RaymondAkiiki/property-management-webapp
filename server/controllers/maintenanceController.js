// server/controllers/maintenanceController.js
const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { uploadImages } = require('../utils/fileUpload');

// Helper function to check if user has access to a property
const hasPropertyAccess = async (userId, propertyId, userRole) => {
  // Admin and manager have access to all properties
  if (userRole === 'admin' || userRole === 'manager') {
    return true;
  }
  
  // For tenants, check if they're assigned to the property
  if (userRole === 'tenant') {
    const property = await Property.findById(propertyId);
    if (!property) return false;
    
    return property.tenants.some(tenant => 
      tenant.user.toString() === userId.toString()
    );
  }
  
  return false;
};

// Get all maintenance tickets (filtered by role)
exports.getAllTickets = async (req, res) => {
  try {
    const { user } = req;
    let filter = {};
    
    // Apply filters based on query parameters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.property) filter.property = req.query.property;
    
    // Role-based filtering
    if (user.role === 'tenant') {
      // Tenants can only see their own tickets
      filter.createdBy = user._id;
    } else if (user.role === 'manager') {
      // Managers can see tickets for properties they manage
      const managedProperties = await Property.find({ manager: user._id }).select('_id');
      const propertyIds = managedProperties.map(p => p._id);
      filter.property = { $in: propertyIds };
    }
    
    const tickets = await Maintenance.find(filter)
      .populate('property', 'name address')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching maintenance tickets:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance tickets', error: error.message });
  }
};

// Get tickets for a specific property
exports.getPropertyTickets = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { user } = req;
    
    // Check if user has access to this property
    const hasAccess = await hasPropertyAccess(user._id, propertyId, user.role);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this property' });
    }
    
    // Apply additional filters
    let filter = { property: propertyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    
    const tickets = await Maintenance.find(filter)
      .populate('property', 'name address')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching property maintenance tickets:', error);
    res.status(500).json({ message: 'Failed to fetch property maintenance tickets', error: error.message });
  }
};

// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { user } = req;
    
    const ticket = await Maintenance.findById(ticketId)
      .populate('property', 'name address')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    
    // Check if user has access to this ticket
    const hasAccess = 
      user.role === 'admin' || 
      user.role === 'manager' ||
      ticket.createdBy._id.toString() === user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this ticket' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error fetching maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance ticket', error: error.message });
  }
};

// Create a new maintenance ticket
exports.createTicket = async (req, res) => {
  try {
    const { user } = req;
    const { title, description, priority, category, property, unit } = req.body;
    
    // Check if user has access to the property
    const hasAccess = await hasPropertyAccess(user._id, property, user.role);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this property' });
    }
    
    // Upload images if provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImages(req.files, 'maintenance');
    }
    
    // Create the ticket
    const newTicket = new Maintenance({
      title,
      description,
      priority,
      category,
      property,
      unit,
      createdBy: user._id,
      images: imageUrls
    });
    
    // If user is admin or manager, they can assign the ticket
    if ((user.role === 'admin' || user.role === 'manager') && req.body.assignedTo) {
      newTicket.assignedTo = req.body.assignedTo;
    }
    
    await newTicket.save();
    
    // Populate references for the response
    await newTicket.populate('property', 'name address');
    await newTicket.populate('createdBy', 'name email');
    if (newTicket.assignedTo) {
      await newTicket.populate('assignedTo', 'name email');
    }
    
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to create maintenance ticket', error: error.message });
  }
};

// Update a maintenance ticket
exports.updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { user } = req;
    const updateData = req.body;
    
    // Find the ticket
    const ticket = await Maintenance.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    
    // Check if user has permission to update
    const canUpdate = 
      user.role === 'admin' || 
      user.role === 'manager' ||
      (ticket.createdBy.toString() === user._id.toString() && ticket.status === 'new');
    
    if (!canUpdate) {
      return res.status(403).json({ message: 'You do not have permission to update this ticket' });
    }
    
    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = await uploadImages(req.files, 'maintenance');
      updateData.images = [...(ticket.images || []), ...newImageUrls];
    }
    
    // Update the ticket
    const updatedTicket = await Maintenance.findByIdAndUpdate(
      ticketId,
      { $set: updateData },
      { new: true }
    )
      .populate('property', 'name address')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      });
    
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to update maintenance ticket', error: error.message });
  }
};

// Update ticket status
exports.updateStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const { user } = req;
    
    // Only admin and manager can update status
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: 'You do not have permission to update ticket status' });
    }
    
    const updateData = { status };
    
    // If marking as completed, set completedAt
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else {
      // If changing from completed to another status, remove completedAt
      updateData.completedAt = null;
    }
    
    const updatedTicket = await Maintenance.findByIdAndUpdate(
      ticketId,
      { $set: updateData },
      { new: true }
    )
      .populate('property', 'name address')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments.user',
        select: 'name email'
      });
    
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
};

// Delete a maintenance ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { user } = req;
    
    // Only admin and manager can delete tickets
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: 'You do not have permission to delete tickets' });
    }
    
    const ticket = await Maintenance.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    
    // Delete associated images if any
    if (ticket.images && ticket.images.length > 0) {
      // Implementation depends on your file storage solution
      // This is a simple example for local file storage
      ticket.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', 'uploads', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }
    
    await Maintenance.findByIdAndDelete(ticketId);
    
    res.status(200).json({ message: 'Maintenance ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance ticket:', error);
    res.status(500).json({ message: 'Failed to delete maintenance ticket', error: error.message });
  }
};

// Add a comment to a ticket
exports.addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;
    const { user } = req;
    
    const ticket = await Maintenance.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Maintenance ticket not found' });
    }
    
    // Check if user has access to this ticket
    const hasAccess = await hasPropertyAccess(user._id, ticket.property, user.role) ||
                      ticket.createdBy.toString() === user._id.toString();
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this ticket' });
    }
    
    const comment = {
      content,
      user: user._id,
      createdAt: new Date()
    };
    
    ticket.comments.push(comment);
    await ticket.save();
    
    // Get the newly added comment with populated user
    const newComment = ticket.comments[ticket.comments.length - 1];
    await newComment.populate('user', 'name email');
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// Get tenant's tickets
exports.getTenantTickets = async (req, res) => {
  try {
    const { user } = req;
    
    // Ensure user is a tenant
    if (user.role !== 'tenant') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Apply filters
    let filter = { createdBy: user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    
    const tickets = await Maintenance.find(filter)
      .populate('property', 'name address')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tenant tickets:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance tickets', error: error.message });
  }
};