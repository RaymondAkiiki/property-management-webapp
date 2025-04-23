// src/pages/maintenance/MaintenanceListPage.jsx
import React from 'react';
import MaintenanceTicketList from '../../components/maintenance/MaintenanceTicketList';
import PageHeader from '../../components/common/PageHeader';

const MaintenanceListPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Maintenance Requests" 
        description="View and manage maintenance requests for your properties"
      />
      <MaintenanceTicketList />
    </div>
  );
};

export default MaintenanceListPage;


