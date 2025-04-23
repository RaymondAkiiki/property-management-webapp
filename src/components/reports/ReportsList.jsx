// components/reports/ReportsList.jsx
import React from 'react';
import { format } from 'date-fns';
import { FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';

const ReportsList = ({ reports, loading, onViewReport, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">No reports found</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>
    );
  }

  const getReportTypeLabel = (type) => {
    const types = {
      financial: 'Financial Report',
      tenant: 'Tenant Report',
      property: 'Property Performance',
      maintenance: 'Maintenance Report',
      income: 'Income Statement',
      cashflow: 'Cash Flow',
      occupancy: 'Occupancy Rate',
      turnover: 'Tenant Turnover'
    };
    return types[type] || 'Report';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Report Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Range
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Generated On
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report) => (
            <tr key={report._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{report.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {getReportTypeLabel(report.type)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(report.startDate), 'MMM d, yyyy')} - {format(new Date(report.endDate), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {format(new Date(report.createdAt), 'MMM d, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewReport(report._id)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  <FiEye className="inline mr-1" /> View
                </button>
                <button className="text-green-600 hover:text-green-900 mr-3">
                  <FiDownload className="inline mr-1" /> Download
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <FiTrash2 className="inline mr-1" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsList;

// components/reports/ReportFilters.jsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useProperties } from '../../hooks/useProperties';

const ReportFilters = ({ filters, onFilterChange }) => {
  const { properties, loading: propertiesLoading } = useProperties();

  const handleReportTypeChange = (e) => {
    onFilterChange({ reportType: e.target.value });
  };

  const handleStartDateChange = (date) => {
    onFilterChange({ startDate: date });
  };

  const handleEndDateChange = (date) => {
    onFilterChange({ endDate: date });
  };

  const handlePropertyChange = (e) => {
    onFilterChange({ propertyId: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <h2 className="text-lg font-medium mb-4">Filter Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            value={filters.reportType}
            onChange={handleReportTypeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="financial">Financial Reports</option>
            <option value="tenant">Tenant Reports</option>
            <option value="property">Property Performance</option>
            <option value="maintenance">Maintenance Reports</option>
            <option value="income">Income Statement</option>
            <option value="cashflow">Cash Flow</option>
            <option value="occupancy">Occupancy Rate</option>
            <option value="turnover">Tenant Turnover</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={filters.startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={filters.startDate}
            endDate={filters.endDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            selected={filters.endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={filters.startDate}
            endDate={filters.endDate}
            minDate={filters.startDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property
          </label>
          <select
            value={filters.propertyId}
            onChange={handlePropertyChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Properties</option>
            {!propertiesLoading &&
              properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;

// components/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useProperties } from '../../hooks/useProperties';

const ReportGenerator = ({ onGenerate, loading }) => {
  const { properties } = useProperties();
  const [reportData, setReportData] = useState({
    name: '',
    type: 'financial',
    subtype: 'income',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    propertyId: '',
    includeCharts: true,
    format: 'pdf'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportData({
      ...reportData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDateChange = (field, date) => {
    setReportData({
      ...reportData,
      [field]: date
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(reportData);
  };

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'tenant', label: 'Tenant Report' },
    { value: 'property', label: 'Property Performance' },
    { value: 'maintenance', label: 'Maintenance Report' }
  ];

  const getSubtypeOptions = () => {
    const subtypes = {
      financial: [
        { value: 'income', label: 'Income Statement' },
        { value: 'cashflow', label: 'Cash Flow' },
        { value: 'expenses', label: 'Expense Breakdown' },
        { value: 'revenue', label: 'Revenue Analysis' },
      ],
      tenant: [
        { value: 'occupancy', label: 'Occupancy Rate' },
        { value: 'turnover', label: 'Tenant Turnover' },
        { value: 'leases', label: 'Lease Expirations' },
        { value: 'payments', label: 'Payment History' },
      ],
      property: [
        { value: 'performance', label: 'Performance Metrics' },
        { value: 'valuation', label: 'Valuation Report' },
        { value: 'roi', label: 'ROI Analysis' },
        { value: 'maintenance', label: 'Maintenance Cost Analysis' },
      ],
      maintenance: [
        { value: 'tickets', label: 'Maintenance Tickets' },
        { value: 'costs', label: 'Maintenance Costs' },
        { value: 'vendors', label: 'Vendor Performance' },
        { value: 'recurring', label: 'Recurring Issues' },
      ]
    };
    return subtypes[reportData.type] || [];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Generate New Report</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <input
              type="text"
              name="name"
              value={reportData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Monthly Financial Report"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              name="type"
              value={reportData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Subtype
            </label>
            <select
              name="subtype"
              value={reportData.subtype}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {getSubtypeOptions().map((subtype) => (
                <option key={subtype.value} value={subtype.value}>
                  {subtype.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property
            </label>
            <select
              name="propertyId"
              value={reportData.propertyId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Properties</option>
              {properties && properties.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <DatePicker
              selected={reportData.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              selectsStart
              startDate={reportData.startDate}
              endDate={reportData.endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <DatePicker
              selected={reportData.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              selectsEnd
              startDate={reportData.startDate}
              endDate={reportData.endDate}
              minDate={reportData.startDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              name="format"
              value={reportData.format}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              name="includeCharts"
              checked={reportData.includeCharts}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Include charts and visualizations
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportGenerator;

// components/reports/ReportDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiDownload, FiPrinter, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { getReportById } from '../../services/reportService';
import { toast } from 'react-toastify';
import FinancialReport from './report-types/FinancialReport';
import TenantReport from './report-types/TenantReport';
import PropertyReport from './report-types/PropertyReport';
import MaintenanceReport from './report-types/MaintenanceReport';

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getReportById(reportId);
        setReport(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load report');
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleGoBack = () => {
    navigate('/reports');
  };

  const renderReportContent = () => {
    if (!report) return null;
    
    switch (report.type) {
      case 'financial':
        return <FinancialReport report={report} />;
      case 'tenant':
        return <TenantReport report={report} />;
      case 'property':
        return <PropertyReport report={report} />;
      case 'maintenance':
        return <MaintenanceReport report={report} />;
      default:
        return (
          <div className="p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Report preview not available</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 mb-4">Report not found</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Reports
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{report.name}</h1>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">
                <FiPrinter className="mr-1" /> Print
              </button>
              <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                <FiDownload className="mr-1" /> Download
              </button>
              <button className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                <FiShare2 className="mr-1" /> Share
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="block text-gray-500">Report Type</span>
              <span className="font-medium">{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
            </div>
            <div>
              <span className="block text-gray-500">Date Range</span>
              <span className="font-medium">
                {format(new Date(report.startDate), 'MMM d, yyyy')} - {format(new Date(report.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div>
              <span className="block text-gray-500">Generated On</span>
              <span className="font-medium">{format(new Date(report.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <div>
              <span className="block text-gray-500">Format</span>
              <span className="font-medium uppercase">{report.format}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;