// /src/services/paymentService.js
import apiClient from './apiClient';

// ===================
// Core Payment CRUD
// ===================

// Get all payments with optional filters
export const getPayments = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.tenant) queryParams.append('tenant', filters.tenant);
  if (filters.property) queryParams.append('property', filters.property);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.sort) queryParams.append('sort', filters.sort);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.skip) queryParams.append('skip', filters.skip);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await apiClient.get(`/api/payments${query}`);
};

// Get a specific payment by ID
export const getPaymentById = async (paymentId) => {
  return await apiClient.get(`/api/payments/${paymentId}`);
};

// Create a new payment
export const createPayment = async (paymentData) => {
  return await apiClient.post('/api/payments', paymentData);
};

// Update a payment
export const updatePayment = async (paymentId, paymentData) => {
  return await apiClient.put(`/api/payments/${paymentId}`, paymentData);
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  return await apiClient.delete(`/api/payments/${paymentId}`);
};

// Record a payment for an existing schedule
export const recordPayment = async (paymentId, paymentData) => {
  return await apiClient.post(`/api/payments/${paymentId}/record`, paymentData);
};

// Mark a payment as paid
export const markPaymentAsPaid = async (paymentId, paymentData) => {
  return await apiClient.patch(`/api/payments/${paymentId}/mark-paid`, paymentData);
};

// Apply a late fee to a payment
export const applyLateFee = async (paymentId, lateFeeData) => {
  return await apiClient.post(`/api/payments/${paymentId}/apply-late-fee`, lateFeeData);
};

// ===================
// Reports & Stats
// ===================

// Get payment statistics
export const getPaymentStats = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.timeframe) queryParams.append('timeframe', params.timeframe);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await apiClient.get(`/api/payments/stats${query}`);
};

// Get overdue payments
export const getOverduePayments = async () => {
  return await apiClient.get('/api/payments/overdue');
};

// Generate a payment report
export const generatePaymentReport = async (reportParams) => {
  return await apiClient.post('/api/payments/reports', reportParams);
};

// Send payment reminders in bulk
export const sendPaymentReminders = async (reminderParams) => {
  return await apiClient.post('/api/payments/reminders', reminderParams);
};

// Send a payment reminder for one
export const sendPaymentReminder = async (paymentId, reminderData) => {
  return await apiClient.post(`/api/payments/${paymentId}/send-reminder`, reminderData);
};

// ===================
// Invoice & Attachments
// ===================

// Generate an invoice PDF
export const generateInvoice = async (paymentId) => {
  return await apiClient.get(`/api/payments/${paymentId}/invoice`, {
    responseType: 'blob',
  });
};

// Add an attachment to a payment
export const addAttachment = async (paymentId, documentId) => {
  return await apiClient.post('/api/payments/attachment', { paymentId, documentId });
};

// ===================
// History & Upcoming
// ===================

// Get tenant’s payment history
export const getTenantPaymentHistory = async (tenantId) => {
  return await apiClient.get(`/api/tenants/${tenantId}/payments`);
};

// Get property’s payment history
export const getPropertyPaymentHistory = async (propertyId) => {
  return await apiClient.get(`/api/properties/${propertyId}/payments`);
};

// Get upcoming payments within X days
export const getUpcomingPayments = async (days = 30) => {
  return await apiClient.get(`/api/payments/upcoming?days=${days}`);
};

// ===================
// Default Export (optional)
// ===================
export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  recordPayment,
  markPaymentAsPaid,
  applyLateFee,
  getPaymentStats,
  getOverduePayments,
  generatePaymentReport,
  sendPaymentReminders,
  sendPaymentReminder,
  generateInvoice,
  addAttachment,
  getTenantPaymentHistory,
  getPropertyPaymentHistory,
  getUpcomingPayments,
};
