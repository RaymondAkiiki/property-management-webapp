/**
 * src/components/dashboard/MaintenanceStatsWidget.js (continued)
 * Maintenance statistics widget for the dashboard
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

const MaintenanceStatsWidget = () => {
  const { maintenanceStats, loading } = useDashboard();

  // Colors for status chart
  const STATUS_COLORS = {
    pending: '#EF4444', // red
    'in-progress': '#F59E0B', // amber
    completed: '#10B981', // green
    cancelled: '#6B7280' // gray
  };

  // Colors for priority chart
  const PRIORITY_COLORS = {
    low: '#60A5FA', // blue
    medium: '#F59E0B', // amber
    high: '#EF4444', // red
    emergency: '#7C3AED' // purple
  };

  // Prepare data for the status chart
  const getStatusChartData = () => {
    if (!maintenanceStats || !maintenanceStats.statusCounts) return [];
    
    return Object.entries(maintenanceStats.statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  // Prepare data for the priority chart
  const getPriorityChartData = () => {
    if (!maintenanceStats || !maintenanceStats.priorityCounts) return [];
    
    return Object.entries(maintenanceStats.priorityCounts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count
    }));
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Maintenance Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Chart */}
        <div>
          <h4 className="text-base font-medium text-gray-600 mb-2 text-center">Status Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getStatusChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getStatusChartData().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.name.toLowerCase()] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Priority Chart */}
        <div>
          <h4 className="text-base font-medium text-gray-600 mb-2 text-center">Priority Distribution</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getPriorityChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getPriorityChartData().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PRIORITY_COLORS[entry.name.toLowerCase()] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-red-600 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold">{maintenanceStats?.statusCounts?.pending || 0}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-amber-600 text-sm font-medium">In Progress</p>
          <p className="text-2xl font-bold">{maintenanceStats?.statusCounts?.['in-progress'] || 0}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-green-600 text-sm font-medium">Completed</p>
          <p className="text-2xl font-bold">{maintenanceStats?.statusCounts?.completed || 0}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-blue-600 text-sm font-medium">Total</p>
          <p className="text-2xl font-bold">
            {Object.values(maintenanceStats?.statusCounts || {}).reduce((sum, count) => sum + count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceStatsWidget;