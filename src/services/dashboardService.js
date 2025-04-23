/**
 * src/services/dashboardService.js
 * Service to fetch and aggregate data from all modules for the dashboard
 */

import axios from 'axios';
import { API_URL } from '../config/constants';

const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/summary`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const fetchRevenueStats = async (period = 'monthly') => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/revenue?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    throw error;
  }
};

const fetchMaintenanceStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/maintenance-stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    throw error;
  }
};

const fetchOccupancyStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/occupancy`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching occupancy statistics:', error);
    throw error;
  }
};

const fetchUpcomingEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/dashboard/events`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

export const dashboardService = {
  fetchDashboardData,
  fetchRevenueStats,
  fetchMaintenanceStats,
  fetchOccupancyStats,
  fetchUpcomingEvents,
};