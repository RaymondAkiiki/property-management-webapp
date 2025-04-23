/**
 * server/index.js (Update section)
 * Add the new dashboard routes to the Express app
 */

// Existing imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// ... other imports

// Import routes
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const documentRoutes = require('./routes/documentRoutes');
// Add the new dashboard routes
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express app
const app = express();
// ... middleware setup

// Routes
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/documents', documentRoutes);
// Add the new dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// ... error handling and server start





// Update in your /server/index.js or main app file
const documentRoutes = require('./routes/documentRoutes');

// Add this with your other route registrations
app.use('/api/documents', documentRoutes);

// Also add this to ensure the uploads directory is accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Update in your /server/index.js or main app file
const paymentRoutes = require('./routes/paymentRoutes');

// Add this with your other route registrations
app.use('/api/payments', paymentRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);