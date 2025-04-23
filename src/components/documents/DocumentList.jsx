// /src/components/documents/DocumentList.jsx
import React, { useState, useEffect } from 'react';
import { FiFile, FiDownload, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../hooks/useToast';
import DocumentUpload from './DocumentUpload';
import { format } from 'date-fns';

const DocumentList = ({ relatedTo, relatedId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingDocument, setEditingDocument] = useState(null);
  const { showToast } = useToast();

  // Create a query string for filtering
  const getQueryString = () => {
    let query = '';
    
    if (relatedTo) query += `relatedTo=${relatedTo}&`;
    if (relatedId) query += `relatedId=${relatedId}&`;
    if (searchTerm) query += `search=${encodeURIComponent(searchTerm)}&`;
    if (categoryFilter) query += `category=${categoryFilter}`;
    
    return query;
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents?${getQueryString()}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast(
        error.response?.data?.message || 'Failed to fetch documents',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [relatedTo, relatedId, searchTerm, categoryFilter]);

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchDocuments();
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Find the document to get its file name
      const document = documents.find(doc => doc._id === documentId);
      
      link.href = url;
      link.setAttribute('download', document?.fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      showToast('Failed to download document', 'error');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      await api.delete(`/documents/${documentId}`);
      showToast('Document deleted successfully', 'success');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast(
        error.response?.data?.message || 'Failed to delete document',
        'error'
      );
    }
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/documents/${editingDocument._id}`, {
        title: editingDocument.title,
        description: editingDocument.description,
        category: editingDocument.category
      });
      
      showToast('Document updated successfully', 'success');
      setEditingDocument(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      showToast(
        error.response?.data?.message || 'Failed to update document',
        'error'
      );
    }
  };

  const getFileIcon = (fileType) => {
    return <FiFile className="w-6 h-6" />;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      lease: 'Lease',
      receipt: 'Receipt',
      invoice: 'Invoice',
      contract: 'Contract',
      maintenance: 'Maintenance',
      other: 'Other'
    };
    
    return labels[category] || 'Other';
  };

  const getCategoryColor = (category) => {
    const colors = {
      lease: 'bg-purple-100 text-purple-800',
      receipt: 'bg-green-100 text-green-800',
      invoice: 'bg-orange-100 text-orange-800',
      contract: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Documents</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showUpload ? 'Cancel Upload' : 'Upload Document'}
        </button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <DocumentUpload
            relatedTo={relatedTo}
            relatedId={relatedId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {editingDocument && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-medium mb-3">Edit Document</h3>
          <form onSubmit={handleUpdateDocument}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingDocument.title}
                onChange={(e) =>
                  setEditingDocument({
                    ...editingDocument,
                    title: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editingDocument.description || ''}
                onChange={(e) =>
                  setEditingDocument({
                    ...editingDocument,
                    description: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={editingDocument.category}
                onChange={(e) =>
                  setEditingDocument({
                    ...editingDocument,
                    category: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="lease">Lease</option>
                <option value="receipt">Receipt</option>
                <option value="invoice">Invoice</option>
                <option value="contract">Contract</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingDocument(null)}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Search documents..."
          />
        </div>
        
        <div className="relative sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiFilter className="text-gray-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md appearance-none"
          >
            <option value="">All Categories</option>
            <option value="lease">Lease</option>
            <option value="receipt">Receipt</option>
            <option value="invoice">Invoice</option>
            <option value="contract">Contract</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No documents found.</p>
          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Upload your first document
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                        {getFileIcon(document.fileType)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{document.title}</div>
                        {document.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{document.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(document.category)}`}>
                      {getCategoryLabel(document.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(document.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(document.fileSize / 1024).toFixed(1)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownload(document._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Download"
                      >
                        <FiDownload />
                      </button>
                      <button
                        onClick={() => setEditingDocument(document)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(document._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentList;