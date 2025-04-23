
// src/pages/maintenance/MaintenanceEditPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MaintenanceTicketForm from '../../components/maintenance/MaintenanceTicketForm';
import PageHeader from '../../components/common/PageHeader';

const MaintenanceEditPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await axios.get(`/api/maintenance/${ticketId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTicket(response.data);
      } catch (err) {
        console.error('Failed to fetch ticket', err);
        setError('Failed to load maintenance ticket. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  const handleSubmit = () => {
    navigate(`/maintenance/${ticketId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error || 'Ticket not found'}</div>
          <button
            onClick={() => navigate('/maintenance')}
            className="text-blue-600 hover:underline"
          >
            Back to Maintenance List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Edit Maintenance Request" 
        description="Update maintenance request details"
      />
      <MaintenanceTicketForm 
        existingTicket={ticket} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default MaintenanceEditPage;