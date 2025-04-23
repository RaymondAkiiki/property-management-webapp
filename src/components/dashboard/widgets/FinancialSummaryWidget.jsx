import React from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const FinancialSummaryWidget = ({ finances }) => {
  const { pendingRent, collectedThisMonth, overdueAmount, projectedMonthlyIncome } = finances;
  
  // Prepare data for bar chart
  const chartData = [
    { name: 'Collected', amount: collectedThisMonth, color: '#16a34a' },
    { name: 'Pending', amount: pendingRent, color: '#f59e0b' },
    { name: 'Overdue', amount: overdueAmount, color: '#dc2626' },
    { name: 'Projected', amount: projectedMonthlyIncome, color: '#3b82f6' }
  ];
  
  // Collection rate calculation
  const collectionRate = projectedMonthlyIncome > 0 
    ? Math.round((collectedThisMonth / projectedMonthlyIncome) * 100) 
    : 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaMoneyBillWave className="mr-2 text-green-600" />
          Financial Summary
        </h2>
        <Link to="/payments" className="text-blue-600 text-sm hover:underline">
          View All Payments
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Collected This Month</p>
          <p className="text-xl font-semibold text-green-600">{formatCurrency(collectedThisMonth)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-semibold text-yellow-600">{formatCurrency(pendingRent)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-xl font-semibold text-red-600">{formatCurrency(overdueAmount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Collection Rate</p>
          <p className="text-xl font-semibold">{collectionRate}%</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-medium text-gray-700 mb-3">Monthly Financial Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
            <Legend />
            <Bar dataKey="amount" name="Amount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between mt-6">
        <Link 
          to="/payments/new" 
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
        >
          Record Payment
        </Link>
        <Link 
          to="/reports/financial" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Financial Reports
        </Link>
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;