import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';

const MaintenanceTicketList = ({ propertyId }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    property: propertyId || ''
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.property) queryParams.append('property', filters.property);
      
      // Different endpoints based on user role
      let endpoint = '/api/maintenance';
      if (user.role === 'tenant') {
        endpoint = '/api/maintenance/tenant';
      } else if (propertyId) {
        endpoint = `/api/maintenance/property/${propertyId}`;
      }
      
      const response = await axios.get(`${endpoint}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch maintenance tickets', err);
      setError('Failed to load maintenance tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters, propertyId, user.role]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to handle status updates (for admin/manager only)
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await axios.patch(
        `/api/maintenance/${ticketId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      // Update the ticket status in the local state
      setTickets(prev => 
        prev.map(ticket => 
          ticket._id === ticketId 
            ? { ...ticket, status: newStatus } 
            : ticket
        )
      );
    } catch (err) {
      console.error('Failed to update ticket status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading && tickets.length === 0) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">Maintenance Tickets</h2>
          
          {/* Filter controls */}
          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          {/* Create new ticket button */}
          <Link 
            to={propertyId ? `/properties/${propertyId}/maintenance/new` : '/maintenance/new'} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit New Request
          </Link>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      </div>
      
      {tickets.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No maintenance tickets found.</p>
          <p className="mt-2">
            <Link to="/maintenance/new" className="text-blue-500 hover:underline">
              Submit a new maintenance request
            </Link>
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {tickets.map(ticket => (
            <li key={ticket._id} className="p-4 hover:bg-gray-50">
              <Link to={`/maintenance/${ticket._id}`} className="block">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">{ticket.title}</h3>
                      <MaintenanceStatusBadge status={ticket.status} />
                      
                      {ticket.priority === 'high' && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          High Priority
                        </span>
                      )}
                      
                      {ticket.priority === 'emergency' && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {ticket.property?.name || 'Property'}{ticket.unit ? ` - Unit ${ticket.unit}` : ''}
                    </p>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end text-sm text-gray-500 mt-2 md:mt-0">
                    <span>Created: {formatDate(ticket.createdAt)}</span>
                    {ticket.updatedAt !== ticket.createdAt && (
                      <span>Updated: {formatDate(ticket.updatedAt)}</span>
                    )}
                  </div>
                </div>
              </Link>
              
              {/* Status update buttons for admin/property manager */}
              {(user.role === 'admin' || user.role === 'manager') && (
                <div className="mt-3 flex gap-2 justify-end">
                  {ticket.status === 'new' && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleStatusUpdate(ticket._id, 'in_progress');
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                    >
                      Mark In Progress 
                    </button>
                  )}
                  
                  {(ticket.status === 'new' || ticket.status === 'in_progress') && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleStatusUpdate(ticket._id, 'completed');
                      }}
                      className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200"
                    >
                      Mark Completed
                    </button>
                  )}
                  
                  {ticket.status !== 'cancelled' && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm('Are you sure you want to cancel this ticket?')) {
                          handleStatusUpdate(ticket._id, 'cancelled');
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MaintenanceTicketList;