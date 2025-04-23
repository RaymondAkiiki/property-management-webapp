import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/common/PageHeader';

/**
 * PropertyDetail component for viewing complete property information
 */
const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load property details');
        setLoading(false);
        console.error('Error fetching property details:', err);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/properties/${id}`);
      navigate('/properties');
    } catch (err) {
      setError('Failed to delete property');
      console.error('Error deleting property:', err);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'occupied': 'bg-green-100 text-green-800',
      'vacant': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Mock data for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !property && loading) {
      // Set mock data for development
      setTimeout(() => {
        setProperty({
          _id: id,
          name: 'Sunset Apartments #301',
          address: '123 Main St, Apt 301',
          city: 'Cityville',
          state: 'ST',
          zipCode: '12345',
          type: 'Apartment',
          status: 'Occupied',
          bedrooms: 2,
          bathrooms: 1,
          sqft: 950,
          yearBuilt: 2010,
          description: 'Beautiful apartment with modern amenities, located in a quiet neighborhood with easy access to public transportation.',
          amenities: ['Pool', 'Gym', 'Parking', 'Laundry'],
          monthlyRent: 1200,
          securityDeposit: 1200,
          leaseTerms: '12 months',
          tenant: {
            _id: 't1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            moveInDate: '2024-01-01',
            leaseEnd: '2025-12-31'
          },
          maintenanceRequests: [
            {
              _id: 'm1',
              title: 'Leaking faucet',
              status: 'Completed',
              createdAt: '2024-03-15',
              completedAt: '2024-03-17'
            },
            {
              _id: 'm2',
              title: 'AC not working',
              status: 'Pending',
              createdAt: '2024-04-10',
              completedAt: null
            }
          ],
          documents: [
            {
              _id: 'd1',
              title: 'Lease Agreement',
              type: 'PDF',
              uploadedAt: '2024-01-01'
            },
            {
              _id: 'd2',
              title: 'Property Inspection',
              type: 'PDF',
              uploadedAt: '2024-01-02'
            }
          ],
          paymentHistory: [
            {
              _id: 'p1',
              amount: 1200,
              date: '2024-01-01',
              status: 'Paid'
            },
            {
              _id: 'p2',
              amount: 1200,
              date: '2024-02-01',
              status: 'Paid'
            },
            {
              _id: 'p3',
              amount: 1200,
              date: '2024-03-01',
              status: 'Paid'
            },
            {
              _id: 'p4',
              amount: 1200,
              date: '2024-04-01',
              status: 'Paid'
            }
          ],
          images: [
            '/api/placeholder/800/600',
            '/api/placeholder/800/600',
            '/api/placeholder/800/600'
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [id, loading, property]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded-md text-red-600">{error}</div>
        <div className="mt-4">
          <Link to="/properties" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 p-4 rounded-md text-yellow-600">
          Property not found
        </div>
        <div className="mt-4">
          <Link to="/properties" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={property.name}
        subtitle={`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}
        backLink="/properties"
        actions={
          <div className="flex space-x-2">
            <Link 
              to={`/properties/${id}/edit`} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button 
              onClick={() => setDeleteModalOpen(true)} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main property info */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Property Details</h2>
                {property.status && getStatusBadge(property.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-medium">{property.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="font-medium">${property.monthlyRent}/month</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-medium">{property.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Square Footage</p>
                  <p className="font-medium">{property.sqft} sq ft</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year Built</p>
                  <p className="font-medium">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Security Deposit</p>
                  <p className="font-medium">${property.securityDeposit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lease Terms</p>
                  <p className="font-medium">{property.leaseTerms}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{property.description}</p>
              </div>
              
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Property Images */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Property Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.images && property.images.map((image, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                    <img src={image} alt={`Property ${index + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
                {(!property.images || property.images.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No images available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Maintenance Requests */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Maintenance Requests</h2>
                <Link to={`/properties/${id}/maintenance/add`} className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  + Add Request
                </Link>
              </div>
              {property.maintenanceRequests && property.maintenanceRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reported
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {property.maintenanceRequests.map((request) => (
                        <tr key={request._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {request.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.completedAt ? new Date(request.completedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/maintenance/${request._id}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No maintenance requests found.</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Documents</h2>
                <Link to={`/properties/${id}/documents/upload`} className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  + Upload Document
                </Link>
              </div>
              {property.documents && property.documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {property.documents.map((document) => (
                        <tr key={document._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {document.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {document.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">
                              View
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents uploaded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Tenant Information */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Tenant Information</h2>
                {property.tenant ? (
                  <Link to={`/tenants/${property.tenant._id}`} className="text-blue-600 text-sm font-medium hover:text-blue-800">
                    View Profile
                  </Link>
                ) : (
                  <Link to={`/properties/${id}/add-tenant`} className="text-blue-600 text-sm font-medium hover:text-blue-800">
                    + Add Tenant
                  </Link>
                )}
              </div>
              
              {property.tenant ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">{property.tenant.name}</p>
                      <p className="text-sm text-gray-500">Current Tenant</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{property.tenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{property.tenant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Move-in Date</p>
                      <p className="font-medium">{new Date(property.tenant.moveInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lease End Date</p>
                      <p className="font-medium">{new Date(property.tenant.leaseEnd).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No tenant assigned</p>
                  <Link to={`/properties/${id}/add-tenant`} className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Assign Tenant
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Payment History */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Payment History</h2>
                <Link to={`/properties/${id}/payments/add`} className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  + Record Payment
                </Link>
              </div>
              
              {property.paymentHistory && property.paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {property.paymentHistory.map((payment) => (
                    <div key={payment._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                      <div>
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'Due' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No payment history available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Property</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this property? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;