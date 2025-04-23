import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/common/PageHeader';

/**
 * PropertiesOverview component serving as a dashboard for property metrics
 */
const PropertiesOverview = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedProperties: 0,
    vacantProperties: 0,
    totalRevenue: 0,
    pendingMaintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyStats = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get('/api/properties/stats');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load property statistics');
        setLoading(false);
        console.error('Error fetching property stats:', err);
      }
    };

    fetchPropertyStats();
  }, []);

  const StatsCard = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 ${color ? `border-l-4 border-${color}-500` : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-50 p-4 rounded-md text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Properties Overview"
        subtitle="Key metrics and insights about your property portfolio"
        actions={
          <Link to="/properties/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Property
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Properties" 
          value={stats.totalProperties} 
          color="blue"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatsCard 
          title="Occupied Properties" 
          value={stats.occupiedProperties} 
          color="green"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatsCard 
          title="Vacant Properties" 
          value={stats.vacantProperties} 
          color="yellow"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-64 flex items-center justify-center">
            {/* You can add a chart component here */}
            <p className="text-gray-500">Revenue chart will be displayed here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Property Occupancy</h2>
          <div className="h-64 flex items-center justify-center">
            {/* You can add a chart component here */}
            <p className="text-gray-500">Occupancy chart will be displayed here</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
        </div>
        <div className="p-6">
          <ul className="divide-y divide-gray-200">
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New tenant moved in</p>
                  <p className="text-sm text-gray-500">Property: Sunset Apartments #301</p>
                </div>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </li>
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Maintenance request completed</p>
                  <p className="text-sm text-gray-500">Property: Oak Tree Residences #205</p>
                </div>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </li>
            <li className="py-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Rent payment received</p>
                  <p className="text-sm text-gray-500">Property: Maple Grove Homes #112</p>
                </div>
                <p className="text-sm text-gray-500">4 days ago</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropertiesOverview;