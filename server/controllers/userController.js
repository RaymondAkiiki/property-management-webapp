const { User, ROLES, PERMISSIONS } = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// Get all users (with pagination and filtering)
const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 10, sort = 'name' } = req.query;
  const queryObject = {};
  
  // Filter by role if provided
  if (role) {
    queryObject.role = role;
  }
  
  // Search by name or email
  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Sorting
  const sortOption = {};
  if (sort.startsWith('-')) {
    sortOption[sort.substring(1)] = -1;
  } else {
    sortOption[sort] = 1;
  }
  
  // Execute query
  const users = await User.find(queryObject)
    .select('-password')
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));
  
  // Get total count for pagination
  const totalUsers = await User.countDocuments(queryObject);
  
  res.status(StatusCodes.OK).json({
    users,
    totalUsers,
    currentPage: Number(page),
    totalPages: Math.ceil(totalUsers / Number(limit))
  });
};

// Get a single user
const getUser = async (req, res) => {
  const { id: userId } = req.params;
  
  const user = await User.findOne({ _id: userId }).select('-password');
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No user with id: ${userId}` });
  }
  
  res.status(StatusCodes.OK).json({ user });
};

// Update user role
const updateUserRole = async (req, res) => {
  const { id: userId } = req.params;
  const { role } = req.body;
  
  // Validate role
  if (!Object.values(ROLES).includes(role)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: `Invalid role. Available roles: ${Object.values(ROLES).join(', ')}` });
  }
  
  // Find user
  const user = await User.findOne({ _id: userId });
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No user with id: ${userId}` });
  }
  
  // Update role
  user.role = role;
  await user.save();
  
  res.status(StatusCodes.OK).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
};

// Update user custom permissions
const updateUserPermissions = async (req, res) => {
  const { id: userId } = req.params;
  const { permissions } = req.body;
  
  // Validate permissions
  if (!Array.isArray(permissions)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Permissions must be an array' });
  }
  
  // Get all available permissions
  const allPermissions = Object.values(PERMISSIONS).flat();
  
  // Check if all provided permissions are valid
  const invalidPermissions = permissions.filter(p => !allPermissions.includes(p));
  if (invalidPermissions.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ 
      msg: `Invalid permissions: ${invalidPermissions.join(', ')}` 
    });
  }
  
  // Find user
  const user = await User.findOne({ _id: userId });
  
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: `No user with id: ${userId}` });
  }
  
  // Update custom permissions
  user.customPermissions = permissions;
  await user.save();
  
  res.status(StatusCodes.OK).json({ 
    user: { 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      customPermissions: user.customPermissions,
      allPermissions: user.getPermissions()
    } 
  });
};

// Get available roles and permissions
const getRolesAndPermissions = async (req, res) => {
  res.status(StatusCodes.OK).json({
    roles: Object.values(ROLES),
    permissions: PERMISSIONS
  });
};

// Search users (for conversations, assignments, etc.)
const searchUsers = async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Search query is required' });
  }
  
  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ],
    isActive: true
  })
  .select('name email role')
  .limit(10);
  
  res.status(StatusCodes.OK).json(users);
};

// Update user status (active/inactive)
const updateUserStatus = async (req, res) => {
  const { id: userId } = req.params;
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'isActive must be a boolean' });
  }
  
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return res.status({ _id: userId },
        { isActive },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No user with id: ${userId}` });
      }
      
      res.status(StatusCodes.OK).json({ user });
    };
    
    // Update user profile
    const updateProfile = async (req, res) => {
      const { userId } = req.user;
      const { name, email, phone, profileImage } = req.body;
      
      // Find user
      const user = await User.findOne({ _id: userId });
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
      }
      
      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (profileImage) user.profileImage = profileImage;
      
      await user.save();
      
      res.status(StatusCodes.OK).json({ 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage
        } 
      });
    };
    
    // Change password
    const changePassword = async (req, res) => {
      const { userId } = req.user;
      const { currentPassword, newPassword } = req.body;
      
      // Validate inputs
      if (!currentPassword || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please provide both current and new password' });
      }
      
      if (newPassword.length < 6) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'New password must be at least 6 characters long' });
      }
      
      // Find user
      const user = await User.findOne({ _id: userId });
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
      }
      
      // Check if current password is correct
      const isPasswordCorrect = await user.comparePassword(currentPassword);
      if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.status(StatusCodes.OK).json({ msg: 'Password updated successfully' });
    };
    
    // Get current user profile with permissions
    const getCurrentUser = async (req, res) => {
      const { userId } = req.user;
      
      const user = await User.findOne({ _id: userId }).select('-password');
      
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' });
      }
      
      res.status(StatusCodes.OK).json({ 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          permissions: user.getPermissions(),
          isTenant: user.role === ROLES.TENANT,
          isAdmin: user.role === ROLES.ADMIN,
          tenantInfo: user.tenantInfo
        }
      });
    };
    
    module.exports = {
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
    };