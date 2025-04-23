// /controllers/documentController.js
const Document = require('../models/Document');
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const fs = require('fs');
const path = require('path');

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, relatedTo, relatedId } = req.body;

    // Validate that the related entity exists
    if (relatedTo && relatedId) {
      let entityExists = false;
      
      if (relatedTo === 'property') {
        entityExists = await Property.exists({ _id: relatedId });
      } else if (relatedTo === 'tenant') {
        entityExists = await Tenant.exists({ _id: relatedId });
      }
      
      if (!entityExists) {
        // Remove the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: `Related ${relatedTo} not found` });
      }
    }

    const newDocument = new Document({
      title: title || req.file.originalname,
      description,
      category,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      relatedTo,
      relatedId
    });

    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    // Clean up the file if there was an error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};

// Get all documents with optional filtering
exports.getDocuments = async (req, res) => {
  try {
    const { category, relatedTo, relatedId, search } = req.query;
    const query = {};

    // Apply filters if provided
    if (category) query.category = category;
    if (relatedTo) query.relatedTo = relatedTo;
    if (relatedId) query.relatedId = relatedId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
};

// Get a single document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Failed to fetch document', error: error.message });
  }
};

// Download a document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = document.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Failed to download document', error: error.message });
  }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Update fields
    if (title) document.title = title;
    if (description !== undefined) document.description = description;
    if (category) document.category = category;
    
    document.updatedAt = Date.now();
    
    await document.save();
    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Failed to update document', error: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Remove the file from the filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove from database
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
};