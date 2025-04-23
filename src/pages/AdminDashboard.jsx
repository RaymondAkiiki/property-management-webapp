import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import UserList from '../components/users/UserList';
import UserFilter from '../components/users/UserFilter';
import UserDetailModal from '../components/users/UserDetailModal';
import userService from '../services/userService';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const UserManagementPage = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    sort: 'name',
    limit: 10
  });
  const [rolesAndPermissions, setRolesAndPermissions] = useState({
    roles: [],
    permissions: {}
  });

  // Load roles and permissions
  useEffect(() => {
    const loadRolesAndPermissions = async () => {
      try {
        const data = await userService.getRolesAndPermissions();
        setRolesAndPermissions(data);
      } catch (error) {
        toast.error('Failed to load roles and permissions');
      }
    };

    loadRolesAndPermissions();
  }, []);

  // Load users with current filters and pagination
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const { role, search, sort, limit } = filters;
        const data = await userService.getUsers(
          pagination.currentPage,
          limit,
          role,
          search,
          sort
        );
        
        setUsers(data.users);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalUsers: data.totalUsers
        });
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [filters, pagination.currentPage]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // Show user detail modal
  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Update user role
  const handleRoleChange = async (userId, role) => {
    try {
      await userService.updateUserRole(userId, role);
      
      // Update user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role } : user
        )
      );
      
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  // Update user permissions
  const handlePermissionsChange = async (userId, permissions) => {
    try {
      const updatedUser = await userService.updateUserPermissions(userId, permissions);
      
      // Update user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, customPermissions: updatedUser.customPermissions } : user
        )
      );
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(updatedUser);
      }
      
      toast.success('User permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update user permissions');
    }
  };

  // Update user status (active/inactive)
  const handleStatusChange = async (userId, isActive) => {
    try {
      await userService.updateUserStatus(userId, isActive);
      
      // Update user in the list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isActive } : user
        )
      );
      
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${isActive ? 'activate' : 'deactivate'} user`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          {/* Add new user button would go here if needed */}
        </div>

        <UserFilter 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          roles={rolesAndPermissions.roles}
        />

        <div className="mt-6">
          <UserList 
            users={users} 
            loading={loading} 
            onUserClick={handleUserClick}
            onStatusChange={handleStatusChange}
            canManageRoles={hasPermission('manage_roles')}
          />
        </div>

        <div className="mt-6">
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {showDetailModal && selectedUser && (
          <UserDetailModal 
            user={selectedUser}
            roles={rolesAndPermissions.roles}
            permissions={rolesAndPermissions.permissions}
            onClose={() => setShowDetailModal(false)}
            onRoleChange={handleRoleChange}
            onPermissionsChange={handlePermissionsChange}
            onStatusChange={handleStatusChange}
            canManageRoles={hasPermission('manage_roles')}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;