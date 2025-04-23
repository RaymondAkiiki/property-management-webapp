/**
 * server/controllers/dashboardController.js
 * Controller to handle dashboard data aggregation
 */

const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const Document = require('../models/Document');

// Get summary data for the main dashboard
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get property stats
    const propertiesCount = await Property.countDocuments();
    const vacantProperties = await Property.countDocuments({ 'status': 'vacant' });
    const occupiedProperties = await Property.countDocuments({ 'status': 'occupied' });
    
    // Get tenant stats
    const tenantsCount = await Tenant.countDocuments();
    const activeLeases = await Tenant.countDocuments({ 'leaseStatus': 'active' });
    const expiringLeases = await Tenant.countDocuments({
      'leaseEndDate': { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    });
    
    // Get maintenance stats
    const pendingMaintenance = await Maintenance.countDocuments({ 'status': 'pending' });
    const inProgressMaintenance = await Maintenance.countDocuments({ 'status': 'in-progress' });
    const completedMaintenance = await Maintenance.countDocuments({ 'status': 'completed' });
    
    // Get payment stats
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthlyPayments = await Payment.find({
      'paymentDate': { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const totalRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    const overduePayments = await Payment.countDocuments({
      'dueDate': { $lt: new Date() },
      'status': { $ne: 'paid' }
    });

    // Get document stats
    const documentsCount = await Document.countDocuments();
    
    res.status(200).json({
      properties: {
        total: propertiesCount,
        vacant: vacantProperties,
        occupied: occupiedProperties,
        occupancyRate: propertiesCount ? ((occupiedProperties / propertiesCount) * 100).toFixed(1) : 0
      },
      tenants: {
        total: tenantsCount,
        activeLeases: activeLeases,
        expiringLeases: expiringLeases
      },
      maintenance: {
        pending: pendingMaintenance,
        inProgress: inProgressMaintenance,
        completed: completedMaintenance,
        total: pendingMaintenance + inProgressMaintenance + completedMaintenance
      },
      financials: {
        monthlyRevenue: totalRevenue,
        overduePayments: overduePayments
      },
      documents: {
        total: documentsCount
      }
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

// Get revenue statistics
exports.getRevenueStats = async (req, res) => {
  try {
    const { period } = req.query;
    const currentDate = new Date();
    let startDate, endDate;
    let groupBy;
    
    // Set date ranges based on period
    if (period === 'yearly') {
      startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      groupBy = { $month: '$paymentDate' }; // Group by month for yearly view
    } else if (period === 'quarterly') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      groupBy = { 
        $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } 
      }; // Group by day for quarterly view
    } else {
      // Default to monthly
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      groupBy = { 
        $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } 
      }; // Group by day for monthly view
    }
    
    const revenueStats = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startDate, $lte: endDate },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format the data for frontend charting
    const formattedStats = revenueStats.map(stat => ({
      date: stat._id,
      amount: stat.totalAmount,
      count: stat.count
    }));
    
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error in getRevenueStats:', error);
    res.status(500).json({ message: 'Server error fetching revenue statistics' });
  }
};

// Get maintenance statistics
exports.getMaintenanceStats = async (req, res) => {
  try {
    const statusCounts = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const priorityCounts = await Maintenance.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeCounts = await Maintenance.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the data for frontend
    const formattedStatusCounts = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    const formattedPriorityCounts = priorityCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    const formattedTypeCounts = typeCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    res.status(200).json({
      statusCounts: formattedStatusCounts,
      priorityCounts: formattedPriorityCounts,
      typeCounts: formattedTypeCounts
    });
  } catch (error) {
    console.error('Error in getMaintenanceStats:', error);
    res.status(500).json({ message: 'Server error fetching maintenance statistics' });
  }
};

// Get occupancy statistics
exports.getOccupancyStats = async (req, res) => {
  try {
    // Get current occupancy rate
    const totalProperties = await Property.countDocuments();
    const occupiedProperties = await Property.countDocuments({ 'status': 'occupied' });
    const occupancyRate = totalProperties ? (occupiedProperties / totalProperties) * 100 : 0;
    
    // Get occupancy history (last 6 months)
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
    
    // Here we would typically query a historical data collection
    // For this example, we'll generate sample data
    const occupancyHistory = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const rate = Math.floor(85 + Math.random() * 10); // Sample rate between 85-95%
      occupancyHistory.push({
        month: month.toLocaleString('default', { month: 'short', year: 'numeric' }),
        rate
      });
    }
    
    // Get tenant turnover rate (sample data)
    const turnoverRate = {
      monthly: Math.floor(Math.random() * 5),
      quarterly: Math.floor(5 + Math.random() * 7),
      yearly: Math.floor(15 + Math.random() * 10)
    };
    
    res.status(200).json({
      currentOccupancy: {
        total: totalProperties,
        occupied: occupiedProperties,
        vacant: totalProperties - occupiedProperties,
        rate: occupancyRate.toFixed(1)
      },
      occupancyHistory,
      turnoverRate
    });
  } catch (error) {
    console.error('Error in getOccupancyStats:', error);
    res.status(500).json({ message: 'Server error fetching occupancy statistics' });
  }
};

// Get upcoming events (rent due, lease expirations, scheduled maintenance)
exports.getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    
    // Get upcoming lease expirations
    const expiringLeases = await Tenant.find(
      { 
        leaseEndDate: { $gte: today, $lte: thirtyDaysLater },
        leaseStatus: 'active' 
      },
      'firstName lastName leaseEndDate propertyId'
    ).populate('propertyId', 'name address.street');
    
    // Get upcoming rent payments
    const upcomingPayments = await Payment.find(
      { 
        dueDate: { $gte: today, $lte: thirtyDaysLater },
        status: { $ne: 'paid' }
      },
      'tenantId propertyId amount dueDate'
    )
    .populate('tenantId', 'firstName lastName')
    .populate('propertyId', 'name address.street');
    
    // Get scheduled maintenance
    const scheduledMaintenance = await Maintenance.find(
      {
        scheduledDate: { $gte: today, $lte: thirtyDaysLater },
        status: { $in: ['pending', 'in-progress'] }
      },
      'title description priority status scheduledDate propertyId'
    ).populate('propertyId', 'name address.street');
    
    // Format the data for the frontend
    const events = [
      ...expiringLeases.map(lease => ({
        type: 'leaseExpiration',
        date: lease.leaseEndDate,
        title: `Lease expiration: ${lease.firstName} ${lease.lastName}`,
        description: `Property: ${lease.propertyId?.name || 'Unknown'}`,
        relatedId: lease._id
      })),
      ...upcomingPayments.map(payment => ({
        type: 'payment',
        date: payment.dueDate,
        title: `Rent due: ${payment.tenantId?.firstName || 'Unknown'} ${payment.tenantId?.lastName || 'Tenant'}`,
        description: `Amount: $${payment.amount.toFixed(2)} - Property: ${payment.propertyId?.name || 'Unknown'}`,
        relatedId: payment._id
      })),
      ...scheduledMaintenance.map(maintenance => ({
        type: 'maintenance',
        date: maintenance.scheduledDate,
        title: `Maintenance: ${maintenance.title}`,
        description: `Priority: ${maintenance.priority} - Property: ${maintenance.propertyId?.name || 'Unknown'}`,
        relatedId: maintenance._id
      }))
    ];
    
    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error in getUpcomingEvents:', error);
    res.status(500).json({ message: 'Server error fetching upcoming events' });
  }
};