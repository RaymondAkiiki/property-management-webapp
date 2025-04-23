/**
 * src/components/dashboard/OccupancyChartWidget.js
 * Occupancy statistics widget for the dashboard
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList 
} from 'recharts';
import { useDashboard } from '../../context/DashboardContext';

const OccupancyChartWidget = () => {
  const { occupancyStats, loading } = useDashboard();

  if (loading || !occupancyStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 h-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentOccupancy = occupancyStats.currentOccupancy;
  
  // Prepare current occupancy data for the chart
  const currentOccupancyData = [
    {
      name: 'Current Occupancy',
      occupied: currentOccupancy.occupied,
      vacant: currentOccupancy.vacant,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Occupancy Statistics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-blue-600 text-sm font-medium">Occupancy Rate</p>
          <p className="text-3xl font-bold">{currentOccupancy.rate}%</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-green-600 text-sm font-medium">Occupied Units</p>
          <p className="text-3xl font-bold">{currentOccupancy.occupied}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <p className="text-red-600 text-sm font-medium">Vacant Units</p>
          <p className="text-3xl font-bold">{currentOccupancy.vacant}</p>
        </div>
      </div>
      
      {/* Current Occupancy Chart */}
      <div className="mb-6">
        <h4 className="text-base font-medium text-gray-600 mb-2">Current Occupancy</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={currentOccupancyData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" tick={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="occupied" name="Occupied" fill="#10B981" stackId="a">
              <LabelList dataKey="occupied" position="inside" fill="#fff" />
            </Bar>
            <Bar dataKey="vacant" name="Vacant" fill="#EF4444" stackId="a">
              <LabelList dataKey="vacant" position="inside" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Historical Occupancy Chart */}
      <div>
        <h4 className="text-base font-medium text-gray-600 mb-2">Historical Occupancy Rate</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={occupancyStats.occupancyHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
            <Bar dataKey="rate" name="Occupancy Rate" fill="#3B82F6">
              <LabelList dataKey="rate" position="top" formatter={(value) => `${value}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Turnover Rates */}
      <div className="mt-6">
        <h4 className="text-base font-medium text-gray-600 mb-2">Tenant Turnover Rate</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm font-medium">Monthly</p>
            <p className="text-xl font-bold">{occupancyStats.turnoverRate.monthly}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm font-medium">Quarterly</p>
            <p className="text-xl font-bold">{occupancyStats.turnoverRate.quarterly}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-gray-600 text-sm font-medium">Yearly</p>
            <p className="text-xl font-bold">{occupancyStats.turnoverRate.yearly}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyChartWidget;