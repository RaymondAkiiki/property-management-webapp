/**
 * src/context/DashboardContext.js
 * Context provider for dashboard data
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { useToast } from '../hooks/useToast';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const { showToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueStats, setRevenueStats] = useState([]);
  const [revenueStatsLoading, setRevenueStatsLoading] = useState(false);
  const [maintenanceStats, setMaintenanceStats] = useState(null);
  const [occupancyStats, setOccupancyStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenuePeriod, setRevenuePeriod] = useState('monthly');

  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.fetchDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue statistics
  const fetchRevenueStats = async (period = revenuePeriod) => {
    setRevenueStatsLoading(true);
    try {
      const data = await dashboardService.fetchRevenueStats(period);
      setRevenueStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
      setError('Failed to load revenue statistics');
      showToast('error', 'Failed to load revenue statistics');
    } finally {
      setRevenueStatsLoading(false);
    }
  };

  // Fetch maintenance statistics
  const fetchMaintenanceStats = async () => {
    try {
      const data = await dashboardService.fetchMaintenanceStats();
      setMaintenanceStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching maintenance stats:', err);
      setError('Failed to load maintenance statistics');
      showToast('error', 'Failed to load maintenance statistics');
    }
  };

  // Fetch occupancy statistics
  const fetchOccupancyStats = async () => {
    try {
      const data = await dashboardService.fetchOccupancyStats();
      setOccupancyStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching occupancy stats:', err);
      setError('Failed to load occupancy statistics');
      showToast('error', 'Failed to load occupancy statistics');
    }
  };

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      const data = await dashboardService.fetchUpcomingEvents();
      setUpcomingEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      setError('Failed to load upcoming events');
      showToast('error', 'Failed to load upcoming events');
    }
  };

  // Update revenue period and fetch new data
  const updateRevenuePeriod = (period) => {
    setRevenuePeriod(period);
    fetchRevenueStats(period);
  };

  // Initial data fetch
  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchDashboardData();
      await fetchRevenueStats();
      await fetchMaintenanceStats();
      await fetchOccupancyStats();
      await fetchUpcomingEvents();
    };

    loadDashboardData();
  }, []);

  // Value object to be provided to consumers
  const value = {
    dashboardData,
    revenueStats,
    revenueStatsLoading,
    maintenanceStats,
    occupancyStats,
    upcomingEvents,
    loading,
    error,
    revenuePeriod,
    updateRevenuePeriod,
    refreshDashboard: fetchDashboardData,
    refreshRevenueStats: fetchRevenueStats,
    refreshMaintenanceStats: fetchMaintenanceStats,
    refreshOccupancyStats: fetchOccupancyStats,
    refreshUpcomingEvents: fetchUpcomingEvents
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};