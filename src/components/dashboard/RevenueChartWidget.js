/**
 * src/components/dashboard/RevenueChartWidget.js
 * Revenue chart for the dashboard
 */

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

const RevenueChartWidget = () => {
  const { 
    revenueStats, 
    revenueStatsLoading, 
    revenuePeriod, 
    updateRevenuePeriod 
  } = useDashboard();

  const formatDate = (dateStr) => {
    if (revenuePeriod === 'yearly') {
      // Convert month number to month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(dateStr) - 1];
    }
    // For monthly or quarterly, format the date
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Revenue Overview</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => updateRevenuePeriod('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${
              revenuePeriod === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => updateRevenuePeriod('quarterly')}
            className={`px-3 py-1 text-sm rounded-md ${
              revenuePeriod === 'quarterly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => updateRevenuePeriod('yearly')}
            className={`px-3 py-1 text-sm rounded-md ${
              revenuePeriod === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {revenueStatsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : revenueStats && revenueStats.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={revenueStats}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              name="Revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No revenue data available for the selected period.
        </div>
      )}
    </div>
  );
};

export default RevenueChartWidget;