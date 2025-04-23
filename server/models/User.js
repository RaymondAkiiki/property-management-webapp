const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Role constants
const ROLES = {
  ADMIN: 'admin',
  PROPERTY_MANAGER: 'property_manager',
  MAINTENANCE: 'maintenance',
  TENANT: 'tenant',
  VIEWER: 'viewer'
};

// Permission map per role
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_roles',
    'manage_properties',
    'manage_tenants',
    'manage_payments',
    'manage_maintenance',
    'manage_documents',
    'view_financial_reports',
    'edit_settings'
  ],
  [ROLES.PROPERTY_MANAGER]: [
    'manage_properties',
    'manage_tenants',
    'manage_payments',
    'approve_maintenance',
    'manage_documents',
    'view_financial_reports'
  ],
  [ROLES.MAINTENANCE]: [
    'view_properties',
    'view_tenants',
    'manage_maintenance',
    'view_documents'
  ],
  [ROLES.TENANT]: [
    'view_own_property',
    'create_maintenance_requests',
    'view_own_payments',
    'view_own_documents',
    'make_payments'
  ],
  [ROLES.VIEWER]: [
    'view_properties',
    'view_tenants',
    'view_payments',
    'view_maintenance',
    'view_documents'
  ]
};

// User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: 50,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.VIEWER
  },
  customPermissions: {
    type: [String],
    default: []
  },
  tenantInfo: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    unitNumber: String,
    moveInDate: Date,
    leaseEndDate: Date
  },
  phone: String,
  profileImage: String,
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT
UserSchema.methods.createJWT = function() {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

// Get effective permissions (role + custom)
UserSchema.methods.getPermissions = function() {
  const rolePermissions = PERMISSIONS[this.role] || [];
  return [...new Set([...rolePermissions, ...this.customPermissions])];
};

// Check if user has specific permission
UserSchema.methods.hasPermission = function(permission) {
  return this.role === ROLES.ADMIN || this.getPermissions().includes(permission);
};

module.exports = {
  User: mongoose.model('User', UserSchema),
  ROLES,
  PERMISSIONS
};
