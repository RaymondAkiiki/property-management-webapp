import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportsList from '../components/reports/ReportsList';
import ReportGenerator from '../components/reports/ReportGenerator';
import ReportFilters from '../components/reports/ReportFilters';
import { getReports, generateReport } from '../services/reportService';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    reportType: 'financial',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    propertyId: '',
  });
  const [activeTab, setActiveTab] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch reports');
      setLoading(false);
    }
  };

  const handleGenerateReport = async (reportData) => {
    try {
      setLoading(true);
      const newReport = await generateReport(reportData);
      setReports([newReport, ...reports]);
      toast.success('Report generated successfully');
      setLoading(false);
      setActiveTab('list');
    } catch (error) {
      toast.error('Failed to generate report');
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('list')}
          >
            View Reports
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === 'generate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={() => handleTabChange('generate')}
          >
            Generate New Report
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <>
          <ReportFilters filters={filters} onFilterChange={handleFilterChange} />
          <ReportsList 
            reports={reports} 
            loading={loading}
            onViewReport={handleViewReport}
            onRefresh={fetchReports}
          />
        </>
      )}

      {activeTab === 'generate' && (
        <ReportGenerator 
          onGenerate={handleGenerateReport} 
          loading={loading} 
        />
      )}
    </div>
  );
};

export default ReportsPage;