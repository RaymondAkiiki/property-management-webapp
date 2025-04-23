// server/controllers/eventController.js
const Event = require('../models/Event');
const mongoose = require('mongoose');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is available from auth middleware
    
    const eventData = {
      ...req.body,
      createdBy: userId
    };
    
    // Handle recurring event creation if needed
    if (eventData.isRecurring && eventData.recurringPattern) {
      // Validation for recurring events
      if (!eventData.recurringPattern.frequency || !eventData.recurringPattern.interval) {
        return res.status(400).json({ message: 'Recurring events require frequency and interval' });
      }
    }
    
    const event = new Event(eventData);
    await event.save();
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

// Get all events with optional filtering
exports.getEvents = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      propertyId,
      tenantId,
      eventType,
      userId
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Date range filter
    if (startDate && endDate) {
      filter.$or = [
        // Events that start within the range
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Events that end within the range
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        },
        // Events that span across the entire range
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) }
        }
      ];
    }
    
    // Other filters
    if (propertyId) filter.propertyId = mongoose.Types.ObjectId(propertyId);
    if (tenantId) filter.tenantId = mongoose.Types.ObjectId(tenantId);
    if (eventType) filter.eventType = eventType;
    
    // User-specific events (either created by or attending)
    if (userId) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { createdBy: mongoose.Types.ObjectId(userId) },
        { 'attendees.userId': mongoose.Types.ObjectId(userId) }
      );
    }
    
    const events = await Event.find(filter)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('attendees.userId', 'firstName lastName email')
      .sort({ startDate: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('attendees.userId', 'firstName lastName email')
      .populate('maintenanceTicketId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find and update the event
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

// Update attendee status
exports.updateAttendeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, status } = req.body;
    
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const event = await Event.findOneAndUpdate(
      { _id: id, 'attendees.userId': userId },
      { $set: { 'attendees.$.status': status } },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event or attendee not found' });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating attendee status:', error);
    res.status(500).json({ message: 'Failed to update attendee status', error: error.message });
  }
};