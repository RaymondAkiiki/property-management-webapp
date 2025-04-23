import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaMoneyBillWave, 
  FaTools, 
  FaExclamationCircle,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import propertyService from '../services/propertyService';
import tenantService from '../services/tenantService';
import paymentService from '../services/paymentService';
import maintenanceService from '../services/maintenanceService';
import Spinner from '../components/common/Spinner';
import { formatCurrency, formatDate } from '../utils/formatters';

// Import Dashboard widgets
import PropertySummaryWidget from '../components/dashboard/PropertySummaryWidget';
import FinancialSummaryWidget from '../components/dashboard/FinancialSummaryWidget';
import MaintenanceSummaryWidget from '../components/dashboard/MaintenanceSummaryWidget';
import TenantSummaryWidget from '../components/dashboard/TenantSummaryWidget';
import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget';
import RecentActivityWidget from '../components/dashboard/RecentActivityWidget';
import OccupancyRateWidget from '../components/dashboard/OccupancyRateWidget';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    properties: { total: 0, vacant: 0, occupied: 0 },
    tenants: { total: 0, active: 0, pending: 0, former: 0 },
    finances: { 
      pendingRent: 0, 
      collectedThisMonth: 0, 
      overdueAmount: 0,
      projectedMonthlyIncome: 0 
    },
    maintenance: { 
      open: 0, 
      inProgress: 0, 
      resolved: 0, 
      urgent: 0 
    },
    recentActivity: [],
    upcomingEvents: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch property data
        const properties = await propertyService.getAllProperties();
        const propertyStats = {
          total: properties.length,
          vacant: properties.filter(p => !p.isOccupied).length,
          occupied: properties.filter(p => p.isOccupied).length
        };
        
        // Fetch tenant data
        const tenants = await tenantService.getAllTenants();
        const tenantStats = {
          total: tenants.length,
          active: tenants.filter(t => t.status === 'active').length,
          pending: tenants.filter(t => t.status === 'pending').length,
          former: tenants.filter(t => t.status === 'former').length
        };
        
        // Fetch payment data
        const paymentStats = await paymentService.getPaymentStats();
        
        // Fetch maintenance data
        const maintenanceTickets = await maintenanceService.getAllTickets();
        const maintenanceStats = {
          open: maintenanceTickets.filter(t => t.status === 'open').length,
          inProgress: maintenanceTickets.filter(t => t.status === 'in-progress').length,
          resolved: maintenanceTickets.filter(t => t.status === 'resolved').length,
          urgent: maintenanceTickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length
        };
        
        // Generate upcoming events
        const upcomingEvents = generateUpcomingEvents(properties, tenants, maintenanceTickets);
        
        // Generate recent activity
        const recentActivity = generateRecentActivity(properties, tenants, maintenanceTickets);
        
        setDashboardData({
          properties: propertyStats,
          tenants: tenantStats,
          finances: {
            pendingRent: paymentStats.pending || 0,
            collectedThisMonth: paymentStats.thisMonth?.received || 0,
            overdueAmount: paymentStats.overdue || 0,
            projectedMonthlyIncome: paymentStats.thisMonth?.expected || 0
          },
          maintenance: maintenanceStats,
          recentActivity,
          upcomingEvents
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Helper function to generate upcoming events based on all data
  const generateUpcomingEvents = (properties, tenants, tickets) => {
    const events = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    // Add lease expiration events
    tenants.forEach(tenant => {
      if (tenant.leaseEnd && new Date(tenant.leaseEnd) <= thirtyDaysFromNow && new Date(tenant.leaseEnd) >= now) {
        events.push({
          id: `lease-${tenant._id}`,
          title: `Lease expiring: ${tenant.firstName} ${tenant.lastName}`,
          date: new Date(tenant.leaseEnd),
          type: 'lease',
          relatedId: tenant._id
        });
      }
    });
    
    // Add maintenance appointment events
    tickets.forEach(ticket => {
      if (ticket.appointmentDate && new Date(ticket.appointmentDate) >= now) {
        events.push({
          id: `maintenance-${ticket._id}`,
          title: `Maintenance: ${ticket.title}`,
          date: new Date(ticket.appointmentDate),
          type: 'maintenance',
          relatedId: ticket._id
        });
      }
    });
    
    // Sort events by date
    return events.sort((a, b) => a.date - b.date).slice(0, 5);
  };
  
  // Helper function to generate recent activity based on all data
  const generateRecentActivity = (properties, tenants, tickets) => {
    const activities = [];
    
    // Add recent property activities
    properties.forEach(property => {
      if (new Date(property.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
          id: `property-${property._id}`,
          title: `Property added: ${property.name}`,
          date: new Date(property.createdAt),
          type: 'property',
          relatedId: property._id
        });
      }
      
      if (property.updatedAt && new Date(property.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
          id: `property-update-${property._id}`,
          title: `Property updated: ${property.name}`,
          date: new Date(property.updatedAt),
          type: 'property',
          relatedId: property._id
        });
      }
    });
    
    // Add recent tenant activities
    tenants.forEach(tenant => {
      if (new Date(tenant.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
          id: `tenant-${tenant._id}`,
          title: `Tenant added: ${tenant.firstName} ${tenant.lastName}`,
          date: new Date(tenant.createdAt),
          type: 'tenant',
          relatedId: tenant._id
        });
      }
    });
    
    // Add recent maintenance activities
    tickets.forEach(ticket => {
      if (new Date(ticket.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
          id: `ticket-${ticket._id}`,
          title: `Maintenance ticket: ${ticket.title}`,
          date: new Date(ticket.createdAt),
          type: 'maintenance',
          relatedId: ticket._id
        });
      }
      
      if (ticket.status === 'resolved' && ticket.resolvedAt && 
          new Date(ticket.resolvedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        activities.push({
          id: `ticket-resolved-${ticket._id}`,
          title: `Ticket resolved: ${ticket.title}`,
          date: new Date(ticket.resolvedAt),
          type: 'maintenance',
          relatedId: ticket._id
        });
      }
    });
    
    // Sort activities by date (newest first)
    return activities.sort((a, b) => b.date - a.date).slice(0, 10);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'User'}! Here's your property management overview.</p>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FaHome className="text-blue-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Properties</p>
            <p className="text-2xl font-semibold">{dashboardData.properties.total}</p>
            <p className="text-xs text-gray-500">
              {dashboardData.properties.occupied} occupied, {dashboardData.properties.vacant} vacant
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <FaUsers className="text-green-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tenants</p>
            <p className="text-2xl font-semibold">{dashboardData.tenants.total}</p>
            <p className="text-xs text-gray-500">
              {dashboardData.tenants.active} active, {dashboardData.tenants.pending} pending
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <FaMoneyBillWave className="text-yellow-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Rent</p>
            <p className="text-2xl font-semibold">{formatCurrency(dashboardData.finances.pendingRent)}</p>
            <p className="text-xs text-gray-500">
              {formatCurrency(dashboardData.finances.collectedThisMonth)} collected this month
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-red-100 p-3 mr-4">
            <FaTools className="text-red-600 text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Maintenance</p>
            <p className="text-2xl font-semibold">{dashboardData.maintenance.open}</p>
            <p className="text-xs text-gray-500">
              {dashboardData.maintenance.urgent} urgent, {dashboardData.maintenance.inProgress} in progress
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* First column */}
        <div className="lg:col-span-2 space-y-6">
          <PropertySummaryWidget properties={dashboardData.properties} />
          <FinancialSummaryWidget finances={dashboardData.finances} />
        </div>
        
        {/* Second column */}
        <div className="space-y-6">
          <MaintenanceSummaryWidget maintenance={dashboardData.maintenance} />
          <TenantSummaryWidget tenants={dashboardData.tenants} />
          <OccupancyRateWidget occupancyRate={(dashboardData.properties.occupied / dashboardData.properties.total) * 100 || 0} />
        </div>
      </div>
      
      {/* Bottom row - split in two */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEventsWidget events={dashboardData.upcomingEvents} />
        <RecentActivityWidget activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
};

export default Dashboard;




// /**
//  * src/pages/Dashboard.js
//  * Enhanced dashboard page that integrates all dashboard components
//  */

// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { DashboardProvider } from '../context/DashboardContext';
// import { useAuth } from '../context/AuthContext';

// // Import widgets
// import PropertySummaryWidget from '../components/dashboard/PropertySummaryWidget';
// import FinancialSummaryWidget from '../components/dashboard/FinancialSummaryWidget';
// import MaintenanceSummaryWidget from '../components/dashboard/MaintenanceSummaryWidget';
// import TenantSummaryWidget from '../components/dashboard/TenantSummaryWidget';
// import RevenueChartWidget from '../components/dashboard/RevenueChartWidget';
// import MaintenanceStatsWidget from '../components/dashboard/MaintenanceStatsWidget';
// import OccupancyChartWidget from '../components/dashboard/OccupancyChartWidget';
// import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget';

// const Dashboard = () => {
//   const { isAuthenticated, user, loading } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!loading && !isAuthenticated) {
//       navigate('/login');
//     }
//   }, [isAuthenticated, loading, navigate]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <DashboardProvider>
//       <div className="py-6 px-4 md:px-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
//           <p className="text-gray-600">
//             Welcome back, {user?.firstName || 'User'}! Here's an overview of your property management system.
//           </p>
//         </div>

//         {/* Summary Widgets - Top Row */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <PropertySummaryWidget />
//           <TenantSummaryWidget />
//           <MaintenanceSummaryWidget />
//           <FinancialSummaryWidget />
//         </div>

//         {/* Charts - Middle Rows */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//           <RevenueChartWidget />
//           <MaintenanceStatsWidget />
//         </div>

//         {/* Detailed Stats - Bottom Rows */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <OccupancyChartWidget />
//           </div>
//           <div>
//             <UpcomingEventsWidget />
//           </div>
//         </div>
//       </div>
//     </DashboardProvider>
//   );
// };

// export default Dashboard;