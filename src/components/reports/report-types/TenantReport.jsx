// components/reports/report-types/TenantReport.jsx
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

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

const TenantReport = ({ report }) => {
  // Sample data for charts
  const occupancyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Occupancy Rate (%)',
        data: [92, 91, 93, 95, 96, 96],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const tenantStatusData = {
    labels: ['Current', 'Late Payment', 'In Notice Period', 'Vacant'],
    datasets: [
      {
        data: [85, 8, 4, 3],
        backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#F44336'],
      }
    ],
  };

  const leaseExpiryData = {
    labels: ['< 30 Days', '1-3 Months', '3-6 Months', '6-12 Months', '> 12 Months'],
    datasets: [
      {
        label: 'Number of Leases',
        data: [5, 8, 12, 18, 7],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ],
  };

  // Tenant metrics
  const tenantMetrics = [
    { name: 'Total Units', value: '50', change: '', positive: true },
    { name: 'Occupied Units', value: '48', change: '+1', positive: true },
    { name: 'Vacancy Rate', value: '4%', change: '-1%', positive: true },
    { name: 'Avg. Tenant Duration', value: '2.3 yrs', change: '+0.2', positive: true },
    { name: 'Turnover Rate', value: '15%', change: '-2%', positive: true },
    { name: 'Eviction Rate', value: '0.5%', change: '0%', positive: true },            
  ];

  return (
    <div>
      {/* Report Header */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Tenant Report {report.subtype && `- ${report.subtype.charAt(0).toUpperCase() + report.subtype.slice(1)}`}</h2>
        <p className="text-gray-600">Tenant and occupancy analysis for the selected period</p>
      </div>
      
      {/* Tenant Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {tenantMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-gray-500 text-sm font-medium">{metric.name}</h3>
            <div className="flex items-end justify-between mt-1">
              <span className="text-xl font-bold">{metric.value}</span>
              {metric.change && (
                <span className={`text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Occupancy Trend</h3>
        <div className="bg-white p-4 rounded-lg shadow-sm h-64">
          <Line data={occupancyData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Tenant Status</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <Doughnut data={tenantStatusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Lease Expiry Timeline</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm h-64">
            <Bar data={leaseExpiryData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
      {/* Tenant List */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Tenant Overview</h3>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Move-in Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unit 101</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Smith</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dec 15, 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dec 14, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Current
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">$1,500/mo</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unit 102</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Doe</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mar 1, 2024</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 28, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Late Payment
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">$1,250/mo</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unit 103</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Michael Johnson</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jul 10, 2022</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jul 9, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Current
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">$1,350/mo</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unit 104</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sarah Williams</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Apr 15, 2023</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">May 14, 2025</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Notice Period
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">$1,400/mo</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Unit 105</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Vacant
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">$1,300/mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notes & Recommendations</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 mb-3">Overall tenant metrics show positive trends with reduced vacancy and turnover rates:</p>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Consider reaching out to tenants with expiring leases in the next 30 days to discuss renewal options.</li>
            <li>Unit 102 has a history of late payments. Recommend implementing automatic payment reminders.</li>
            <li>Unit 105 has been vacant for 3 weeks. Consider adjusting the listing price or offering move-in incentives.</li>
            <li>Tenant satisfaction survey indicates maintenance response time as an area for improvement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TenantReport;