import api from './api';

const userService = {
  // Get current user with permissions
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Get all users with pagination and filtering
  getUsers: async (page = 1, limit = 10, role = '', search = '', sort = 'name') => {
    try {
      const response = await api.get('/api/users', {
        params: { page, limit, role, search, sort }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a specific user
  getUser: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/api/users/${userId}/role`, { role });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Update user permissions
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await api.patch(`/api/users/${userId}/permissions`, { permissions });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  },

  // Update user status (active/inactive)
  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/api/users/${userId}/status`, { isActive });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get available roles and permissions
  getRolesAndPermissions: async () => {
    try {
      const response = await api.get('/api/users/roles-permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/api/users/profile', profileData);
      return response.data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.patch('/api/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

export default userService;