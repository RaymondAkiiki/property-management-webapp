const express = require('express');
const router = express.Router();

const { 
  getAllUsers, 
  getUser, 
  updateUserRole, 
  updateUserPermissions,
  getRolesAndPermissions,
  searchUsers,
  updateUserStatus,
  updateProfile,
  changePassword,
  getCurrentUser
} = require('../controllers/userController');

const { 
  authenticateUser, 
  authorizePermission,
  authorizeRole
} = require('../middleware/authMiddleware');

// Protected routes
router.use(authenticateUser);

// Current user profile
router.get('/me', getCurrentUser);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);

// User search (for conversations, assignments, etc.)
router.get('/search', searchUsers);

// Admin only routes
router.get('/', authorizePermission('manage_users'), getAllUsers);
router.get('/roles-permissions', authorizePermission('manage_users'), getRolesAndPermissions);
router.get('/:id', authorizePermission('manage_users'), getUser);
router.patch('/:id/role', authorizePermission('manage_roles'), updateUserRole);
router.patch('/:id/permissions', authorizePermission('manage_roles'), updateUserPermissions);
router.patch('/:id/status', authorizePermission('manage_users'), updateUserStatus);

module.exports = router;