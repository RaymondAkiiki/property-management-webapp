import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaUserClock, FaUserMinus } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TenantSummaryWidget = ({ tenants }) => {
  const { total, active, pending, former } = tenants;
  
  // Prepare data for pie chart
  const chartData = [
    { name: 'Active', value: active, color: '#16a34a' },
    { name: 'Pending', value: pending, color: '#f59e0b' },
    { name: 'Former', value: former, color: '#6b7280' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaUsers className="mr-2 text-indigo-600" />
          Tenant Summary
        </h2>
        <Link to="/tenants" className="text-blue-600 text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
          <FaUserCheck className="text-green-600 mb-1" />
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-lg font-semibold">{active}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
          <FaUserClock className="text-yellow-600 mb-1" />
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-lg font-semibold">{pending}</p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg flex flex-col items-center">
          <FaUserMinus className="text-gray-600 mb-1" />
          <p className="text-xs text-gray-500">Former</p>
          <p className="text-lg font-semibold">{former}</p>
        </div>
      </div>
      
      <div className="my-4">
        <Link 
          to="/tenants/new" 
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 inline-block"
        >
          Add Tenant
        </Link>
      </div>
    </div>
  );
};

export default TenantSummaryWidget;