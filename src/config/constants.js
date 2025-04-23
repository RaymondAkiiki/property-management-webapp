/**
 * src/config/constants.js
 * Configuration constants for the application
 */

// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  PROPERTY_MANAGER: 'property_manager',
  TENANT: 'tenant'
};

// Property statuses
export const PROPERTY_STATUSES = [
  'vacant',
  'occupied',
  'maintenance',
  'listed'
];

// Tenant statuses
export const TENANT_STATUSES = [
  'active',
  'past',
  'applicant',
  'approved'
];

// Lease statuses
export const LEASE_STATUSES = [
  'active',
  'expired',
  'terminated',
  'pending'
];

// Maintenance priorities
export const MAINTENANCE_PRIORITIES = [
  'low',
  'medium',
  'high',
  'emergency'
];

// Maintenance statuses
export const MAINTENANCE_STATUSES = [
  'pending',
  'in-progress',
  'completed',
  'cancelled'
];

// Maintenance types
export const MAINTENANCE_TYPES = [
  'plumbing',
  'electrical',
  'appliance',
  'structural',
  'pest control',
  'heating/cooling',
  'other'
];

// Payment statuses
export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'overdue',
  'partial',
  'cancelled'
];

// Payment methods
export const PAYMENT_METHODS = [
  'cash',
  'check',
  'credit card',
  'bank transfer',
  'money order',
  'other'
];

// Document types
export const DOCUMENT_TYPES = [
  'lease',
  'invoice',
  'receipt',
  'maintenance report',
  'property inspection',
  'tenant application',
  'identity document',
  'insurance',
  'tax document',
  'other'
];