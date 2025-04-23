import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaymentStats, getOverduePayments } from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Spinner from '../common/Spinner';

const PaymentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [overduePayments, setOverduePayments] = useState([]);
  const [timeframe, setTimeframe] = useState('month'); // 'month', 'quarter', 'year'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get payment statistics for the selected timeframe
        const statsResponse = await getPaymentStats({ timeframe });
        setStats(statsResponse.data);
        
        // Get overdue payments
        const overdueResponse = await getOverduePayments();
        setOverduePayments(overdueResponse.data);
      } catch (err) {
        setError('Failed to load payment statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Collected" 
          value={formatCurrency(stats?.collected || 0)} 
          icon="cash" 
          color="green"
        />
        <StatCard 
          title="Pending" 
          value={formatCurrency(stats?.pending || 0)} 
          icon="clock" 
          color="yellow"
        />
        <StatCard 
          title="Overdue" 
          value={formatCurrency(stats?.overdue || 0)} 
          icon="alert-triangle" 
          color="red"
        />
        <StatCard 
          title="Collection Rate" 
          value={`${stats?.collectionRate || 0}%`} 
          icon="percent" 
          color="blue"
        />
      </div>
      
      {/* Timeframe Selector */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              timeframe === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleTimeframeChange('month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              timeframe === 'quarter' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleTimeframeChange('quarter')}
          >
            This Quarter
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              timeframe === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleTimeframeChange('year')}
          >
            This Year
          </button>
        </div>
      </div>
      
      {/* Recent Payments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          <Link to="/payments" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        
        {stats?.recentPayments && stats.recentPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.tenant?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.property?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link 
                        to={`/payments/${payment._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent payments found.</p>
        )}
      </div>
      
      {/* Overdue Payments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">Overdue Payments</h3>
          <Link to="/payments?filter=overdue" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        
        {overduePayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Late</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overduePayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.tenant?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.property?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {payment.daysLate} days
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link 
                        to={`/payments/send-reminder/${payment._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Send Reminder
                      </Link>
                      <Link 
                        to={`/payments/record/${payment._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Record Payment
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No overdue payments.</p>
        )}
      </div>
    </div>
  );
};

// StatCard component for displaying statistics
const StatCard = ({ title, value, icon, color }) => {
  const getIconComponent = (iconName, colorClass) => {
    const iconClasses = `w-8 h-8 ${colorClass}`;
    
    switch (iconName) {
      case 'cash':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'clock':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'alert-triangle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'percent':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          icon: 'text-green-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          icon: 'text-yellow-500'
        };
      case 'red':
        return {
          bg: 'bg-red-100',
          text: 'text-red-600',
          icon: 'text-red-500'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          icon: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          icon: 'text-gray-500'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses.bg} mr-4`}>
          {getIconComponent(icon, colorClasses.icon)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${colorClasses.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;