import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const MaintenanceTicketForm = ({ existingTicket, propertyId, onSubmit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!existingTicket;
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'plumbing',
    property: propertyId || '',
    unit: '',
    images: []
  });

  // Fetch properties if needed (for admin/property manager)
  useEffect(() => {
    const fetchProperties = async () => {
      if (user.role === 'admin' || user.role === 'manager') {
        try {
          const response = await axios.get('/api/properties', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setProperties(response.data);
        } catch (err) {
          console.error('Failed to fetch properties', err);
          setError('Failed to load properties');
        }
      }
    };
    
    // If editing, populate form with existing data
    if (isEdit) {
      setFormData({
        title: existingTicket.title || '',
        description: existingTicket.description || '',
        priority: existingTicket.priority || 'medium',
        category: existingTicket.category || 'plumbing',
        property: existingTicket.property?._id || existingTicket.property || '',
        unit: existingTicket.unit || '',
        images: existingTicket.images || []
      });
    }
    
    fetchProperties();
  }, [user.role, isEdit, existingTicket, propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    // Handle multiple file uploads
    const files = Array.from(e.target.files);
    
    // Preview logic would go here
    // For now, just store the files
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create form data for file uploads
      const ticketFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'images') {
          ticketFormData.append(key, formData[key]);
        }
      });
      
      // Append each image file
      formData.images.forEach(image => {
        if (image instanceof File) {
          ticketFormData.append('images', image);
        }
      });
      
      let response;
      if (isEdit) {
        response = await axios.put(
          `/api/maintenance/${existingTicket._id}`,
          ticketFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      } else {
        response = await axios.post(
          '/api/maintenance',
          ticketFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
      }
      
      if (onSubmit) {
        onSubmit(response.data);
      } else {
        navigate('/maintenance');
      }
    } catch (err) {
      console.error('Error submitting maintenance ticket', err);
      setError(err.response?.data?.message || 'Failed to submit maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? 'Update Maintenance Request' : 'New Maintenance Request'}
      </h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the issue"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide details about the maintenance issue"
          />
        </div>
        
        {/* Property selection (for admin/manager) */}
        {(user.role === 'admin' || user.role === 'manager') && !propertyId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property
            </label>
            <select
              name="property"
              value={formData.property}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Property</option>
              {properties.map(property => (
                <option key={property._id} value={property._id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number (if applicable)
          </label>
          <input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Unit or apartment number"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="appliance">Appliance</option>
              <option value="hvac">HVAC</option>
              <option value="structural">Structural</option>
              <option value="pest">Pest Control</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Images
          </label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleImageUpload}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload photos of the issue to help us diagnose the problem
          </p>
        </div>
        
        {/* Display existing images if editing */}
        {isEdit && formData.images.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative">
                  {typeof img === 'string' && (
                    <img 
                      src={img} 
                      alt={`Maintenance issue ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loading ? 'Submitting...' : isEdit ? 'Update Ticket' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceTicketForm;