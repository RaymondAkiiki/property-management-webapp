// src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

// Components
import PropertiesOverview from '../components/dashboard/PropertiesOverview';
import TenantSummary from '../components/dashboard/TenantSummary';
import RentSummary from '../components/dashboard/RentSummary';
import MaintenanceRequests from '../components/dashboard/MaintenanceRequests';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    tenants: [],
    maintenanceRequests: [],
    rentSummary: {
      collected: 0,
      pending: 0,
      overdue: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch properties
        const propertiesRes = await axios.get('/properties');
        
        // Fetch tenants
        const tenantsRes = await axios.get('/tenants');
        
        // Fetch maintenance requests
        const maintenanceRes = await axios.get('/maintenance');
        
        // Calculate rent summary
        const rentSummary = calculateRentSummary(tenantsRes.data);
        
        setDashboardData({
          properties: propertiesRes.data,
          tenants: tenantsRes.data,
          maintenanceRequests: maintenanceRes.data,
          rentSummary
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Calculate rent summary from tenant payment history
  const calculateRentSummary = (tenants) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let collected = 0;
    let pending = 0;
    let overdue = 0;
    
    tenants.forEach(tenant => {
      // Skip inactive tenants
      if (tenant.status !== 'active') return;
      
      const monthlyRent = tenant.leaseDetails.rentAmount;
      
      // Check if tenant has made a payment this month
      const currentMonthPayment = tenant.paymentHistory.find(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });
      
      if (currentMonthPayment) {
        if (currentMonthPayment.status === 'paid') {
          collected += currentMonthPayment.amount;
        } else if (currentMonthPayment.status === 'partial') {
          collected += currentMonthPayment.amount;
          pending += (monthlyRent - currentMonthPayment.amount);
        } else if (currentMonthPayment.status === 'late') {
          overdue += monthlyRent;
        }
      } else {
        // No payment this month
        const today = new Date().getDate();
        // If past the 5th of the month, consider it overdue
        if (today > 5) {
          overdue += monthlyRent;
        } else {
          pending += monthlyRent;
        }
      }
    });
    
    return { collected, pending, overdue };
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <span className="mr-2">Welcome, {user?.name}</span>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Properties</h3>
          <p className="text-3xl font-bold">{dashboardData.properties.length}</p>
          <Link to="/properties" className="text-blue-600 hover:underline text-sm">View all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Tenants</h3>
          <p className="text-3xl font-bold">{dashboardData.tenants.length}</p>
          <Link to="/tenants" className="text-blue-600 hover:underline text-sm">View all</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Vacancies</h3>
          <p className="text-3xl font-bold">
            {dashboardData.properties.reduce((acc, property) => {
              return acc + property.units.filter(unit => !unit.isOccupied).length;
            }, 0)}
          </p>
          <Link to="/properties?filter=vacant" className="text-blue-600 hover:underline text-sm">View vacant units</Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Maintenance</h3>
          <p className="text-3xl font-bold">{dashboardData.maintenanceRequests.filter(req => req.status === 'open').length}</p>
          <Link to="/maintenance" className="text-blue-600 hover:underline text-sm">View requests</Link>
        </div>
      </div>
      
      {/* Rent Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Rent Summary</h2>
        <RentSummary rentSummary={dashboardData.rentSummary} />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Properties Overview</h2>
          <PropertiesOverview properties={dashboardData.properties.slice(0, 5)} />
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Maintenance</h2>
          <MaintenanceRequests requests={dashboardData.maintenanceRequests.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;