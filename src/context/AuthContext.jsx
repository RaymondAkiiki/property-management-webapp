import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import userService from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      setToken(token);
      setCurrentUser(user);
      setUserPermissions(user.permissions || []);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.msg || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      setToken(token);
      setCurrentUser(user);
      setUserPermissions(user.permissions || []);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (error) {
      const message = error.response?.data?.msg || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setUserPermissions([]);
    navigate('/login');
    toast.info('You have been logged out');
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.isAdmin) return true;
    return userPermissions.includes(permission);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Update current user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await userService.updateProfile(profileData);
      setCurrentUser({ ...currentUser, ...updatedUser });
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to update profile';
      toast.error(message);
      return false;
    }
  };

  // Load user data from token
  const loadUser = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);

    try {
      const user = await userService.getCurrentUser();
      setCurrentUser(user);
      setUserPermissions(user.permissions || []);
    } catch (error) {
      console.error('Error loading user:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        hasPermission,
        hasRole,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
