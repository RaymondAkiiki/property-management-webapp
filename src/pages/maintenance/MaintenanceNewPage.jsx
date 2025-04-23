// src/pages/maintenance/MaintenanceNewPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import MaintenanceTicketForm from '../../components/maintenance/MaintenanceTicketForm';
import PageHeader from '../../components/common/PageHeader';

const MaintenanceNewPage = () => {
  const { propertyId } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="New Maintenance Request" 
        description="Submit a new maintenance request"
      />
      <MaintenanceTicketForm propertyId={propertyId} />
    </div>
  );
};

export default MaintenanceNewPage;