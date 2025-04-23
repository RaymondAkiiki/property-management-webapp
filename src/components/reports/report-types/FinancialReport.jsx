// components/reports/report-types/FinancialReport.jsx
import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const FinancialReport = ({ report }) => {
  // Sample data for charts - in a real app, this would come from the report data
  const incomeData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Income',
        data: [12000, 11500, 12500, 12000, 13000, 14000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: [8000, 7900, 8200, 9000, 8500, 8800],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ],
  };

  const expenseBreakdown = {
    labels: ['Maintenance', 'Utilities', 'Insurance', 'Property Tax', 'Management Fee', 'Other'],
    datasets: [
      {
        data: [2500, 1500, 800, 1800, 1200, 900],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      }
    ],
  };

  const revenueTrend = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Net Revenue',
        data: [4000, 3600, 4300, 3000, 4500, 5200],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Sample financial metrics
  const financialMetrics = [
    { name: 'Total Revenue', value: '$72,000.00', change: '+8.5%', positive: true },
    { name: 'Total Expenses', value: '$47,400.00', change: '+4.2%', positive: false },
    { name: 'Net Income', value: '$24,600.00', change: '+14.3%', positive: true },
    { name: 'Cash Flow', value: '$21,350.00', change: '+12.1%', positive: true },
    { name: 'ROI', value: '9.2%', change: '+1.8%', positive: true },
    { name: 'Occupancy Rate', value: '96%', change: '+2%', positive: true },            
  ];

  return (
    <div>
      {/* Report Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Financial Report {report.subtype && `- ${report.subtype.charAt(0).toUpperCase() + report.subtype.slice(1)}`}</h2>
        <p className="text-gray-600">Financial overview for the selected period</p>
      </div>
      
      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {financialMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-gray-500 text-sm font-medium">{metric.name}</h3>
              <div className="flex items-end justify-between mt-1">
                <span className="text-xl font-bold">{metric.value}</span>
                <span className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Income vs Expenses</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <Bar data={incomeData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm h-64">
              <Pie data={expenseBreakdown} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm h-64">
              <Line data={revenueTrend} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        
        {/* Transactions Table */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rent Payment - Unit 202</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parkview Residences</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Income</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">$1,500.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 14, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Plumbing Repair - Unit 105</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parkview Residences</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Maintenance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">$250.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 12, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rent Payment - Unit 301</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parkview Residences</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Income</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">$1,300.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 10, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Utility Bill - Water</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Parkview Residences</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Utilities</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">$850.00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jun 5, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Insurance Premium</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">All Properties</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Insurance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">$1,200.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Notes Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Notes & Observations</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-3">The property is performing well with an 8.5% increase in total revenue compared to the previous period. Key observations:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Occupancy rate has improved to 96%, contributing to higher rental income.</li>
              <li>Maintenance expenses increased slightly due to seasonal repairs but remain within the budget.</li>
              <li>Net income shows a healthy 14.3% growth, indicating good operational efficiency.</li>
              <li>Cash reserves are sufficient to cover approximately 3.5 months of operating expenses.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default FinancialReport;