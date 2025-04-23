import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaDoorOpen, FaDoorClosed, FaLongArrowAltUp, FaLongArrowAltDown } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PropertySummaryWidget = ({ properties }) => {
  const { total, vacant, occupied } = properties;
  
  // Calculate occupancy rate
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
  
  // Prepare data for pie chart
  const chartData = [
    { name: 'Occupied', value: occupied, color: '#16a34a' },
    { name: 'Vacant', value: vacant, color: '#dc2626' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaHome className="mr-2 text-blue-600" />
          Property Summary
        </h2>
        <Link to="/properties" className="text-blue-600 text-sm hover:underline">
          View All
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Properties</p>
              <p className="text-2xl font-semibold">{total}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Occupancy Rate</p>
              <p className="text-2xl font-semibold">{occupancyRate}%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 flex items-center">
                <FaDoorOpen className="mr-1 text-green-600" /> Occupied
              </p>
              <p className="text-2xl font-semibold">{occupied}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 flex items-center">
                <FaDoorClosed className="mr-1 text-red-600" /> Vacant
              </p>
              <p className="text-2xl font-semibold">{vacant}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Link 
              to="/properties/new" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 inline-block"
            >
              Add Property
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Properties']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <p>No property data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertySummaryWidget;