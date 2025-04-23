const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../models/User');

// Middleware to authenticate token
const authenticateUser = async (req, res, next) => {
  // Check header for token
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Authentication invalid' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database to get latest permissions
    const user = await User.findById(payload.userId);
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ msg: 'User account is inactive' });
    }
    
    // Attach user to request object
    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      getPermissions: user.getPermissions.bind(user),
      hasPermission: user.hasPermission.bind(user)
    };
    
    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();
    
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Authentication invalid' });
  }
};

// Middleware to check for specific permissions
const authorizePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }
    
    // Admin bypass - admins have all permissions
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }
    
    // Check if user has required permission
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

// Middleware to check for role
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient role.' });
    }
    
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
  authorizeRole
};