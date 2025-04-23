import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';

const MaintenanceTicketDetail = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`/api/maintenance/${ticketId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTicket(response.data);
      } catch (err) {
        console.error('Failed to fetch ticket details', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await axios.patch(
        `/api/maintenance/${ticketId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setTicket(response.data);
    } catch (err) {
      console.error('Failed to update ticket status', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Handle ticket deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this maintenance ticket? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/maintenance/${ticketId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        navigate('/maintenance');
      } catch (err) {
        console.error('Failed to delete ticket', err);
        alert('Failed to delete ticket. Please try again.');
      }
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await axios.post(
        `/api/maintenance/${ticketId}/comments`,
        { content: comment },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      setTicket(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));
      
      setComment('');
    } catch (err) {
      console.error('Failed to submit comment', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error || 'Ticket not found'}</div>
        <Link to="/maintenance" className="text-blue-600 hover:underline">
          Back to Maintenance List
        </Link>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Determine if user can edit or delete this ticket
  const canEditTicket = 
    user.role === 'admin' || 
    user.role === 'manager' || 
    (user.role === 'tenant' && ticket.status === 'new' && ticket.createdBy === user._id);

  const canDeleteTicket = user.role === 'admin' || user.role === 'manager';

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        {/* Header with ticket title and actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{ticket.title}</h1>
            <div className="flex items-center mt-2">
              <MaintenanceStatusBadge status={ticket.status} />
              
              {ticket.priority === 'high' || ticket.priority === 'emergency' ? (
                <span className={`ml-2 px-2 py-1 
                  ${ticket.priority === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}
                  text-xs rounded-full`}>
                  {ticket.priority === 'emergency' ? 'Emergency' : 'High Priority'}
                </span>
              ) : null}
              
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                {ticket.category}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {canEditTicket && (
              <Link
                to={`/maintenance/${ticketId}/edit`}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                Edit
              </Link>
            )}
            
            {canDeleteTicket && (
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            )}
            
            <Link
              to="/maintenance"
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Back
            </Link>
          </div>
        </div>
        
        {/* Property and date information */}
        <div className="mb-6">
          <p className="text-gray-600">
            <span className="font-medium">Property:</span> {ticket.property?.name || 'N/A'}
            {ticket.unit && ` - Unit ${ticket.unit}`}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Submitted by:</span> {ticket.createdByUser?.name || 'Unknown'}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Reported:</span> {formatDate(ticket.createdAt)}
          </p>
          {ticket.updatedAt !== ticket.createdAt && (
            <p className="text-gray-600">
              <span className="font-medium">Last updated:</span> {formatDate(ticket.updatedAt)}
            </p>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{ticket.description}</p>
        </div>
        
        {/* Images*/}
        {ticket.images && ticket.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {ticket.images.map((image, index) => (
                <a 
                  key={index} 
                  href={image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block h-32 w-full overflow-hidden rounded-lg"
                >
                  <img 
                    src={image} 
                    alt={`Maintenance issue ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Status update buttons for admin/property manager */}
        {(user.role === 'admin' || user.role === 'manager') && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.status !== 'new' && (
                <button
                  onClick={() => handleStatusUpdate('new')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Mark as New
                </button>
              )}
              
              {ticket.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                >
                  Mark In Progress
                </button>
              )}
              
              {ticket.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Mark as Completed
                </button>
              )}
              
              {ticket.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Cancel Ticket
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Comments section */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Comments</h3>
        
        {ticket.comments && ticket.comments.length > 0 ? (
          <ul className="space-y-4 mb-6">
            {ticket.comments.map(comment => (
              <li key={comment._id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="font-medium">{comment.user?.name || 'Unknown User'}</div>
                  <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-line">{comment.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic mb-6">No comments yet.</p>
        )}
        
        {/* Add comment form */}
        <form onSubmit={handleCommentSubmit}>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Add a Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your comment here..."
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={submittingComment || !comment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {submittingComment ? 'Submitting...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
);

export default MaintenanceTicketDetail;