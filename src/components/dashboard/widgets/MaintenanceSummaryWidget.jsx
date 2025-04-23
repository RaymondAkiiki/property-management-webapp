import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MaintenanceSummaryWidget = ({ maintenance }) => {
  const { open, inProgress, resolved, urgent } = maintenance;
  
  // Calculate total tickets
  const total = open + inProgress + resolved;
  
  // Prepare data for pie chart
  const chartData = [
    { name: 'Open', value: open, color: '#f59e0b' },
    { name: 'In Progress', value: inProgress, color: '#3b82f6' },
    { name: 'Resolved', value: resolved, color: '#16a34a' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaTools className="mr-2 text-gray-700" />
          Maintenance Summary
        </h2>
        <Link to="/maintenance" className="text-blue-600 text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaExclamationTriangle className="text-yellow-600" />
            </div>
            <span className="text-sm font-medium">Open Tickets</span>
          </div>
          <span className="text-lg font-semibold">{open}</span>
        </div>
        
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FaSpinner className="text-blue-600" />
            </div>
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <span className="text-lg font-semibold">{inProgress}</span>
        </div>
        
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-3">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <FaCheck className="text-green-600" />
            </div>
            <span className="text-sm font-medium">Resolved</span>
          </div>
          <span className="text-lg font-semibold">{resolved}</span>
        </div>
        
        {urgent > 0 && (
          <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg mb-3">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <span className="text-sm font-medium">Urgent Tickets</span>
            </div>
            <span className="text-lg font-semibold">{urgent}</span>
          </div>
        )}
      </div>
      
      <div className="my-4">
        <Link 
          to="/maintenance/new" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 inline-block"
        >
          Create Ticket
        </Link>
      </div>
    </div>
  );
};

export default MaintenanceSummaryWidget;